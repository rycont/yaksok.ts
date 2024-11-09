import type {
    Evaluable,
    Executable,
    Node,
    ValueTypes,
} from '../src/node/base.ts'
import type { Rule } from '../src/prepare/parse/rule.ts'
import type { Params } from '../src/node/function.ts'

import { FileForRunNotExistError } from '../src/error/prepare.ts'
import { printError } from '../src/error/printError.ts'
import { YaksokError } from '../src/error/common.ts'
import { Scope } from '../src/runtime/scope.ts'
import { run } from '../src/runtime/run.ts'
import { parse } from './prepare/parse/index.ts'
import { tokenize } from './prepare/tokenize/index.ts'
import { ErrorInModuleError } from './error/mention.ts'
import { EnabledFlags } from './contant/feature-flags.ts'

interface YaksokConfig {
    stdout: (message: string) => void
    stderr: (message: string) => void
    entryPoint: string
    runFFI: (runtime: string, code: string, args: Params) => ValueTypes
    flags: EnabledFlags
}

const defaultConfig: YaksokConfig = {
    stdout: console.log,
    stderr: console.error,
    entryPoint: 'main',
    runFFI: (runtime: string) => {
        throw new Error(`FFI ${runtime} not implemented`)
    },
    flags: {},
}

export class CodeRunner {
    functionDeclaration: Node[][] = []
    scope: Scope
    ast: Executable
    exportedRules: Rule[] = []

    constructor(
        private code: string,
        private runtime: Yaksok,
        private fileName: string,
    ) {
        this.scope = new Scope({
            runtime: this.runtime,
        })

        try {
            const parseResult = parse(tokenize(code), this.runtime)

            this.ast = parseResult.ast
            this.exportedRules = parseResult.exportedRules
        } catch (error) {
            if (error instanceof YaksokError) {
                this.runtime.stderr(
                    printError({
                        code: this.code,
                        runtime: this,
                        error,
                    }),
                )
            }

            throw error
        }
    }

    run(): void {
        try {
            return run(this.ast, this.scope)
        } catch (error) {
            if (error instanceof YaksokError) {
                this.runtime.stderr(
                    printError({
                        code: this.code,
                        runtime: this,
                        error,
                    }),
                )
            }

            throw error
        }
    }

    evaluateFromExtern(node: Evaluable): ValueTypes {
        try {
            return run(node, this.scope)
        } catch (error) {
            if (error instanceof YaksokError) {
                this.runtime.stderr(
                    printError({
                        code: this.code,
                        runtime: this,
                        error,
                    }),
                )
            }

            throw new ErrorInModuleError({
                resource: {
                    fileName: this.fileName,
                },
                position: node.position,
            })
        }
    }
}

export class Yaksok implements YaksokConfig {
    stdout: YaksokConfig['stdout']
    stderr: YaksokConfig['stderr']
    entryPoint: YaksokConfig['entryPoint']
    runFFI: YaksokConfig['runFFI']
    flags: Partial<EnabledFlags> = {}

    runners: Record<string, CodeRunner> = {}
    ran: Record<string, boolean> = {}

    constructor(
        public files: Record<string, string>,
        config: Partial<YaksokConfig>,
    ) {
        this.stdout = config.stdout || defaultConfig.stdout
        this.stderr = config.stderr || defaultConfig.stderr
        this.entryPoint = config.entryPoint || defaultConfig.entryPoint
        this.runFFI = config.runFFI || defaultConfig.runFFI
        this.flags = config.flags || defaultConfig.flags
    }

    getRunner(fileName = this.entryPoint): CodeRunner {
        if (!(fileName in this.files)) {
            throw new FileForRunNotExistError({
                resource: {
                    entryPoint: this.entryPoint,
                    files: Object.keys(this.files),
                },
            })
        }

        if (fileName in this.runners) {
            return this.runners[fileName]
        }

        this.runners[fileName] = new CodeRunner(
            this.files[fileName],
            this,
            fileName,
        )
        return this.runners[fileName]
    }

    run(fileName = this.entryPoint): CodeRunner {
        const runner = this.getRunner(fileName)
        runner.run()
        this.ran[fileName] = true

        return runner
    }

    runOnce(fileName = this.entryPoint): CodeRunner {
        const runner = this.getRunner(fileName)
        if (!(fileName in this.ran)) runner.run()

        return runner
    }
}

export function yaksok(
    code: string | Record<string, string>,
    config: Partial<YaksokConfig> = {},
): Yaksok {
    const yaksok = new Yaksok(
        typeof code === 'string'
            ? {
                  [defaultConfig.entryPoint]: code,
              }
            : code,
        config,
    )

    yaksok.run()
    return yaksok
}

export * from '../src/prepare/tokenize/index.ts'
export * from '../src/prepare/parse/index.ts'
