import { getMentioningFiles } from './mentioning-files.ts'
import { getExportedRules } from './get-exported-rules.ts'

import type { CodeFile } from '../../../../type/code-file.ts'
import { ErrorInModuleError } from '../../../../error/mention.ts'
import { TOKEN_TYPE } from '../../../tokenize/token.ts'

export function getRulesFromMentioningFile(codeFile: CodeFile) {
    if (!codeFile.mounted) {
        console.warn(
            'CodeFile is not mounted to Runtime, skips mentioning files',
        )

        return []
    }

    try {
        const rules = getMentioningFiles(codeFile.tokens).flatMap((fileName) =>
            getExportedRules(codeFile.runtime!, fileName),
        )

        return rules
    } catch (e) {
        if (e instanceof ErrorInModuleError && !e.position) {
            const targetFileName = e.resource?.fileName
            if (!targetFileName) throw e

            const firstMentioning = codeFile.tokens.find(
                (token) =>
                    token.type === TOKEN_TYPE.MENTION &&
                    token.value === '@' + targetFileName,
            )

            if (!firstMentioning) throw e

            e.position = {
                ...firstMentioning.position,
            }
        }

        throw e
    }
}
