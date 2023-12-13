import { createDynamicPattern } from './dynamicPatterns/index.ts'
import { parserPreprocessor } from './preprocessor.ts'

import { Piece } from '../piece/index.ts'
import { parseIndent } from './parseIndent.ts'
import { recursivePatternMatcher } from './patternMatcher.ts'

export function parse(_tokens: Piece[]) {
    const tokens = parserPreprocessor(_tokens)
    const indentedNodes = parseIndent(tokens)

    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = recursivePatternMatcher(indentedNodes, dynamicPatterns)

    return ast
}
