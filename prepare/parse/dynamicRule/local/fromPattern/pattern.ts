import {
    Keyword,
    Expression,
    Evaluable,
    Node,
} from '../../../../../node/base.ts'
import { EOL } from '../../../../../node/misc.ts'
import { Variable } from '../../../../../node/variable.ts'
import { Rule } from '../../../rule.ts'

export const dynamicPatternDetector: (Omit<Rule, 'factory'> & {
    name: 'variable' | 'list_loop'
})[] = [
    {
        name: 'variable' as const,
        pattern: [
            {
                type: Keyword,
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
    {
        name: 'list_loop' as const,
        pattern: [
            {
                type: Keyword,
                value: '의',
            },
            {
                type: Keyword,
            },
            {
                type: Keyword,
                value: '마다',
            },
            {
                type: EOL,
            },
        ],
    },
]

export const dynamicRuleFactory: Record<
    'variable' | 'list_loop',
    (substack: Node[]) => Rule
> = {
    variable: (substack: Node[]) => ({
        pattern: [
            {
                type: Keyword,
                value: (substack[0] as Keyword).value,
            },
        ],
        factory: (tokens: Node[]) => {
            const name = tokens[0] as Keyword
            return new Variable(name.value)
        },
    }),
    list_loop: (substack: Node[]) => ({
        pattern: [
            {
                type: Keyword,
                value: (substack[1] as Keyword).value,
            },
        ],
        factory: (tokens: Node[]) => {
            const name = tokens[0] as Keyword
            return new Variable(name.value)
        },
    }),
}
