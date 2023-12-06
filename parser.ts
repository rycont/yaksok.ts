import { YaksokError } from './errors.ts'
import { Pattern, internalPatterns } from './pattern.ts'
import {
    IndentPiece,
    BlockPiece,
    EOLPiece,
    Piece,
    KeywordPiece,
    ExecutablePiece,
    EvaluatablePiece,
    DeclareVariablePiece,
    VariablePiece,
} from './piece/index.ts'

const dynamicPatternDetector = [
    {
        name: 'variable' as const,
        units: [
            {
                type: IndentPiece,
            },
            {
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: KeywordPiece,
                content: ':',
            },
            {
                type: EvaluatablePiece,
            },
        ],
    },
    {
        name: 'variable' as const,
        units: [
            {
                type: EOLPiece,
            },
            {
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: KeywordPiece,
                content: ':',
            },
            {
                type: EvaluatablePiece,
            },
        ],
    },
]

export function createDynamicPattern(tokens: Piece<unknown>[]) {
    let end = 0
    const patterns: Pattern[] = []

    while (true) {
        for (const pattern of dynamicPatternDetector) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (!checkPattern(substack, pattern)) continue

            if (pattern.name === 'variable') {
                if (typeof substack[1].content !== 'string') continue

                patterns.push({
                    wrapper: VariablePiece,
                    units: [
                        {
                            type: KeywordPiece,
                            content: substack[1].content,
                            as: 'name',
                        },
                    ],
                })
            }
        }

        end++
        if (end > tokens.length) break
    }

    return patterns
}

export function parse(
    _tokens: Piece<unknown>[],
    indent: number = 0,
    pattern = createDynamicPattern(_tokens),
) {
    const groups: Piece<unknown>[] = []
    const tokens = [..._tokens]

    while (tokens.length) {
        const token = tokens.shift()
        if (!token) break

        if (token instanceof IndentPiece) {
            if (token.content !== indent + 1) {
                continue
            }

            let blockTokens: Piece<unknown>[] = []

            while (tokens.length) {
                const currentToken = tokens.shift()
                if (!currentToken)
                    throw new YaksokError('UNEXPECTED_END_OF_CODE')

                // 다음 줄로 넘어갔는데
                if (currentToken instanceof EOLPiece) {
                    // 첫 토큰이 들여쓰기면
                    if (tokens[0] instanceof IndentPiece) {
                        // 들여쓰기가 같거나 더 깊으면
                        if (tokens[0].content >= token.content) {
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

            const blockContent = parse(blockTokens, indent + 1, pattern)
            groups.push(blockContent)
        } else {
            groups.push(token)
        }
    }

    inplaceParser(groups, pattern)
    return new BlockPiece(groups)
}

function checkPattern(
    tokens: Piece<unknown>[],
    pattern: Omit<Pattern, 'wrapper'>,
) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const unit = pattern.units[i]

        if (!(token instanceof unit.type)) return false
        if (unit.content) {
            if (typeof unit.content === 'object') {
                for (const key in unit.content) {
                    if (unit.content[key] !== token.content?.[key]) return false
                }
            }

            if (unit.content !== token.content) return false
        }
    }

    return true
}

export function inplaceParser(tokens: Piece<unknown>[], _patterns: Pattern[]) {
    const patterns = [...internalPatterns, ..._patterns]
    let end = 0

    while (true) {
        for (const pattern of patterns) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (checkPattern(substack, pattern)) {
                const Wrapper = pattern.wrapper

                const content: Record<string, unknown> = {}

                for (let i = 0; i < pattern.units.length; i++) {
                    const unit = pattern.units[i]
                    const token = substack[i]

                    if (unit.as) content[unit.as] = token
                }

                const wrapper = new Wrapper(content)

                tokens.splice(
                    end - pattern.units.length,
                    pattern.units.length,
                    wrapper,
                )

                end -= pattern.units.length
            }
        }

        end++

        if (end > tokens.length) break
    }
}
