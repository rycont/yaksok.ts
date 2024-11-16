import { YaksokError } from '../error/common.ts'
import { ErrorInModuleError } from '../error/mention.ts'
import { printError } from '../error/printError.ts'
import { Evaluable, Executable, Node, ValueTypes } from '../node/base.ts'
import { parse } from '../prepare/parse/index.ts'
import { Rule } from '../prepare/parse/rule.ts'
import { tokenize } from '../prepare/tokenize/index.ts'
import { Scope } from '../executer/scope.ts'
import type { Runtime } from './index.ts'
import { executer } from '../executer/index.ts'

export class FileRunner {
    functionDeclareRanges?: [number, number][]
    scope: Scope
    ast?: Executable

    functionDeclaration: Node[][] = []
    exportedRules: Rule[] = []

    public ran = false
    public prepared = false

    constructor(
        private code: string,
        private runtime: Runtime,
        private fileName: string,
    ) {
        this.scope = new Scope({
            runtime: this.runtime,
        })
    }

    prepare(): void {
        if (this.prepared) {
            return
        }

        try {
            const parseResult = parse(tokenize(this.code), this.runtime)

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

        this.prepared = true
    }

    run(): void {
        this.ran = true
        if (!this.prepared) {
            this.prepare()
        }

        try {
            return executer(this.ast!, this.scope)
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
            return executer(node, this.scope)
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
