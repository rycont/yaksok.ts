import { Expression, Node } from '../node/index.ts'

export enum BRACKET_TYPE {
    OPENING = 'OPENING',
    CLOSING = 'CLOSING',
}

export function isBracket(token: Node) {
    if (!(token instanceof Expression)) {
        return false
    }

    if (token.value === '[') {
        return BRACKET_TYPE.OPENING
    }

    if (token.value === ']') {
        return BRACKET_TYPE.CLOSING
    }

    return false
}

export function isParentheses(token: Node) {
    if (!(token instanceof Expression)) {
        return false
    }

    if (token.value === '(') {
        return BRACKET_TYPE.OPENING
    }

    if (token.value === ')') {
        return BRACKET_TYPE.CLOSING
    }

    return false
}
