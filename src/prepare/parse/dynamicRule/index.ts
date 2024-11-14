import { getDynamicRulesFromMention } from './mention/getRulesFromMention.ts'
import { createLocalDynamicRules } from './local/index.ts'

import type { Runtime } from '../../../runtime/index.ts'
import { Token } from '../../tokenize/token.ts'

export function createDynamicRule(tokens: Token[], runtime: Runtime) {
    const localRules = createLocalDynamicRules(tokens, runtime)
    const mentioningRules = getDynamicRulesFromMention(tokens, runtime)

    return [...localRules, mentioningRules]
}
