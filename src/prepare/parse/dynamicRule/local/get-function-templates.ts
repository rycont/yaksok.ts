import {
    FunctionTemplate,
    FunctionTemplatePiece,
} from '../../../../type/function-template.ts'
import { Token, TOKEN_TYPE } from '../../../tokenize/token.ts'

export function getFunctionTemplatesFromTokens(
    tokens: Token[],
    isFunctionStartingPattern: (
        token: Token,
        index: number,
        allTokens: Token[],
    ) => boolean,
    type: string,
) {
    const functionStartingIndexes = tokens
        .map(isFunctionStartingPattern)
        .map((isStarting, index) => (isStarting ? index : -1))
        .filter((index) => index !== -1)

    const functionEndingIndexesByStartingIndex = functionStartingIndexes.map(
        (startingIndex) => getFunctionEndingIndex(tokens, startingIndex),
    )

    const functionRanges = functionStartingIndexes.map(
        (startingIndex, index) => [
            startingIndex,
            functionEndingIndexesByStartingIndex[index],
        ],
    )

    const functionTemplatesTokens = functionRanges.map(([start, end]) =>
        tokens.slice(start, end),
    )

    const functionTemplates = functionTemplatesTokens.map((tokens) =>
        convertTokensToFunctionTemplate(tokens, type),
    )

    return functionTemplates
}

function convertTokensToFunctionTemplate(
    _tokens: Token[],
    type: string,
): FunctionTemplate {
    const tokens = _tokens.map((token) => ({ ...token }))

    const pieces = tokens
        .map((token, index) => {
            if (token.type !== TOKEN_TYPE.IDENTIFIER) {
                return null
            }

            const nextToken = tokens[index + 1]

            if (!nextToken) {
                return null
            }

            const isNextTokenSlash =
                nextToken.type === TOKEN_TYPE.OPERATOR &&
                nextToken.value === '/'

            if (isNextTokenSlash) {
                const mergeTargetToken = tokens[index + 2]

                const mergedIdentifier =
                    token.value + '/' + mergeTargetToken.value
                mergeTargetToken.value = mergedIdentifier

                return null
            }

            const isPrevTokenOpeningParenthesis =
                tokens[index - 1]?.type === TOKEN_TYPE.OPENING_PARENTHESIS
            const isNextTokenClosingParenthesis =
                tokens[index + 1]?.type === TOKEN_TYPE.CLOSING_PARENTHESIS

            if (
                isPrevTokenOpeningParenthesis &&
                isNextTokenClosingParenthesis &&
                token.type === TOKEN_TYPE.IDENTIFIER
            ) {
                return {
                    type: 'value',
                    value: [token.value],
                }
            }

            return {
                type: 'static',
                value: token.value.split('/'),
            }
        })
        .filter(Boolean) as FunctionTemplatePiece[]

    const functionName = _tokens
        .map((token) => token.value)
        .join('')
        .trim()

    return {
        name: functionName,
        pieces,
        type,
    }
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
