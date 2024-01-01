import { Expression } from '../../node/base.ts'
import { Node, Keyword, Variable, EOL, Indent } from '../../node/index.ts'
import { satisfiesPattern } from '../parse/satisfiesPattern.ts'

export function lexFunctionArgument(tokens: Node[]) {
    const leftTokens = [...tokens]
    const tokenStack: Node[] = []

    const functionHeaders: Node[][] = []
    const ffiHeaders: Node[][] = []

    while (leftTokens.length) {
        const isFunctionDeclare = isStartOfFunction(leftTokens)
        const isFFIDeclare = isStartOfFFI(leftTokens)

        if (!isFunctionDeclare && !isFFIDeclare) {
            tokenStack.push(leftTokens.shift()!)
            continue
        }

        if (isFFIDeclare) {
            tokenStack.push(leftTokens.shift()!)
            tokenStack.push(leftTokens.shift()!)
            tokenStack.push(leftTokens.shift()!)
        }

        const token = leftTokens.shift()!
        tokenStack.push(token)

        if (leftTokens[0] instanceof Keyword && leftTokens[0].value === '그만')
            continue

        const paramaters: string[] = []
        const functionHeader: Node[] = []

        // Detect function header and convert arguments to variable

        while (true) {
            const token = leftTokens.shift()
            if (!token) break

            if (token instanceof Keyword) {
                paramaters.push(token.value)
                const variable = new Variable(token.value)

                tokenStack.push(variable)
                functionHeader.push(variable)

                continue
            }

            if (token instanceof EOL) {
                tokenStack.push(token)
                break
            }

            functionHeader.push(token)
            tokenStack.push(token)
        }

        if (isFFIDeclare) {
            ffiHeaders.push(functionHeader)
        } else {
            functionHeaders.push(functionHeader)
        }

        if (isFunctionDeclare)
            // Convert function body to variable
            while (true) {
                const token = leftTokens.shift()
                if (!token) break

                // 줄바꿈이 됐는데 들여쓰기가 없으면 함수가 끝난 것
                if (
                    token instanceof EOL &&
                    !(leftTokens[0] instanceof Indent)
                ) {
                    tokenStack.push(token)
                    break
                }

                // 키워드이고 인자에 포함되어 있으면 변수로 바꿔줌
                if (
                    token instanceof Keyword &&
                    paramaters.includes(token.value)
                ) {
                    tokenStack.push(new Variable(token.value))
                    continue
                }
                tokenStack.push(token)
            }
    }

    return {
        tokens: tokenStack,
        functionHeaders,
        ffiHeaders,
    }
}

function isStartOfFunction(tokens: Node[]) {
    return tokens[0] instanceof Keyword && tokens[0].value === '약속'
}

function isStartOfFFI(tokens: Node[]) {
    return satisfiesPattern(tokens, [
        {
            type: Keyword,
            value: '번역',
        },
        {
            type: Expression,
            value: '(',
        },
        {
            type: Keyword,
        },
        {
            type: Expression,
            value: ')',
        },
    ])
}
