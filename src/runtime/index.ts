import { DEFAULT_RUNTIME_CONFIG, RuntimeConfig } from './runtime-config.ts'
import { EnabledFlags } from '../constant/feature-flags.ts'

import { FileForRunNotExistError } from '../error/prepare.ts'
import { CodeFile } from '../type/code-file.ts'
import { printError } from '../error/printError.ts'
import { YaksokError } from '../error/common.ts'

export class Runtime {
    stdout: RuntimeConfig['stdout']
    stderr: RuntimeConfig['stderr']
    entryPoint: RuntimeConfig['entryPoint']
    runFFI: RuntimeConfig['runFFI']
    flags: Partial<EnabledFlags> = {}

    files: Record<string, CodeFile> = {}

    constructor(
        codeTexts: Record<string, string>,
        config: Partial<RuntimeConfig>,
    ) {
        this.stdout = config.stdout || DEFAULT_RUNTIME_CONFIG.stdout
        this.stderr = config.stderr || DEFAULT_RUNTIME_CONFIG.stderr
        this.runFFI = config.runFFI || DEFAULT_RUNTIME_CONFIG.runFFI

        this.entryPoint = config.entryPoint || DEFAULT_RUNTIME_CONFIG.entryPoint
        this.flags = config.flags || DEFAULT_RUNTIME_CONFIG.flags

        for (const [fileName, text] of Object.entries(codeTexts)) {
            const codeFile = new CodeFile(text, fileName)
            codeFile.mount(this)

            this.files[fileName] = codeFile
        }
    }

    run(fileName = this.entryPoint) {
        const codeFile = this.files[fileName]

        if (!codeFile) {
            throw new FileForRunNotExistError({
                resource: {
                    fileName: fileName,
                    files: Object.keys(this.files),
                },
            })
        }

        try {
            return codeFile.run()
        } catch (e) {
            throw e
        }
    }

    public getCodeFile(fileName: string = this.entryPoint) {
        if (!this.files[fileName]) {
            throw new FileForRunNotExistError({
                resource: {
                    fileName: this.entryPoint,
                    files: Object.keys(this.files),
                },
            })
        }

        return this.files[fileName]
    }
}

export function yaksok(
    code: string | Record<string, string>,
    config: Partial<RuntimeConfig> = {},
) {
    let runtime: Runtime

    if (typeof code === 'string') {
        runtime = new Runtime({ main: code }, config)
    } else {
        runtime = new Runtime(code, config)
    }

    try {
        runtime.run()

        return {
            runtime,
            scope: runtime.getCodeFile().runResult!.scope,
        }
    } catch (e) {
        if (e instanceof YaksokError) {
            console.error(printError(e))
        }

        throw e
    }
}
