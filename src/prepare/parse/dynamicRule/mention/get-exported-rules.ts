import type { Runtime } from '../../../../runtime/index.ts'
import { createMentioningRule } from './create-mentioning-rules.ts'

export function getExportedRules(runtime: Runtime, fileName: string) {
    const runner = runtime.getFileRunner(fileName)
    runner.prepare()

    const rules = runner.exportedRules

    const mentioningRules = rules
        .filter((rule) => rule.config?.exported)
        .map((rule) => createMentioningRule(fileName, rule))

    return mentioningRules
}
