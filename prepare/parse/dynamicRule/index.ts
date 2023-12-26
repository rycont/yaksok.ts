import { Yaksok } from '../../../index.ts'
import { Node } from '../../../node/index.ts'
import { getDynamicRulesFromMention } from './mention/getRulesFromMention.ts'
import { createLocalDynamicRules } from './local/index.ts'

interface CreateDynamicRuleProps {
    tokens: Node[]
    functionHeaders: Node[][]
}

export function createDynamicRule(
    { tokens, functionHeaders }: CreateDynamicRuleProps,
    runtime?: Yaksok,
) {
    const localRules = createLocalDynamicRules(tokens, functionHeaders)
    const mentioningRules = runtime
        ? getDynamicRulesFromMention(tokens, runtime)
        : []

    return [...localRules, ...mentioningRules]
}
