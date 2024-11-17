import { getMentioningFiles } from './mentioning-files.ts'
import { getExportedRules } from './get-exported-rules.ts'

import type { CodeFile } from '../../../../type/code-file.ts'

export function getRulesFromMentioningFile(codeFile: CodeFile) {
    if (!codeFile.mounted) {
        console.warn(
            'CodeFile is not mounted to Runtime, skips mentioning files',
        )

        return []
    }

    const rules = getMentioningFiles(codeFile.tokens).flatMap((fileName) =>
        getExportedRules(codeFile.runtime!, fileName),
    )

    return rules
}
