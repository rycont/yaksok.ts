import { Node, Keyword, Variable, EOL, Indent } from '../node/index.ts'

export function convertFunctionArgumentsToVariable(leftTokens: Node[]) {
    const tokenStack: Node[] = []

    while (leftTokens.length) {
        const token = leftTokens.shift()!

        if (token instanceof Keyword && token.value === '약속') {
            tokenStack.push(token)
            const paramaters: string[] = []

            // Detect function header and convert arguments to variable
            while (true) {
                const token = leftTokens.shift()
                if (!token) break

                if (token instanceof Keyword) {
                    paramaters.push(token.value)
                    tokenStack.push(
                        new Variable({
                            name: token,
                        }),
                    )
                    continue
                }

                if (token instanceof EOL) {
                    tokenStack.push(token)
                    break
                }

                tokenStack.push(token)
            }

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
                    tokenStack.push(new Variable({ name: token }))
                    continue
                }
                tokenStack.push(token)
            }
        } else {
            tokenStack.push(token)
        }
    }

    return tokenStack
}
