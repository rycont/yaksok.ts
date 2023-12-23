import { parse } from './prepare/parse/index.ts'
import { run } from './runtime/run.ts'
import { Node } from './node/index.ts'
import { Scope } from './runtime/scope.ts'
import { tokenize } from './prepare/tokenize/index.ts'
import { YaksokError } from './error/common.ts'
import { printError } from './error/printError.ts'

interface YaksokConfig {
    stdout?: (message: string) => void
    stderr?: (message: string) => void
}

export class Yaksok {
    functionDeclaration: Node[][] = []
    scope: Scope

    stdout = console.log
    stderr = console.error

    constructor(public config: YaksokConfig = {}) {
        if (config.stdout) this.stdout = config.stdout
        if (config.stderr) this.stderr = config.stderr

        this.scope = new Scope({
            runtime: this,
        })
    }

    run(code: string) {
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
}

export function yaksok(code: string, config: YaksokConfig = {}) {
    const runtime = new Yaksok(config)
    return runtime.run(code)
}
