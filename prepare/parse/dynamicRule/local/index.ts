import { dynamicPatternDetector, dynamicRuleFactory } from './pattern.ts'
import { satisfiesPattern } from '../../satisfiesPattern.ts'
import { createFunctionRules } from '../functionVariants.ts'
import { TokenizeResult } from '../../../tokenize/index.ts'
import { Rule } from '../../rule.ts'

export function createLocalDynamicRules({
    tokens,
    functionHeaders,
    ffiHeaders,
}: TokenizeResult) {
    let end = 0
    const rules: Rule[] = []
    const functionRules = functionHeaders.flatMap((rule) =>
        createFunctionRules(rule),
    )
    const ffiRules = ffiHeaders.flatMap((header) =>
        createFunctionRules(header, true),
    )

    while (true) {
        for (const rule of dynamicPatternDetector) {
            if (end < rule.pattern.length) continue

            const substack = tokens.slice(end - rule.pattern.length, end)
            if (!satisfiesPattern(substack, rule.pattern)) continue

            const dynamicRule = dynamicRuleFactory[rule.name](substack)
            rules.push(dynamicRule)
        }

        end++
        if (end > tokens.length) break
    }

    return [...rules, ...functionRules, ...ffiRules]
}
