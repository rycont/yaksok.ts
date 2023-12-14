import { Rule } from '../rule.ts'
import {
    Expression,
    Evaluable,
    Variable,
    Keyword,
    Node,
} from '../../node/index.ts'
import { satisfiesPattern } from '../satisfiesPattern.ts'
import { createFunctionRules } from './functionVariants.ts'

interface CreateDynamicRuleProps {
    tokens: Node[]
    functionHeaders: Node[][]
}

export function createDynamicRule({
    tokens,
    functionHeaders,
}: CreateDynamicRuleProps) {
    let end = 0
    const patterns: Rule[] = functionHeaders.flatMap(createFunctionRules)

    while (true) {
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
