import { Node } from '../../../../node/base.ts'
import { Rule } from '../../rule.ts'
import { satisfiesPattern } from '../../satisfiesPattern.ts'
import { dynamicPatternDetector, dynamicRuleFactory } from './pattern.ts'
import { createFunctionRules } from '../functionVariants.ts'

export function createLocalDynamicRules(
    tokens: Node[],
    functionHeaders: Node[][],
) {
    let end = 0
    const patterns: Rule[] = functionHeaders.flatMap(createFunctionRules)

    while (true) {
        for (const rule of dynamicPatternDetector) {
            if (end < rule.pattern.length) continue

            const substack = tokens.slice(end - rule.pattern.length, end)
            if (!satisfiesPattern(substack, rule.pattern)) continue

            const dynamicRule = dynamicRuleFactory[rule.name](substack)
            patterns.push(dynamicRule)
        }

        end++
        if (end > tokens.length) break
    }

    return patterns
}
