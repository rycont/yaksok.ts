import { Pattern } from '../pattern.ts'
import {
    Node,
    EOL,
    Keyword,
    Variable,
    Evaluable,
    Expression,
} from '../../nodes/index.ts'
import { checkPattern } from '../checkPattern.ts'
import { createFunctionPattern } from './functionVariants.ts'

export function createDynamicPattern(tokens: Node[]) {
    let end = 0
    let patterns: Pattern[] = []

    while (true) {
        if (tokens[end] instanceof EOL) {
            let start = end - 1

            while (start >= 0) {
                const current = tokens[start]

                if (current instanceof Keyword && current.value === '약속') {
                    const subtokens = tokens.slice(start + 1, end)
                    patterns = patterns.concat(createFunctionPattern(subtokens))

                    break
                }

                if (current instanceof EOL) break

                start--
            }
        }

        for (const pattern of dynamicPatternDetector) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (!checkPattern(substack, pattern)) continue

            if (pattern.name === 'variable') {
                patterns.push({
                    wrapper: Variable,
                    units: [
                        {
                            type: Keyword,
                            value: (substack[0] as Keyword).value,
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

const dynamicPatternDetector: (Omit<Pattern, 'wrapper'> & {
    name: string
})[] = [
    {
        name: 'variable' as const,
        units: [
            {
                type: Keyword,
                as: 'name',
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Evaluable,
            },
        ],
    },
    {
        name: 'variable' as const,
        units: [
            {
                type: Keyword,
                as: 'name',
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Expression,
            },
        ],
    },
    {
        name: 'variable' as const,
        units: [
            {
                type: Keyword,
                as: 'name',
            },
            {
                type: Expression,
                value: ':',
            },
            {
                type: Keyword,
            },
        ],
    },
]
