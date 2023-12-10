import { createDynamicPattern } from './parser/dynamicPatterns/index.ts'
import { parseWithIndent } from './parser/parseWithIndent.ts'
import { tokenPreprocessor } from './parser/preprocessor.ts'
import { Piece } from './piece/index.ts'

export function parse(_tokens: Piece[]) {
    const tokens = tokenPreprocessor(_tokens)
    const dynamicPatterns = createDynamicPattern(tokens)
    // console.log(dynamicPatterns)
    const ast = parseWithIndent(tokens, 0, dynamicPatterns)

    return ast
}
