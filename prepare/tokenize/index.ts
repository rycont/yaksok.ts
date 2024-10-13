import {
    IndentIsNotMultipleOf4Error,
    UnexpectedEndOfCodeError,
    UnexpectedCharError,
} from '../../error/index.ts'
import {
    StringValue,
    NumberValue,
    Expression,
    Operator,
    Identifier,
    Indent,
    EOL,
    Node,
    FFIBody,
} from '../../node/index.ts'
import { lex } from './lex.ts'
import {
    isValidFirstCharForKeyword,
    isValidCharForKeyword,
} from './isValidCharForKeyword.ts'

export class Tokenizer {
    functionHeaders: Node[][] | undefined = undefined
    ffiHeaders: Node[][] | undefined = undefined

    tokens: Node[] = []
    chars: string[]

    line = 0
    column = 0

    static OPERATORS = ['+', '-', '*', '/', '>', '=', '<', '~']
    static EXPRESSIONS = ['{', '}', ':', '[', ']', ',', '(', ')', '@']

    constructor(code: string, private disablePosition = false) {
        this.chars = this.preprocess(code)
        this.tokenize()
        this.postprocess()
    }

    tokenize() {
        while (this.chars.length) {
            const char = this.chars[0]

            if (char === '#') {
                this.comment()
                continue
            }

            if (char === ' ') {
                this.indent()
                continue
            }

            if (char === '\n' || char === '\r' || char === '\r\n') {
                this.EOL()
                continue
            }

            if (this.isFFI()) {
                this.ffi()
                continue
            }

            if (this.canBeFisrtCharOfNumber(char)) {
                this.number()
                continue
            }

            if (char === '"') {
                this.string()
                continue
            }

            if (isValidFirstCharForKeyword(char)) {
                this.keyword()
                continue
            }

            if (Tokenizer.OPERATORS.includes(char)) {
                this.operator()
                continue
            }

            if (Tokenizer.EXPRESSIONS.includes(char)) {
                this.expression()
                continue
            }

            console.log({ char })

            throw new UnexpectedCharError({
                position: this.position,
                resource: {
                    char,
                    parts: '코드',
                },
            })
        }
    }

    isFFI() {
        const isFFIBlock =
            this.chars[0] === '*' &&
            this.chars[1] === '*' &&
            this.chars[2] === '*'

        return isFFIBlock
    }

    isNumeric(char: string) {
        return '0' <= char && char <= '9'
    }

    canBeFisrtCharOfNumber(char: string) {
        if ('0' <= char && char <= '9') return true
        if (
            char === '-' &&
            this.chars.length > 1 &&
            this.isNumeric(this.chars[1]) &&
            this.tokens.length &&
            (this.tokens[this.tokens.length - 1] instanceof Operator ||
                this.tokens[this.tokens.length - 1] instanceof Expression)
        )
            return true

        return false
    }

    ffi() {
        this.shift()
        this.shift()
        this.shift()

        let ffi = ''

        while (true) {
            const nextChar = this.shift()

            if (
                nextChar === '*' &&
                this.chars[0] === '*' &&
                this.chars[1] === '*'
            )
                break

            ffi += nextChar
        }

        this.tokens.push(new FFIBody(ffi, this.position))
        this.shift()
        this.shift()
    }

    comment() {
        while (this.chars.length && this.chars[0] !== '\n') {
            this.shift()
        }
    }

    indent() {
        let spaces = 0
        while (this.chars[0] === ' ') {
            this.shift()
            spaces++
        }

        if (!(this.tokens[this.tokens.length - 1] instanceof EOL)) {
            return
        }

        if (spaces % 4)
            throw new IndentIsNotMultipleOf4Error({
                position: this.position,
                resource: {
                    indent: spaces,
                },
            })
        this.tokens.push(new Indent(spaces / 4, this.position))
    }

    EOL() {
        this.shift()
        if (!(this.tokens[this.tokens.length - 1] instanceof EOL))
            this.tokens.push(new EOL(this.position))
    }

    number() {
        let number = this.shift()!
        let hasDot = false

        while (true) {
            const isNum =
                this.chars.length &&
                '0' <= this.chars[0] &&
                this.chars[0] <= '9'
            const isAllowedDot =
                this.chars.length && this.chars[0] === '.' && !hasDot

            if (!isNum && !isAllowedDot) break
            if (isAllowedDot) hasDot = true

            number += this.shift()
        }

        this.tokens.push(new NumberValue(parseFloat(number), this.position))
    }

    string() {
        this.shift()
        let word = ''

        while (true) {
            const nextChar = this.shift()
            if (nextChar === '"') break

            word += nextChar
        }

        this.tokens.push(new StringValue(word, this.position))
    }

    keyword() {
        let word = ''

        while (this.chars.length && isValidCharForKeyword(this.chars[0])) {
            word += this.shift()
        }

        this.tokens.push(new Identifier(word, this.position))
    }

    operator() {
        const char = this.shift()!
        this.tokens.push(new Operator(char, this.position))
    }

    expression() {
        const char = this.shift()!
        this.tokens.push(new Expression(char, this.position))
    }

    preprocess(code: string) {
        const trimmed = '\n' + code + '\n'
        return [...trimmed]
    }

    postprocess() {
        const { functionHeaders, ffiHeaders, tokens } = lex(this.tokens)

        this.functionHeaders = functionHeaders
        this.ffiHeaders = ffiHeaders
        this.tokens = tokens

        return tokens
    }

    shift() {
        const char = this.chars.shift()
        if (!char)
            throw new UnexpectedEndOfCodeError({
                position: this.position,
                resource: {
                    parts: '코드',
                },
            })

        if (char === '\n') {
            this.line++
            this.column = 1
        } else {
            this.column++
        }

        return char
    }

    get position() {
        if (this.disablePosition) return undefined

        return {
            line: this.line,
            column: this.column,
        }
    }
}

export function tokenize(code: string, disablePosition = false) {
    const tokenizer = new Tokenizer(code, disablePosition)

    return {
        tokens: tokenizer.tokens!,
        functionHeaders: tokenizer.functionHeaders!,
        ffiHeaders: tokenizer.ffiHeaders!,
    }
}

export type TokenizeResult = ReturnType<typeof tokenize>
