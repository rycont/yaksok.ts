import { createLocalDynamicRules } from './local/index.ts'
import { Token } from '../../tokenize/token.ts'

export function createDynamicRule(tokens: Token[]) {
    const localRules = createLocalDynamicRules(tokens)
    return [localRules]

    // const mentioningRules = getDynamicRulesFromMention(tokens, runtime)
    // return [localRules, mentioningRules]
}
