import { YaksokError } from '../errors.ts'
import {
    Expression,
    Operator,
    Keyword,
    Indent,
    StringValue,
    NumberValue,
    EOL,
    Node,
} from '../node/index.ts'
import { convertFunctionArgumentsToVariable } from './convertFunctionArgumentsToVariable.ts'
import {
    isValidCharForKeyword,
    isValidFirstCharForKeyword,
} from './isValidCharForKeyword.ts'

export function tokenize(_code: string): Node[] {
    const tokens: Node[] = []
    const code = preprocessor(_code)
    const chars = [...code]

    while (chars.length) {
        const char = chars.shift()!

        // Comment
        if (char === '#') {
            while (chars.length && chars[0] !== '\n') {
                chars.shift()
            }

            continue
        }

        // Indent and Whitespace
        if (char === ' ') {
            if (!(tokens[tokens.length - 1] instanceof EOL)) continue

            let spaces = 1
            while (chars[0] === ' ') {
                chars.shift()
                spaces++
            }

            if (spaces % 4) throw new YaksokError('INDENT_IS_NOT_MULTIPLE_OF_4')

            tokens.push(new Indent(spaces / 4))
            continue
        }

        // EOL
        if (char === '\n') {
            if (tokens[tokens.length - 1] instanceof EOL) continue
            tokens.push(new EOL())
            continue
        }

        // Number
        if (
            ('0' <= char && char <= '9') ||
            (char === '-' &&
                chars.length > 2 &&
                '0' <= chars[0] &&
                chars[0] <= '9')
        ) {
            let number = char
            let hasDot = false

            while (true) {
                const isNum = chars.length && '0' <= chars[0] && chars[0] <= '9'
                const isAllowedDot = chars.length && chars[0] === '.' && !hasDot

                if (!isNum && !isAllowedDot) break
                if (isAllowedDot) hasDot = true

                number += chars.shift()
            }

            tokens.push(new NumberValue(parseFloat(number)))

            continue
        }

        // String
        if (char === '"') {
            let word = ''

            while (true) {
                const nextChar = chars.shift()

                if (nextChar === undefined)
                    throw new YaksokError('UNEXPECTED_END_OF_CODE')
                if (nextChar === '"') break

                word += nextChar
            }

            tokens.push(new StringValue(word))

            continue
        }

        // Keyword
        if (isValidFirstCharForKeyword(char)) {
            let word = char

            while (chars.length && isValidCharForKeyword(chars[0])) {
                word += chars.shift()
            }

            tokens.push(new Keyword(word))

            continue
        }

        // Operator
        if (['+', '-', '*', '/', '>', '=', '<', '~'].includes(char)) {
            tokens.push(new Operator(char))
            continue
        }

        // Expression
        if (['{', '}', ':', '[', ']', ',', '(', ')'].includes(char)) {
            tokens.push(new Expression(char))
            continue
        }

        throw new YaksokError('UNEXPECTED_CHAR', undefined, {
            token: char,
        })
    }

    return postprocessor(tokens)
}

export function preprocessor(code: string) {
    return '\n' + code.trim() + '\n'
}

export function postprocessor(tokens: Node[]) {
    return convertFunctionArgumentsToVariable(tokens)
}
