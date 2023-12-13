import {
    Piece,
    KeywordPiece,
    VariablePiece,
    EOLPiece,
    IndentPiece,
} from '../piece/index.ts'

export function parserPreprocessor(tokens: Piece[]) {
    const stack: Piece[] = []

    while (tokens.length) {
        const token = tokens.shift()!

        if (token instanceof KeywordPiece && token.value === '약속') {
            stack.push(token)
            const paramaters: string[] = []

            while (true) {
                const token = tokens.shift()
                if (!token) break

                if (token instanceof KeywordPiece) {
                    paramaters.push(token.value)
                    stack.push(
                        new VariablePiece({
                            name: token,
                        }),
                    )
                    continue
                }

                if (token instanceof EOLPiece) {
                    stack.push(token)
                    break
                }

                stack.push(token)
            }

            while (true) {
                const token = tokens.shift()
                if (!token) break

                if (
                    token instanceof EOLPiece &&
                    !(tokens[0] instanceof IndentPiece)
                ) {
                    stack.push(token)
                    break
                }

                if (
                    token instanceof KeywordPiece &&
                    paramaters.includes(token.value)
                ) {
                    stack.push(new VariablePiece({ name: token }))
                    continue
                }
                stack.push(token)
            }
        } else {
            stack.push(token)
        }
    }

    return stack
}
