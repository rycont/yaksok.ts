import { tokenize } from './prepare/tokenize/index.ts'
import { ErrorInModuleError } from './error/index.ts'
import { printError } from './error/printError.ts'
import { parse } from './prepare/parse/index.ts'
import { YaksokError } from './error/common.ts'
import { Rule } from './prepare/parse/rule.ts'
import { Block, Node } from './node/index.ts'
import { Scope } from './runtime/scope.ts'
import { Evaluable } from './node/base.ts'
import { run } from './runtime/run.ts'
import { FileForRunNotExistError } from './error/prepare.ts'

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

export class CodeRunner {
    functionDeclaration: Node[][] = []
    scope: Scope
    ast: Block
    exports: Rule[] = []

    constructor(
        private code: string,
        private runtime: Yaksok,
        private filename: string,
    ) {
        this.scope = new Scope({
            runtime: this.runtime,
        })

        const parseResult = parse(tokenize(code), this.runtime)

        this.ast = parseResult.ast
        this.exports = parseResult.dynamicRules
    }

    run() {
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

    evaluateFromExtern(node: Evaluable) {
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
                    filename: this.filename,
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

    runners: Record<string, CodeRunner> = {}
    ran: Record<string, boolean> = {}

    constructor(
        public files: Record<string, string>,
        config: Partial<YaksokConfig>,
    ) {
        this.stdout = config.stdout || defaultConfig.stdout
        this.stderr = config.stderr || defaultConfig.stderr
        this.entryPoint = config.entryPoint || defaultConfig.entryPoint
    }

    getRunner(filename = this.entryPoint) {
        if (!(filename in this.files)) {
            throw new FileForRunNotExistError({
                resource: {
                    entryPoint: this.entryPoint,
                    files: Object.keys(this.files),
                },
            })
        }

        if (filename in this.runners) {
            return this.runners[filename]
        }

        this.runners[filename] = new CodeRunner(
            this.files[filename],
            this,
            filename,
        )
        return this.runners[filename]
    }

    run(filename = this.entryPoint) {
        const runner = this.getRunner(filename)
        return runner.run()
    }

    runOnce(filename = this.entryPoint) {
        const runner = this.getRunner(filename)
        if (!(filename in this.ran)) runner.run()

        return runner
    }
}

export function yaksok(
    code: string | Record<string, string>,
    config: Partial<YaksokConfig> = {},
) {
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
