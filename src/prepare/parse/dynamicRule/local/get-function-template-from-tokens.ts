import { FunctionTemplate } from '../../../../type/function-template.ts'
import { Token, TOKEN_TYPE } from '../../../tokenize/token.ts'

export function getFunctionTemplateFromTokens(tokens: Token[]) {
    const functionTemplates: FunctionTemplate[] = []
    const functionStartingIndexes = tokens.map(functionStartingPattern)

    // WIP
    const functionEndingIndexesByStartingIndex =
        functionStartingIndexes.map(startingIndex)
}

function functionStartingPattern(
    token: Token,
    index: number,
    allTokens: Token[],
) {
    const nextToken = allTokens[index + 1]
    if (!nextToken) return false

    const isCurrentTokenFunctionKeyword =
        token.type === TOKEN_TYPE.IDENTIFIER && token.value === '약속'

    const isNextTokenComma = nextToken.type === TOKEN_TYPE.COMMA

    return isCurrentTokenFunctionKeyword && isNextTokenComma
}
