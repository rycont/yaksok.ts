import {
    FunctionTemplate,
    FunctionTemplatePiece,
} from '../../../../type/function-template.ts'
import { Token, TOKEN_TYPE } from '../../../tokenize/token.ts'

export function getFunctionTemplatesFromTokens(
    tokens: Token[],
    functionDeclareRanges: [number, number][],
    type: string,
) {
    const functionTemplatesTokens = functionDeclareRanges.map(([start, end]) =>
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
                value: [...token.value.split('/'), token.value],
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
