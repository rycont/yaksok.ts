import {
    Block,
    DeclareFunction,
    Identifier,
    Node,
    Print,
    SetVariable,
} from '@dalbit-yaksok/core'
import { ColorPart } from './type.ts'

enum SCOPE {
    KEYWORD = 'keyword',
    VARIABLE_NAME = 'variable.name',
    IDENTIFIER = 'comment',
}

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

    console.log('Unknown node:', node)

    return []
}

function block(ast: Block): ColorPart[] {
    return ast.children.flatMap(node)
}

function declareFunction(current: DeclareFunction) {
    const parts: ColorPart[] = []

    if (current.position) {
        parts.push({
            position: current.position,
            scopes: SCOPE.KEYWORD,
        })
    }

    return parts.concat(block(current.body))
}

function setVariable(current: SetVariable) {
    const parts: ColorPart[] = []

    if (current.position) {
        parts.push({
            position: current.position,
            scopes: SCOPE.VARIABLE_NAME,
        })
    }

    return parts.concat(node(current.value))
}

function identifier(current: Identifier) {
    console.log(current)
    if (current.position) {
        return [
            {
                position: current.position,
                scopes: SCOPE.IDENTIFIER,
            },
        ]
    }

    return []
}

function visitPrint(current: Print) {
    return node(current.value)
}

export { node as nodeToColorTokens }
