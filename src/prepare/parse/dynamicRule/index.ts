import { getDynamicRulesFromMention } from './mention/getRulesFromMention.ts'
import { createLocalDynamicRules } from './local/index.ts'

import type { TokenizeResult } from '../../tokenize/index.ts'
import type { Runtime } from '../../../runtime/index.ts'

export function createDynamicRule(tokenized: TokenizeResult, runtime: Runtime) {
    const localRules = createLocalDynamicRules(tokenized, runtime)
    const mentioningRules = getDynamicRulesFromMention(
        tokenized.tokens,
        runtime,
    )

    return [...localRules, mentioningRules]
}
