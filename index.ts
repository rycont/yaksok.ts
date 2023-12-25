import { parse } from './prepare/parse/index.ts'
import { run } from './runtime/run.ts'
import { Node } from './node/index.ts'
import { Scope } from './runtime/scope.ts'
import { tokenize } from './prepare/tokenize/index.ts'
import { YaksokError } from './error/common.ts'
import { printError } from './error/printError.ts'
import { EntryPointNotExistError } from './error/index.ts'

interface YaksokConfig {
    stdout: (message: string) => void
    stderr: (message: string) => void
    entryPoint: string
}

const defaultConfig: YaksokConfig = {
    stdout: console.log,
    stderr: console.error,
    entryPoint: 'main',
}

export class Yaksok {
    functionDeclaration: Node[][] = []
    scope: Scope

    stdout: YaksokConfig['stdout']
    stderr: YaksokConfig['stderr']
    entryPoint: YaksokConfig['entryPoint']

    constructor(
        public codes: Record<string, string>,
        config: Partial<YaksokConfig> = {},
    ) {
        const { stdout, stderr, entryPoint } = {
            ...defaultConfig,
            ...config,
        }

        this.stdout = stdout
        this.stderr = stderr
        this.entryPoint = entryPoint

        this.scope = new Scope({
            runtime: this,
        })
    }

    run() {
        this.assertEntryCodeExists()

        const code = this.codes[this.entryPoint]

        const tokens = tokenize(code)
        const ast = parse(tokens)

        try {
            return run(ast, this.scope, code)
        } catch (error) {
            if (error instanceof YaksokError) {
                this.stderr(
                    printError({
                        error,
                        code,
                        runtime: this,
                    }),
                )
            }

            throw error
        }
    }

    assertEntryCodeExists() {
        if (this.entryPoint in this.codes) {
            return
        }

        throw new EntryPointNotExistError({
            resource: {
                entryPoint: this.entryPoint,
                files: Object.keys(this.codes),
            },
        })
    }
}

export function yaksok(
    code: string | Record<string, string>,
    config: Partial<YaksokConfig> = {},
) {
    const codes: Record<string, string> =
        typeof code === 'string'
            ? {
                  [defaultConfig.entryPoint]: code,
              }
            : code

    const runtime = new Yaksok(codes, config)
    return runtime.run()
}
