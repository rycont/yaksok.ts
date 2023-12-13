import { createDynamicPattern } from './parser/dynamicPatterns/index.ts'
import { parseWithIndent } from './parser/parseWithIndent.ts'
import { parserPreprocessor } from './parser/preprocessor.ts'

import { Piece } from './piece/index.ts'

export function parse(_tokens: Piece[]) {
    const tokens = parserPreprocessor(_tokens)
    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = parseWithIndent(tokens, 0, dynamicPatterns)

    return ast
}
