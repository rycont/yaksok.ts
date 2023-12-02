// ## Code example:
// 만약 ("짜장" 좋아함) 이고 ("짬뽕" 좋아함) 이면
//     "짬짜면" 시키기
// 
//     출력한횟수:0
//     반복
//         "다시는 교실에서 비행기를 날리지 않겠습니다." 보여주기
//         출력한횟수:이전 출력한횟수 + 1
//         만약 출력한횟수 >= 500 이면
//             반복 그만

import { YaksokError } from "./errors.ts"

const OPERATORS = ["+", "-", "*", "/", "%", "^", ">", "<", ">=", "<=", "!=", "=", '"']
const EXPRESSIONS = ["(", ")", "{", "}", "[", "]", ":"]
const KEYWORDS = [
    "만약", "이고", "이면", "그만", "반복"
]

const PRESERVEDS = [...OPERATORS, ...EXPRESSIONS, ...KEYWORDS]
const PRESERVEDS_HEAD = PRESERVEDS.map(preserved => preserved[0])

export function tokenizer(code: string) {
    let tokens: string[] = []
    let lineNumber = 1

    for (let i = 0; i < code.length; i++) {
        let char = code[i]

        // Try parse newline
        if (char === "\n") {
            lineNumber++
            if (tokens[tokens.length - 1] === "\n") continue
            tokens.push("\n")
            continue
        }

        // Try parse string
        if (char === '"') {
            let string = '"'

            while (code[++i] !== '"') {
                string += code[i]
            }

            string += '"'

            tokens.push(string)
            continue
        }

        // Try parse spaces
        if (char === " ") {
            let length = 1

            while (true) {
                if (code[i + 1] === " ") {
                    length++
                    i++
                } else {
                    break
                }
            }

            if (tokens[tokens.length - 1] !== "\n") continue

            if (length % 4 !== 0) {
                throw new YaksokError(
                    "INDENT_NOT_DIVIDED_BY_4",
                    {
                        line: lineNumber,
                        column: i + 1
                    }
                )
            }

            tokens.push("\t".repeat(
                length / 4
            ))
            continue
        }

        // Try parse keywords
        if ("가" <= char && char <= "힣") {
            let token = char

            while (true) {
                if ("가" <= code[i + 1] && code[i + 1] <= "힣") {
                    token += code[++i]
                } else {
                    break
                }
            }

            tokens.push(token)
            continue
        }

        // Try parse preserveds
        if (PRESERVEDS_HEAD.includes(char)) {
            let token = char

            while (true) {
                const matched = PRESERVEDS.filter(preserved => preserved.startsWith(token))

                if (matched.length === 0) {
                    throw new YaksokError(
                        "UNKNOWN_TOKEN",
                        {
                            line: lineNumber,
                            column: i + 1
                        }
                    )
                }

                if (matched.length === 1) {
                    if (matched[0] === token) {
                        break
                    }

                    token += code[++i]
                    continue
                }

                if (matched.length > 1) {
                    token += code[++i]
                    continue
                }
            }

            tokens.push(token)
            continue
        }

        // Try parse numbers
        if ("0" <= char && char <= "9") {
            let number = char
            let integer = true

            while (true) {
                if ("0" <= code[i + 1] && code[i + 1] <= "9") {
                    number += code[++i]
                } else if (integer && code[i + 1] === ".") {
                    number += code[++i]
                    integer = false
                } else {
                    break
                }
            }

            tokens.push(number)
            continue
        }

        throw new YaksokError(
            "UNKNOWN_TOKEN",
            {
                line: lineNumber,
                column: i + 1
            }
        )
    }

    return tokens
}