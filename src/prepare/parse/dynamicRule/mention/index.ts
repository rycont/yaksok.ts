import { getMentioningFiles } from './mentioning-files.ts'
import type { Runtime } from '../../../../runtime/index.ts'
import { Token } from '../../../tokenize/token.ts'
import { getExportedRules } from './get-exported-rules.ts'

export function getRulesFromMentioningFile(tokens: Token[], runtime: Runtime) {
    const rules = getMentioningFiles(tokens).flatMap((fileName) =>
        getExportedRules(runtime, fileName),
    )

    return rules
}
