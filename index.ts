import { _LEGACY__parse, parse } from './prepare/parse/index.ts'
import { evaluate, run } from './runtime/run.ts'
import { Block, Node } from './node/index.ts'
import { Scope } from './runtime/scope.ts'
import { tokenize } from './prepare/tokenize/index.ts'
import { YaksokError } from './error/common.ts'
import { printError } from './error/printError.ts'
import { Rule } from './prepare/parse/rule.ts'
import { CallFrame } from './runtime/callFrame.ts'
import { Evaluable } from './node/base.ts'
import { ErrorInModuleError } from './error/index.ts'

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
            return evaluate(node, this.scope)
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

    getRunner(filename: string) {
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

    return yaksok.run()
}
