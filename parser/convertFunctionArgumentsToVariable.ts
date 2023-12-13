import {
    Piece,
    KeywordPiece,
    VariablePiece,
    EOLPiece,
    IndentPiece,
} from '../piece/index.ts'

export function convertFunctionArgumentsToVariable(leftTokens: Piece[]) {
    const tokenStack: Piece[] = []

    while (leftTokens.length) {
        const token = leftTokens.shift()!

        if (token instanceof KeywordPiece && token.value === '약속') {
            tokenStack.push(token)
            const paramaters: string[] = []

            // Detect function header and convert arguments to variable
            while (true) {
                const token = leftTokens.shift()
                if (!token) break

                if (token instanceof KeywordPiece) {
                    paramaters.push(token.value)
                    tokenStack.push(
                        new VariablePiece({
                            name: token,
                        }),
                    )
                    continue
                }

                if (token instanceof EOLPiece) {
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
                    token instanceof EOLPiece &&
                    !(leftTokens[0] instanceof IndentPiece)
                ) {
                    tokenStack.push(token)
                    break
                }

                // 키워드이고 인자에 포함되어 있으면 변수로 바꿔줌
                if (
                    token instanceof KeywordPiece &&
                    paramaters.includes(token.value)
                ) {
                    tokenStack.push(new VariablePiece({ name: token }))
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
