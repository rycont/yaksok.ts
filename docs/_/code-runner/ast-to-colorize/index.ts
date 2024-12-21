import {
    Block,
    DeclareFunction,
    Formula,
    FunctionInvoke,
    Identifier,
    Node,
    NumberLiteral,
    Operator,
    Print,
    SetVariable,
    StringLiteral,
    TOKEN_TYPE,
    ValueWithParenthesis,
} from '@dalbit-yaksok/core'
import { ColorPart } from '../type.ts'
import { SCOPE } from './scope.ts'
import { parseFunctionDeclareHeader } from './declare-function.ts'

function node(node: Node): ColorPart[] {
    if (node instanceof Block) {
        return block(node)
    }

    if (node instanceof DeclareFunction) {
        return declareFunction(node)
    }

    if (node instanceof SetVariable) {
        return setVariable(node)
    }

    if (node instanceof Identifier) {
        return identifier(node)
    }

    if (node instanceof Print) {
        return visitPrint(node)
    }

    if (node instanceof Formula) {
        return formula(node)
    }

    if (node instanceof Operator) {
        return operator(node)
    }

    if (node instanceof ValueWithParenthesis) {
        return valueWithParenthesis(node)
    }

    if (node instanceof NumberLiteral) {
        return numberLiteral(node)
    }

    if (node instanceof FunctionInvoke) {
        return functionInvoke(node)
    }

    if (node instanceof StringLiteral) {
        return stringLiteral(node)
    }

    console.log('Unknown node:', node)

    return []
}

function block(ast: Block): ColorPart[] {
    return ast.children.flatMap(node)
}

function declareFunction(current: DeclareFunction) {
    const headerParts: ColorPart[] = parseFunctionDeclareHeader(current.tokens)
    return headerParts.concat(block(current.body))
}

function setVariable(current: SetVariable) {
    const firstIdentifier = current.tokens.find(
        (token) => token.type === TOKEN_TYPE.IDENTIFIER,
    )

    const firstColon = current.tokens.find(
        (token) => token.type === TOKEN_TYPE.COLON,
    )

    const variableName: ColorPart[] = [
        {
            position: firstIdentifier!.position,
            scopes: SCOPE.VARIABLE_NAME,
        },
        {
            position: firstColon!.position,
            scopes: SCOPE.PUNCTUATION,
        },
    ]

    return variableName.concat(node(current.value))
}

function identifier(current: Identifier) {
    return [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.IDENTIFIER,
        },
    ]
}

function visitPrint(current: Print) {
    const child = node(current.value)

    return child.concat([
        {
            position: current.tokens.slice(-1)[0].position,
            scopes: SCOPE.KEYWORD,
        },
    ])
}

function formula(current: Formula) {
    return current.terms.flatMap(node)
}

function operator(current: Operator) {
    return [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.OPERATOR,
        },
    ]
}

function valueWithParenthesis(current: ValueWithParenthesis): ColorPart[] {
    return [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.PARENTHESIS,
        } as ColorPart,
    ]
        .concat(node(current.value))
        .concat([
            {
                position: current.tokens.slice(-1)[0].position,
                scopes: SCOPE.PARENTHESIS,
            },
        ])
}

function numberLiteral(current: NumberLiteral): ColorPart[] {
    return [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.NUMBER,
        },
    ]
}

function functionInvoke(current: FunctionInvoke): ColorPart[] {
    let isInParameter = false

    let colorParts: ColorPart[] = []

    for (let i = 0; i < current.tokens.length; i++) {
        const token = current.tokens[i]

        if (token.type === TOKEN_TYPE.OPENING_PARENTHESIS) {
            isInParameter = true

            colorParts.push({
                position: token.position,
                scopes: SCOPE.PARENTHESIS,
            })

            continue
        }

        if (token.type === TOKEN_TYPE.CLOSING_PARENTHESIS) {
            isInParameter = false

            colorParts.push({
                position: token.position,
                scopes: SCOPE.PARENTHESIS,
            })

            continue
        }

        if (isInParameter) {
            continue
        }

        colorParts.push({
            position: token.position,
            scopes: SCOPE.CALLABLE,
        })
    }

    for (const paramName in current.params) {
        colorParts = colorParts.concat(node(current.params[paramName]))
    }

    colorParts = colorParts.toSorted(
        (a, b) => a.position.column - b.position.column,
    )

    return colorParts
}

function stringLiteral(current: StringLiteral): ColorPart[] {
    return [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.STRING,
        },
    ]
}

export { node as nodeToColorTokens }
