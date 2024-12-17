import { YaksokError } from '../../../../error/common.ts'
import { ErrorInModuleError } from '../../../../error/mention.ts'
import { FileForRunNotExistError } from '../../../../error/prepare.ts'
import type { Runtime } from '../../../../runtime/index.ts'
import { createMentioningRule } from './create-mentioning-rules.ts'

export function getExportedRules(runtime: Runtime, fileName: string) {
    const runner = runtime.getCodeFile(fileName)
    try {
        const rules = runner.exportedRules

        const mentioningRules = rules
            .filter((rule) => rule.config?.exported)
            .map((rule) => createMentioningRule(fileName, rule))

        return mentioningRules
    } catch (e) {
        if (
            e instanceof YaksokError &&
            !(e instanceof FileForRunNotExistError)
        ) {
            throw new ErrorInModuleError({
                resource: {
                    fileName,
                },
                child: e,
            })
        }

        throw e
    }
}
