import { Pattern } from '../../pattern.ts'
import {
    Piece,
    EOLPiece,
    KeywordPiece,
    VariablePiece,
    EvaluatablePiece,
    ExpressionPiece,
} from '../../piece/index.ts'
import { checkPattern } from '../checkPattern.ts'
import { createFunctionPattern } from './functionVariants.ts'

export function createDynamicPattern(tokens: Piece[]) {
    let end = 0
    let patterns: Pattern[] = []

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
                    patterns = patterns.concat(createFunctionPattern(subtokens))

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
