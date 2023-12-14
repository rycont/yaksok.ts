import { tokenize } from './tokenize/index.ts'
import { parse } from './parse/index.ts'
import { run } from './runtime/run.ts'

export function yaksok(code: string) {
    const tokens = tokenize(code)
    const ast = parse(tokens)

    return run(ast)
}
