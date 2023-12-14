import { parse } from './parse/index.ts'
import { run } from './runtime/run.ts'
import { Node } from './node/index.ts'
import { Scope } from './runtime/scope.ts'
import { tokenize } from './tokenize/index.ts'

export class Yaksok {
    functionDeclaration: Node[][] = []
    scope: Scope

    constructor() {
        this.scope = new Scope()
    }

    run(code: string) {
        const tokens = tokenize(code)
        const ast = parse(tokens)

        return run(ast, this.scope)
    }
}

export function yaksok(code: string) {
    const runtime = new Yaksok()
    return runtime.run(code)
}
