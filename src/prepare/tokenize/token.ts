import type { Position } from '../../type/position.ts'

export enum TOKEN_TYPE {
    NUMBER = 'NUMBER',
    STRING = 'STRING',
    OPERATOR = 'OPERATOR',
    SPACE = 'SPACE',
    IDENTIFIER = 'IDENTIFIER',
    COMMA = 'COMMA',
    OPENING_PARENTHESIS = 'OPENING_PARENTHESIS',
    CLOSING_PARENTHESIS = 'CLOSING_PARENTHESIS',
    OPENING_BRACKET = 'OPENING_BRACKET',
    CLOSING_BRACKET = 'CLOSING_BRACKET',
    FFI_BODY = 'FFI_BODY',
    NEW_LINE = 'NEW_LINE',
    COLON = 'COLON',
    LINE_COMMENT = 'LINE_COMMENT',
    MENTION = 'MENTION',
}

export interface Token {
    type: TOKEN_TYPE
    value: string
    position: Position
}
