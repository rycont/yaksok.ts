import { tokenize } from './tokenize.ts'
import { parse } from './parser.ts'
import { run } from './runtime.ts'

export function yaksok(code: string) {
    const tokens = tokenize(code)
    const ast = parse(tokens)

    return run(ast)
}
