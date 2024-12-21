import { TOKEN_TYPE } from '@dalbit-yaksok/core'
import { ColorToken } from './type.ts'

export function mergeSyntax(_tokens: ColorToken[]) {
    const tokens = _tokens.slice()
    mergeVariableDeclaration(tokens)

    return tokens
}

function mergeVariableDeclaration(tokens: ColorToken[]) {
    const colonPositions: number[] = []

    for (const index in tokens) {
        const current = tokens[index]

        if (current.type === TOKEN_TYPE.COLON) {
            colonPositions.push(+index)
        }
    }

    for (const colonPosition of colonPositions) {
        for (
            let i = colonPosition;
            tokens[i] &&
            tokens[i].type !== TOKEN_TYPE.NEW_LINE &&
            tokens[i].type !== TOKEN_TYPE.INDENT;
            i--
        ) {
            if (tokens[i].type === TOKEN_TYPE.IDENTIFIER) {
                if (tokens[i].value === '결과') {
                    tokens[i].scope = 'keyword'
                } else {
                    tokens[i].scope = 'variable'
                }
            }
        }
    }
}
