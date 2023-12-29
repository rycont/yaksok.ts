import { getDynamicRulesFromMention } from './mention/getRulesFromMention.ts'
import { createLocalDynamicRules } from './local/index.ts'
import { TokenizeResult } from '../../tokenize/index.ts'
import { Yaksok } from '../../../index.ts'

export function createDynamicRule(tokenized: TokenizeResult, runtime?: Yaksok) {
    const localRules = createLocalDynamicRules(tokenized)
    const mentioningRules = runtime
        ? getDynamicRulesFromMention(tokenized.tokens, runtime)
        : []

    return [...localRules, ...mentioningRules]
}
