import {
    isFfiStartingPattern,
    isYaksokStartingPattern,
} from './is-function-starting.ts'
import { TOKEN_TYPE } from '../prepare/tokenize/token.ts'
import { Token } from '../prepare/tokenize/token.ts'

export function getFunctionDeclareRanges(_tokens: Token[]) {
    const tokens = [..._tokens]

    const functionStartingIndexes = tokens
        .map(
            (token, index, allTokens) =>
                isFfiStartingPattern(token, index, allTokens) ||
                isYaksokStartingPattern(token, index, allTokens),
        )
        .map((isStarting, index) => (isStarting ? index : -1))
        .filter((index) => index !== -1)

    const functionEndingIndexesByStartingIndex = functionStartingIndexes.map(
        (startingIndex) => getFunctionEndingIndex(tokens, startingIndex),
    )

    const functionDeclareRanges = functionStartingIndexes.map(
        (startingIndex, index) =>
            [startingIndex, functionEndingIndexesByStartingIndex[index]] as [
                number,
                number,
            ],
    )

    return functionDeclareRanges
}

function getFunctionEndingIndex(tokens: Token[], startingIndex: number) {
    const tokensFromStartingIndex = tokens.slice(startingIndex)
    const nearestNewLineIndexFromStart = tokensFromStartingIndex.findIndex(
        (token) => token.type === TOKEN_TYPE.NEW_LINE,
    )

    if (!nearestNewLineIndexFromStart) {
        throw new Error('약속이 끝나지 않았습니다.')
    }

    return nearestNewLineIndexFromStart + startingIndex + 1
}
