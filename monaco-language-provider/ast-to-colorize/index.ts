import {
    Block,
    DeclareFunction,
    EOL,
    Formula,
    FunctionInvoke,
    Identifier,
    IfStatement,
    IndexFetch,
    ListLiteral,
    ListLoop,
    Node,
    NumberLiteral,
    Operator,
    Print,
    SetToIndex,
    SetVariable,
    StringLiteral,
    TOKEN_TYPE,
    ValueWithParenthesis,
} from '@dalbit-yaksok/core'
import { ColorPart } from '../type.ts'
import { SCOPE } from './scope.ts'
import { parseFunctionDeclareHeader } from './declare-function.ts'
import { parseListLoopHeader } from './list-loop.ts'

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

    if (node instanceof IfStatement) {
        return ifStatement(node)
    }

    if (node instanceof ListLoop) {
        return listLoop(node)
    }

    if (node instanceof ListLiteral) {
        return listLiteral(node)
    }

    if (node instanceof IndexFetch) {
        return indexFetch(node)
    }

    if (node instanceof SetToIndex) {
        return setToIndex(node)
    }

    if (node instanceof EOL) {
        return []
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

function ifStatement(current: IfStatement): ColorPart[] {
    let colorParts: ColorPart[] = [
        {
            position: current.tokens[0].position,
            scopes: SCOPE.KEYWORD,
        },
    ]

    const newLineIndex = current.tokens.findIndex(
        (token) => token.type === TOKEN_TYPE.NEW_LINE,
    )

    const ifStatementHeaderEnder: ColorPart = {
        position: current.tokens[newLineIndex - 1].position,
        scopes: SCOPE.KEYWORD,
    }

    colorParts.push(ifStatementHeaderEnder)

    for (const caseBlock of current.cases) {
        if (caseBlock.condition) {
            colorParts = colorParts.concat(node(caseBlock.condition))
        }

        colorParts = colorParts.concat(block(caseBlock.body))
    }

    colorParts = colorParts.toSorted(
        (a, b) => a.position.column - b.position.column,
    )

    return colorParts
}

function listLoop(current: ListLoop): ColorPart[] {
    let colorParts = parseListLoopHeader(current)

    colorParts = colorParts.concat(node(current.list))
    colorParts = colorParts.concat(block(current.body))

    colorParts = colorParts.toSorted(
        (a, b) => a.position.column - b.position.column,
    )

    return colorParts
}

function listLiteral(current: ListLiteral): ColorPart[] {
    const itemTokens = new Set(current.items.flatMap((item) => item.tokens))
    const allTokens = new Set(current.tokens)

    const nonItemTokens = allTokens.difference(itemTokens)
    const commas = Array.from(nonItemTokens).filter(
        (token) => token.type === TOKEN_TYPE.COMMA,
    )

    let listColorParts: ColorPart[] = []

    listColorParts.push({
        position: current.tokens[0].position,
        scopes: SCOPE.PARENTHESIS,
    })

    const commaColorParts: ColorPart[] = commas.map((comma) => ({
        position: comma.position,
        scopes: SCOPE.PUNCTUATION,
    }))

    listColorParts = listColorParts.concat(commaColorParts)

    listColorParts.push({
        position: current.tokens.slice(-1)[0].position,
        scopes: SCOPE.PARENTHESIS,
    })

    const itemColorParts = current.items.flatMap(node)

    const colorParts = listColorParts
        .concat(itemColorParts)
        .toSorted((a, b) => a.position.column - b.position.column)

    return colorParts
}

function indexFetch(current: IndexFetch): ColorPart[] {
    let colorParts: ColorPart[] = []

    colorParts = colorParts.concat(node(current.list))
    colorParts = colorParts.concat(node(current.index))

    return colorParts
}

function setToIndex(current: SetToIndex): ColorPart[] {
    let colorParts: ColorPart[] = []

    colorParts = colorParts.concat(node(current.target))
    colorParts = colorParts.concat(node(current.value))

    colorParts = colorParts.toSorted(
        (a, b) => a.position.column - b.position.column,
    )

    return colorParts
}

export { node as nodeToColorTokens }
