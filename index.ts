import { tokenizer } from './tokenizer.ts'
// import { parser } from './parser.ts'

export class Yaksok {
    // preprocessor = new Preprocessor()
    tokenizer = tokenizer
    // parser = parser

    run(code: string) {
        const tokens = this.tokenizer(code)
        console.log(tokens)
        // const ast = this.parser(tokens)
        // console.log(JSON.stringify(ast, null, 2))
    }
}
