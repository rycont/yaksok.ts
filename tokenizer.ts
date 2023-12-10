import { YaksokError } from './errors.ts'
import {
    ExpressionPiece,
    OperatorPiece,
    KeywordPiece,
    CommentPiece,
    IndentPiece,
    StringPiece,
    NumberPiece,
    EOLPiece,
    Piece,
} from './piece/index.ts'

function isValidKeywordChar(char: string) {
    if ('가' <= char && char <= '힣') return true
    if ('0' <= char && char <= '9') return true
    if ('a' <= char && char <= 'Z') return true
    if (char === '_') return true

    return false
}

export function tokenizer(code: string) {
    const tokens: Piece<unknown>[] = []
    const chars = [...code]

    while (chars.length) {
        const char = chars.shift()

        if (char === undefined) break

        if(char === "#") {
            let comment = ""

            while(chars[0] !== '\n') {
                comment += chars.shift()
            }

            tokens.push(new CommentPiece(comment))
            
            continue
        }

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

        if (char === '\n') {
            if (tokens[tokens.length - 1] instanceof EOLPiece) continue
            tokens.push(new EOLPiece())
            continue
        }

        if ('0' <= char && char <= '9') {
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

        if (isValidKeywordChar(char)) {
            let word = char

            if (chars.length === 0)
                throw new YaksokError('UNEXPECTED_END_OF_CODE')

            while (isValidKeywordChar(chars[0])) {
                word += chars.shift()
            }

            tokens.push(new KeywordPiece(word))

            continue
        }

        if (['+', '-', '*', '/', '(', ')', '>', '=', '<', ','].includes(char)) {
            tokens.push(new OperatorPiece(char))
            continue
        }

        if (['{', '}', ':', '[', ']'].includes(char)) {
            tokens.push(new ExpressionPiece(char))
            continue
        }

        throw new YaksokError('UNEXPECTED_CHAR', undefined, {
            token: char,
        })
    }

    return tokens
}
