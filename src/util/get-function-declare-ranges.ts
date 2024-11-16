import {
    isFfiStartingPattern,
    isYaksokStartingPattern,
} from './is-function-starting.ts'
import { TOKEN_TYPE } from '../prepare/tokenize/token.ts'
import { Token } from '../prepare/tokenize/token.ts'
import {
    UnexpectedEndOfCodeError,
    UnexpectedTokenError,
} from '../error/prepare.ts'

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

    assertValidFunctionDeclare(tokens, functionDeclareRanges)

    return functionDeclareRanges
}

function getFunctionEndingIndex(tokens: Token[], startingIndex: number) {
    const tokensFromStartingIndex = tokens.slice(startingIndex)
    const nearestNewLineIndexFromStart = tokensFromStartingIndex.findIndex(
        (token) => token.type === TOKEN_TYPE.NEW_LINE,
    )

    if (nearestNewLineIndexFromStart === -1) {
        const lastToken =
            tokensFromStartingIndex[tokensFromStartingIndex.length - 1]

        throw new UnexpectedEndOfCodeError({
            resource: {
                parts: '약속 이름',
            },
            position: lastToken.position,
        })
    }

    return nearestNewLineIndexFromStart + startingIndex + 1
}

function assertValidFunctionDeclare(
    tokens: Token[],
    functionDeclareRanges: [number, number][],
) {
    for (const [_, end] of functionDeclareRanges) {
        const nextToken = tokens[end - 1]

        if (nextToken?.type !== TOKEN_TYPE.NEW_LINE) {
            throw new UnexpectedTokenError({
                resource: {
                    token: nextToken,
                    parts: '줄 넘김',
                },
                position: nextToken.position,
            })
        }

        const nextNextToken = tokens[end]

        if (!nextNextToken) {
            throw new UnexpectedEndOfCodeError({
                resource: {
                    parts: '들여쓰기',
                },
                position: nextToken.position,
            })
        }

        if (nextNextToken.type !== TOKEN_TYPE.INDENT) {
            throw new UnexpectedTokenError({
                resource: {
                    token: nextNextToken,
                    parts: '들여쓰기',
                },
                position: nextNextToken.position,
            })
        }
    }
}
