import { YaksokError } from './errors.ts'
import {
    ExpressionPiece,
    OperatorPiece,
    KeywordPiece,
    IndentPiece,
    StringPiece,
    NumberPiece,
    EOLPiece,
    Piece,
} from './piece/index.ts'

export function isValidCharForKeyword(char: string) {
    if ('가' <= char && char <= '힣') return true
    if ('ㄱ' <= char && char <= 'ㆉ') return true
    if ('0' <= char && char <= '9') return true
    if ('A' <= char && char <= 'Z') return true
    if ('a' <= char && char <= 'z') return true
    if (char === '_') return true

    return false
}

export function isValidFirstCharForKeyword(char: string) {
    if ('가' <= char && char <= '힣') return true
    if ('ㄱ' <= char && char <= 'ㆉ') return true
    if ('A' <= char && char <= 'Z') return true
    if ('a' <= char && char <= 'z') return true
    if (char === '_') return true

    return false
}

export function preprocessor(code: string) {
    return '\n' + code.trim() + '\n'
}

export function tokenize(_code: string) {
    const tokens: Piece[] = []
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
            if (!(tokens[tokens.length - 1] instanceof EOLPiece)) continue

            let spaces = 1
            while (chars[0] === ' ') {
                chars.shift()
                spaces++
            }

            if (spaces % 4) throw new YaksokError('INDENT_IS_NOT_MULTIPLE_OF_4')

            tokens.push(new IndentPiece(spaces / 4))
            continue
        }

        // EOL
        if (char === '\n') {
            if (tokens[tokens.length - 1] instanceof EOLPiece) continue
            tokens.push(new EOLPiece())
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

            tokens.push(new NumberPiece(parseFloat(number)))

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

            tokens.push(new StringPiece(word))

            continue
        }

        // Keyword
        if (isValidFirstCharForKeyword(char)) {
            let word = char

            while (chars.length && isValidCharForKeyword(chars[0])) {
                word += chars.shift()
            }

            tokens.push(new KeywordPiece(word))

            continue
        }

        // Operator
        if (['+', '-', '*', '/', '>', '=', '<', '~'].includes(char)) {
            tokens.push(new OperatorPiece(char))
            continue
        }

        // Expression
        if (['{', '}', ':', '[', ']', ',', '(', ')'].includes(char)) {
            tokens.push(new ExpressionPiece(char))
            continue
        }

        throw new YaksokError('UNEXPECTED_CHAR', undefined, {
            token: char,
        })
    }

    return tokens
}
