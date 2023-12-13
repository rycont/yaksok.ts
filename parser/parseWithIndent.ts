import { YaksokError } from '../errors.ts'
import { Pattern } from '../pattern.ts'
import { Piece, IndentPiece, EOLPiece, BlockPiece } from '../piece/index.ts'
import { patternMatcher } from './patternMatcher.ts'

export function parseWithIndent(
    _tokens: Piece[],
    indent: number,
    pattern: Pattern[],
) {
    const groups: Piece[] = []
    const tokens = [..._tokens]

    while (tokens.length) {
        const token = tokens.shift()!

        if (token instanceof IndentPiece) {
            if (token.size !== indent + 1) {
                continue
            }

            let blockTokens: Piece[] = []

            while (tokens.length) {
                const currentToken = tokens.shift()!

                // 다음 줄로 넘어갔는데
                if (currentToken instanceof EOLPiece) {
                    // 첫 토큰이 들여쓰기면
                    if (tokens[0] instanceof IndentPiece) {
                        // 들여쓰기가 같거나 더 깊으면
                        if (tokens[0].size >= token.size) {
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

            blockTokens.push(new EOLPiece())

            const blockContent = parseWithIndent(
                blockTokens,
                indent + 1,
                pattern,
            )
            groups.push(blockContent)
        } else {
            groups.push(token)
        }
    }

    patternMatcher(groups, pattern)
    groups.push(new EOLPiece())
    return new BlockPiece(groups)
}
