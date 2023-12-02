import { tokenizer } from "./tokenizer.ts"

export class Yaksok {
    // preprocessor = new Preprocessor()
    tokenizer = tokenizer

    run(code: string) {
        const tokens = this.tokenizer(code)
        console.log(tokens)
    }
}