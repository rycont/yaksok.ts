import { NotAcceptableSignal } from './signal.ts'
import { TOKEN_TYPE } from './token.ts'

const OPERATORS = [
    '+',
    '-',
    '*',
    '/',
    '>',
    '=',
    '<',
    '~',
    '%',
    '**',
    '//',
    '<=',
    '>=',
]

const IDENTIFIER_STARTER_REGEX = /[a-zA-Z_0-9가-힣ㄱ-ㅎ]/
const IDENTIFIER_REGEX = /[a-zA-Z_가-힣ㄱ-ㅎ]/

export const RULES: {
    starter: RegExp | string[]
    parse: (
        view: () => string | undefined,
        shift: () => string | undefined,
    ) => string
    type: TOKEN_TYPE
}[] = [
    {
        type: TOKEN_TYPE.NUMBER,
        starter: /\d/,
        parse: (view, shift) => {
            let value = shift()!

            while (view()?.match(/\d/)) {
                value += shift()!
            }

            return value
        },
    },
    {
        type: TOKEN_TYPE.NEW_LINE,
        starter: ['\n'],
        parse: (_, shift) => {
            shift()
            return '\n'
        },
    },
    {
        type: TOKEN_TYPE.SPACE,
        starter: /\s/,
        parse: (view, shift) => {
            shift()
            let spaces = 1

            while (view() && [' ', '\t'].includes(view()!)) {
                if (view() === '\t') {
                    spaces += 4
                } else {
                    spaces++
                }

                shift()
            }

            return ' '.repeat(spaces)
        },
    },
    {
        type: TOKEN_TYPE.FFI_BODY,
        starter: ['*'],
        parse: (_, shift) => {
            const starter = '***\n'

            for (const char of starter) {
                if (char !== shift()) {
                    throw new NotAcceptableSignal()
                }
            }

            let code = starter

            while (true) {
                code += shift()!

                if (code.endsWith('\n***')) {
                    break
                }
            }

            return code
        },
    },
    {
        type: TOKEN_TYPE.OPERATOR,
        starter: OPERATORS.map((o) => o[0]),
        parse: (_view, shift) => {
            let value = shift()!

            while (true) {
                const appliable = getAppliableOperators(value)

                const hasMatched = OPERATORS.includes(value)
                const isOnlyPossibility =
                    hasMatched &&
                    getAppliableOperators(value + _view()).length === 0

                if (isOnlyPossibility) {
                    break
                }

                if (appliable.length > 1) {
                    value += shift()!
                    continue
                }

                throw new NotAcceptableSignal()
            }

            return value
        },
    },
    {
        type: TOKEN_TYPE.IDENTIFIER,
        starter: IDENTIFIER_STARTER_REGEX,
        parse: (view, shift) => {
            let value = shift()!

            while (view()?.match(IDENTIFIER_REGEX)) {
                value += shift()!
            }

            return value
        },
    },
    {
        type: TOKEN_TYPE.COMMA,
        starter: [','],
        parse: (_, shift) => {
            shift()
            return ','
        },
    },
    {
        type: TOKEN_TYPE.OPENING_PARENTHESIS,
        starter: ['('],
        parse: (_, shift) => {
            shift()
            return '('
        },
    },
    {
        type: TOKEN_TYPE.CLOSING_PARENTHESIS,
        starter: [')'],
        parse: (_, shift) => {
            shift()
            return ')'
        },
    },
    {
        type: TOKEN_TYPE.OPENING_BRACKET,
        starter: ['['],
        parse: (_, shift) => {
            shift()
            return '['
        },
    },
    {
        type: TOKEN_TYPE.CLOSING_BRACKET,
        starter: [']'],
        parse: (_, shift) => {
            shift()
            return ']'
        },
    },
    {
        type: TOKEN_TYPE.STRING,
        starter: ['"', "'"],
        parse: (view, shift) => {
            const quote = shift()!
            let value = quote

            while (view() !== quote) {
                value += shift()!
            }

            value += shift()

            return value
        },
    },
    {
        type: TOKEN_TYPE.COLON,
        starter: [':'],
        parse: (_, shift) => {
            shift()
            return ':'
        },
    },
    {
        type: TOKEN_TYPE.LINE_COMMENT,
        starter: ['#'],
        parse: (view, shift) => {
            let value = shift()!

            while (
                view() &&
                view() !== '\n' &&
                view() !== '\r' &&
                view() !== undefined
            ) {
                value += shift()!
            }

            return value
        },
    },
    {
        type: TOKEN_TYPE.MENTION,
        starter: ['@'],
        parse: (view, shift) => {
            let value = shift()!

            while (view()?.match(IDENTIFIER_REGEX)) {
                value += shift()!
            }

            return value
        },
    },
]

function getAppliableOperators(prefix: string) {
    return OPERATORS.filter((operator) => operator.startsWith(prefix))
}
