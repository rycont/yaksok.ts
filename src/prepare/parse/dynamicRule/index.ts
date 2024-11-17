import { createLocalDynamicRules } from './local/index.ts'
import { Token } from '../../tokenize/token.ts'
import type { FileRunner } from '../../../runtime/file-runner.ts'
import { getDynamicRulesFromMention } from './mention/getRulesFromMention.ts'

export function createDynamicRule(tokens: Token[], fileRunner?: FileRunner) {
    const localRules = createLocalDynamicRules(
        tokens,
        fileRunner?.functionDeclareRanges,
    )

    const mentioningRules = fileRunner
        ? getDynamicRulesFromMention(tokens, fileRunner.runtime)
        : []

    return [...mentioningRules, ...localRules]
}
