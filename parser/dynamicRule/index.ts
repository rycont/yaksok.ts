import { Rule } from '../rule.ts'
import {
    Node,
    EOL,
    Keyword,
    Variable,
    Evaluable,
    Expression,
} from '../../nodes/index.ts'
import { satisfiesPattern } from '../satisfiesPattern.ts'
import { createFunctionPattern } from './functionVariants.ts'

export function createDynamicRule(tokens: Node[]) {
    let end = 0
    let patterns: Rule[] = []

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

        for (const rule of dynamicPatternDetector) {
            if (end < rule.pattern.length) continue
            const substack = tokens.slice(end - rule.pattern.length, end)

            if (!satisfiesPattern(substack, rule.pattern)) continue

            if (rule.name === 'variable') {
                patterns.push({
                    to: Variable,
                    pattern: [
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

const dynamicPatternDetector: (Omit<Rule, 'to'> & {
    name: string
})[] = [
        {
            name: 'variable' as const,
            pattern: [
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
            pattern: [
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
            pattern: [
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
