import { TOKEN_TYPE } from '../tokenize/token.ts'
import { Token } from '../tokenize/token.ts'

export function parseIndent(_tokens: Token[], indent = 0) {
    const groups: Token[] = []
    const tokens = [..._tokens]

    while (tokens.length) {
        const token = tokens.shift()!

        if (token.type === TOKEN_TYPE.INDENT) {
            if (token.value.length !== indent + 1) {
                continue
            }

            const blockTokens: Token[] = []

            while (tokens.length) {
                const currentToken = tokens.shift()!

                // 다음 줄로 넘어갔는데
                if (currentToken.type === TOKEN_TYPE.NEW_LINE) {
                    // 첫 토큰이 들여쓰기면
                    if (tokens[0].type === TOKEN_TYPE.INDENT) {
                        // 들여쓰기가 같거나 더 깊으면
                        if (tokens[0].value.length >= token.value.length) {
                            blockTokens.push(currentToken)
                            continue
                        } else {
                            break
                        }
                    } else {
                        break
                    }
                } else {
                    blockTokens.push(currentToken)
                }
            }

            const child = parseIndent(blockTokens, indent + 1)
            groups.push(new Block(child))
        } else {
            groups.push(token)
        }
    }

    return groups
}
