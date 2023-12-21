import { YaksokError } from '../../errors.ts'
import {
    Expression,
    Operator,
    Keyword,
    Indent,
    StringValue,
    NumberValue,
    EOL,
    Node,
} from '../../node/index.ts'
import { lexFunctionArgument } from './lexFunctionArgument.ts'
import {
    isValidCharForKeyword,
    isValidFirstCharForKeyword,
} from './isValidCharForKeyword.ts'

export class Tokenizer {
    functionHeaders: Node[][] | undefined = undefined
    tokens: Node[] = []
    chars: string[]

    static OPERATORS = ['+', '-', '*', '/', '>', '=', '<', '~']
    static EXPRESSIONS = ['{', '}', ':', '[', ']', ',', '(', ')']

    constructor(code: string) {
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

            if (char === '\n') {
                this.EOL()
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

            throw new YaksokError('UNEXPECTED_CHAR', undefined, {
                token: char,
            })
        }
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

    comment() {
        while (this.chars.length && this.chars[0] !== '\n') {
            this.chars.shift()
        }
    }

    indent() {
        let spaces = 0
        while (this.chars[0] === ' ') {
            this.chars.shift()
            spaces++
        }

        if (!(this.tokens[this.tokens.length - 1] instanceof EOL)) {
            return
        }

        if (spaces % 4) throw new YaksokError('INDENT_IS_NOT_MULTIPLE_OF_4')
        this.tokens.push(new Indent(spaces / 4))
    }

    EOL() {
        this.chars.shift()
        if (!(this.tokens[this.tokens.length - 1] instanceof EOL))
            this.tokens.push(new EOL())
    }

    number() {
        let number = this.chars.shift()!
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

            number += this.chars.shift()
        }

        this.tokens.push(new NumberValue(parseFloat(number)))
    }

    string() {
        this.chars.shift()
        let word = ''

        while (true) {
            const nextChar = this.chars.shift()

            if (nextChar === '"') break
            if (!nextChar) throw new YaksokError('UNEXPECTED_END_OF_CODE')

            word += nextChar
        }

        this.tokens.push(new StringValue(word))
    }

    keyword() {
        let word = ''

        while (this.chars.length && isValidCharForKeyword(this.chars[0])) {
            word += this.chars.shift()
        }

        this.tokens.push(new Keyword(word))
    }

    operator() {
        const char = this.chars.shift()!
        this.tokens.push(new Operator(char))
    }

    expression() {
        const char = this.chars.shift()!
        this.tokens.push(new Expression(char))
    }

    preprocess(code: string) {
        const trimmed = '\n' + code.trim() + '\n'
        return [...trimmed]
    }

    postprocess() {
        const { functionHeaders, tokens } = lexFunctionArgument(this.tokens)

        this.functionHeaders = functionHeaders
        this.tokens = tokens

        return tokens
    }
}

export function tokenize(code: string) {
    const tokenizer = new Tokenizer(code)
    return {
        tokens: tokenizer.tokens!,
        functionHeaders: tokenizer.functionHeaders!,
    }
}
