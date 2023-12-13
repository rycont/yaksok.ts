import { createDynamicPattern } from './dynamicPatterns/index.ts'
import { convertFunctionArgumentsToVariable } from './convertFunctionArgumentsToVariable.ts'

import { Piece } from '../piece/index.ts'
import { parseIndent } from './parseIndent.ts'
import { recursivePatternMatcher } from './patternMatcher.ts'

export function parse(_tokens: Piece[]) {
    const tokens = convertFunctionArgumentsToVariable(_tokens)
    const indentedNodes = parseIndent(tokens)

    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = recursivePatternMatcher(indentedNodes, dynamicPatterns)

    return ast
}
