import { UnexpectedEndOfCodeError } from '../../error/prepare.ts'
import { Token, TOKEN_TYPE } from './token.ts'

export function mergeArgumentBranchingTokens(
    _tokens: Token[],
    functionDeclareRanges: [number, number][],
) {
    const tokens: Token[] = [..._tokens]

    for (const [start, end] of functionDeclareRanges) {
        const functionHeader = tokens.slice(start, end) as (Token | null)[]
        while (true) {
            const slashIndex = functionHeader.findIndex(
                (token) => token && token.type === TOKEN_TYPE.OPERATOR,
            )

            if (slashIndex === -1) {
                break
            }

            const slashPosition = functionHeader[slashIndex]!.position

            const leftValue = functionHeader[slashIndex - 1]?.value
            functionHeader[slashIndex - 1] = null
            functionHeader[slashIndex] = null

            const nextSlash = functionHeader[slashIndex + 1]
            if (!nextSlash || nextSlash.type !== TOKEN_TYPE.IDENTIFIER) {
                throw new UnexpectedEndOfCodeError({
                    position: slashPosition,
                })
            }

            const rightValue = leftValue + '/' + nextSlash.value
            nextSlash.value = rightValue
        }

        const newFunctionHeader = functionHeader.filter(
            (token) => token,
        ) as Token[]

        tokens.splice(start, end - start, ...newFunctionHeader)
    }

    return tokens
}
