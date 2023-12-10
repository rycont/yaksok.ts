import { preprocessor } from './preprocessor.ts'
import { tokenizer } from './tokenizer.ts'
import { parse } from './parser.ts'
import { run } from './runtime.ts'

export class Yaksok {
    preprocessor = preprocessor
    tokenizer = tokenizer
    parser = parse

    run(code: string) {
        const tokens = this.tokenizer(this.preprocessor(code))
        const ast = this.parser(tokens)

        console.log(ast.content)

        run(ast)
    }
}
