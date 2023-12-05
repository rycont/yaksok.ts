// ## Code example:
// 내_나이 = 10

import { YaksokError } from './errors.ts'
import { EOLPiece, KeywordPiece, NumberPiece, Piece, StringPiece } from './piece/index.tsx'

function isValidKeywordChar(char: string) {
    if ("가" <= char && char <= "힣") return true
    if ("0" <= char && char <= "9") return true
    if ("A" <= char && char <= "z") return true
    if (char === "_") return true
}

export function tokenizer(code: string) {
    const tokens: Piece<unknown>[] = []
    const chars = [...code]

    while (chars.length) {
        const char = chars.shift()

        if (char === undefined) break
        if (char === ' ') {
            if (!(tokens[tokens.length - 1] instanceof EOLPiece)) continue

            let spaces = 1
            while (chars[0] === ' ') {
                chars.shift()
                spaces++
            }


            if (spaces % 4) throw new YaksokError("INDENT_IS_NOT_MULTIPLE_OF_4")

            tokens.push(new KeywordPiece('\t'.repeat(spaces / 4)))
            continue
        }

        if (char === '\n') {
            tokens.push(new EOLPiece())
            continue
        }

        if ("0" <= char && char <= "9") {
            let number = char
            let isInt = true

            while (true) {
                const isNum = chars.length && "0" <= chars[0] && chars[0] <= "9"
                const isAllowedDot = chars.length && chars[0] === "." && isInt

                if (!isNum && !isAllowedDot) break
                if (isAllowedDot) isInt = false

                number += chars.shift()
            }

            tokens.push(new NumberPiece(parseInt(number)))

            continue
        }

        if (char === '"') {
            let word = ""

            while (true) {
                const nextChar = chars.shift()

                if (nextChar === undefined) throw new YaksokError("UNEXPECTED_END_OF_CODE")
                if (nextChar === '"') break

                word += nextChar
            }

            tokens.push(new StringPiece(word))

            continue
        }

        if (isValidKeywordChar(char)) {
            let word = char

            if (chars.length === 0) throw new YaksokError("UNEXPECTED_END_OF_CODE")

            while (isValidKeywordChar(chars[0])) {
                word += chars.shift()
            }

            tokens.push(new KeywordPiece(word))

            continue
        }

        if (['+', '-', '*', '/', '(', ')', '{', '}', ':', ">", "=", "<"].includes(char)) {
            tokens.push(new KeywordPiece(char))
            continue
        }

        throw new YaksokError("UNEXPECTED_CHAR", undefined, {
            token: char,
        })
    }

    return tokens
}
