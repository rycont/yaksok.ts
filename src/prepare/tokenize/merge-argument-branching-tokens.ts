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

            const leftValue = functionHeader[slashIndex - 1]?.value
            functionHeader[slashIndex - 1] = null
            functionHeader[slashIndex] = null

            const nextSlash = functionHeader[slashIndex + 1]
            if (!nextSlash) {
                continue
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
