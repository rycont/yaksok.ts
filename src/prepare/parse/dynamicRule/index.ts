import { createLocalDynamicRules } from './local/index.ts'
import { Token } from '../../tokenize/token.ts'
import type { FileRunner } from '../../../runtime/file-runner.ts'

export function createDynamicRule(tokens: Token[], fileRunner: FileRunner) {
    const localRules = createLocalDynamicRules(tokens, fileRunner)
    return localRules

    // const mentioningRules = getDynamicRulesFromMention(tokens, runtime)
    // return [localRules, mentioningRules]
}
