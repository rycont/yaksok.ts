import { createDynamicPattern } from './dynamicPatterns/index.ts'
import { convertFunctionArgumentsToVariable } from './convertFunctionArgumentsToVariable.ts'

import { Node } from '../nodes/index.ts'
import { parseIndent } from './parseIndent.ts'
import { recursivePatternMatcher } from './patternMatcher.ts'

export function parse(_tokens: Node[]) {
    const tokens = convertFunctionArgumentsToVariable(_tokens)
    const indentedNodes = parseIndent(tokens)

    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = recursivePatternMatcher(indentedNodes, dynamicPatterns)

    return ast
}
