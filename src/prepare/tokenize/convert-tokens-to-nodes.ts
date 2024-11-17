import { Expression, Identifier, Node, Operator } from '../../node/base.ts'
import { FFIBody } from '../../node/ffi.ts'
import { Mention } from '../../node/mention.ts'
import { Indent, EOL } from '../../node/misc.ts'
import { NumberValue, StringValue } from '../../node/primitive.ts'
import { Token, TOKEN_TYPE } from './token.ts'

export function convertTokensToNodes(tokens: Token[]): Node[] {
    return tokens.map(mapTokenToNode).filter(Boolean) as Node[]
}

function mapTokenToNode(token: Token) {
    switch (token.type) {
        case TOKEN_TYPE.NUMBER:
            return new NumberValue(parseFloat(token.value), token.position)
        case TOKEN_TYPE.STRING:
            return new StringValue(token.value.slice(1, -1), token.position)
        case TOKEN_TYPE.OPERATOR:
            return new Operator(token.value, token.position)
        case TOKEN_TYPE.SPACE:
            return null
        case TOKEN_TYPE.INDENT:
            return new Indent(token.value.length, token.position)
        case TOKEN_TYPE.IDENTIFIER:
            return new Identifier(token.value, token.position)
        case TOKEN_TYPE.COMMA:
        case TOKEN_TYPE.OPENING_PARENTHESIS:
        case TOKEN_TYPE.CLOSING_PARENTHESIS:
        case TOKEN_TYPE.OPENING_BRACKET:
        case TOKEN_TYPE.CLOSING_BRACKET:
        case TOKEN_TYPE.COLON:
            return new Expression(token.value, token.position)
        case TOKEN_TYPE.FFI_BODY:
            return new FFIBody(token.value.slice(3, -3), token.position)
        case TOKEN_TYPE.NEW_LINE:
            return new EOL(token.position)
        case TOKEN_TYPE.LINE_COMMENT:
            return null
        case TOKEN_TYPE.MENTION:
            return new Mention(token.value, token.position)
    }
}
