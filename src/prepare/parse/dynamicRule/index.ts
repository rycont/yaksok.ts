import { createLocalDynamicRules } from './functions/index.ts'
import { Token } from '../../tokenize/token.ts'
import type { FileRunner } from '../../../runtime/file-runner.ts'
import { getRulesFromMentioningFile } from './mention/index.ts'

export function createDynamicRule(tokens: Token[], fileRunner?: FileRunner) {
    const localRules = createLocalDynamicRules(
        tokens,
        fileRunner?.functionDeclareRanges,
    )

    const mentioningRules = fileRunner
        ? getRulesFromMentioningFile(tokens, fileRunner.runtime)
        : []

    return [...mentioningRules, ...localRules]
}
