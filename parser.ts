import { YaksokError } from './errors.ts'
import { Pattern, internalPatterns } from './pattern.ts'
import {
    IndentPiece,
    BlockPiece,
    EOLPiece,
    Piece,
    KeywordPiece,
    EvaluatablePiece,
    VariablePiece,
    StringPiece,
    FunctionDeclarationPiece,
    FunctionInvokePiece,
    ExpressionPiece,
    DeclareVariablePiece,
} from './piece/index.ts'

export function tokenPreprocessor(tokens: Piece[]) {
    const stack: Piece[] = []

    while (tokens.length) {
        const token = tokens.shift()
        if (!token) break

        if (token instanceof KeywordPiece && token.value === '약속') {
            stack.push(token)
            const paramaters: string[] = []

            while (true) {
                const token = tokens.shift()
                if (!token) break

                if (token instanceof KeywordPiece) {
                    paramaters.push(token.value)
                    stack.push(
                        new VariablePiece({
                            name: token,
                        }),
                    )
                    continue
                }

                if (token instanceof EOLPiece) {
                    stack.push(token)
                    break
                }

                stack.push(token)
            }

            while (true) {
                const token = tokens.shift()
                if (!token) break

                if (
                    token instanceof EOLPiece &&
                    !(tokens[0] instanceof IndentPiece)
                ) {
                    stack.push(token)
                    break
                }

                if (
                    token instanceof KeywordPiece &&
                    paramaters.includes(token.value)
                ) {
                    stack.push(new VariablePiece({ name: token }))
                    continue
                }
                stack.push(token)
            }
        } else {
            stack.push(token)
        }
    }

    return stack
}

const dynamicPatternDetector = [
    {
        name: 'variable' as const,
        units: [
            {
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: ExpressionPiece,
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
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: ExpressionPiece,
                content: ':',
            },
            {
                type: ExpressionPiece,
            },
        ],
    },
    {
        name: 'variable' as const,
        units: [
            {
                type: KeywordPiece,
                as: 'name',
            },
            {
                type: ExpressionPiece,
                content: ':',
            },
            {
                type: KeywordPiece,
            },
        ],
    },
]

export function createDynamicPattern(tokens: Piece[]) {
    let end = 0
    const patterns: Pattern[] = []

    while (true) {
        if (tokens[end] instanceof EOLPiece) {
            let start = end - 1

            while (start >= 0) {
                const current = tokens[start]

                if (
                    current instanceof KeywordPiece &&
                    current.value === '약속'
                ) {
                    const subtokens = tokens.slice(start + 1, end)

                    const declarationTemplate = subtokens.map((t) => {
                        if (t instanceof VariablePiece) {
                            return {
                                type: VariablePiece,
                                as: t.name,
                            }
                        }

                        if (t instanceof StringPiece) {
                            return {
                                type: StringPiece,
                                value: t.value,
                            }
                        }

                        throw new YaksokError(
                            'UNEXPECTED_TOKEN',
                            {},
                            {
                                token: JSON.stringify(t),
                            },
                        )
                    })

                    const name = subtokens
                        .map((t) => {
                            if (t instanceof VariablePiece) return t.name
                            if (t instanceof StringPiece) return t.value
                        })
                        .join(' ')

                    for (let i = 0; i < subtokens.length; i++) {
                        // If string piece has space, it will be splitted.
                        const piece = subtokens[i]
                        if (piece instanceof StringPiece) {
                            const splitted = piece.value.split(' ')
                            subtokens.splice(
                                i,
                                1,
                                ...splitted.map((s) => new StringPiece(s)),
                            )
                        }
                    }

                    const invokeTemplate = subtokens.map((t) => {
                        if (t instanceof VariablePiece)
                            return {
                                type: EvaluatablePiece,
                                as: t.name,
                            }

                        if (t instanceof StringPiece)
                            return {
                                type: KeywordPiece,
                                content: t.value,
                            }

                        throw new YaksokError(
                            'UNEXPECTED_TOKEN',
                            {},
                            {
                                token: JSON.stringify(t),
                            },
                        )
                    })

                    patterns.push({
                        wrapper: FunctionDeclarationPiece,
                        units: [
                            {
                                type: KeywordPiece,
                                value: '약속',
                            },
                            ...declarationTemplate,
                            {
                                type: EOLPiece,
                            },
                            {
                                type: BlockPiece,
                                as: 'body',
                            },
                        ],
                        config: {
                            name,
                        },
                    })

                    patterns.push({
                        wrapper: FunctionInvokePiece,
                        units: invokeTemplate,
                        config: {
                            name,
                        },
                    })

                    break
                }

                if (current instanceof EOLPiece) break

                start--
            }
        }

        for (const pattern of dynamicPatternDetector) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (!checkPattern(substack, pattern)) continue

            if (pattern.name === 'variable') {
                if (
                    !(substack[0] instanceof KeywordPiece) ||
                    !substack[0].value
                )
                    continue

                patterns.push({
                    wrapper: VariablePiece,
                    units: [
                        {
                            type: KeywordPiece,
                            value: substack[0].value,
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

export function _parse(_tokens: Piece[], indent: number, pattern: Pattern[]) {
    const groups: Piece[] = []
    const tokens = [..._tokens]

    while (tokens.length) {
        const token = tokens.shift()
        if (!token) break

        if (token instanceof IndentPiece) {
            if (token.size !== indent + 1) {
                continue
            }

            let blockTokens: Piece[] = []

            while (tokens.length) {
                const currentToken = tokens.shift()
                if (!currentToken)
                    throw new YaksokError('UNEXPECTED_END_OF_CODE')

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

            const blockContent = _parse(blockTokens, indent + 1, pattern)
            groups.push(blockContent)
        } else {
            groups.push(token)
        }
    }

    patternMatcher(groups, pattern)
    groups.push(new EOLPiece())
    return new BlockPiece(groups)
}

export function parse(_tokens: Piece[]) {
    const tokens = tokenPreprocessor(_tokens)
    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = _parse(tokens, 0, dynamicPatterns)

    return ast
}

function checkPattern(tokens: Piece[], pattern: Omit<Pattern, 'wrapper'>) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const unit = pattern.units[i]

        if (!(token instanceof unit.type)) return false

        if (unit.value) {
            if (typeof unit.value === 'object') {
                for (const key in unit.value) {
                    if (unit.value[key] !== token?.[key]) return false
                }
            }

            if (unit.value !== token.value) return false
        }
    }

    return true
}

export function patternMatcher(tokens: Piece[], _patterns: Pattern[]) {
    const patterns = [..._patterns, ...internalPatterns]

    let end = 0

    while (true) {
        for (const pattern of patterns) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (checkPattern(substack, pattern)) {
                const Wrapper = pattern.wrapper

                if (
                    substack.length === 1 &&
                    substack[0].constructor === Wrapper
                ) {
                    continue
                }

                let content: Record<string, unknown> = {}

                for (let i = 0; i < pattern.units.length; i++) {
                    const unit = pattern.units[i]
                    const token = substack[i]

                    if (unit.as) content[unit.as] = token
                }

                if (pattern.config) {
                    content = {
                        ...content,
                        ...pattern.config,
                    }
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
