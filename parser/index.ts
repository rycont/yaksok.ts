import { createDynamicPattern } from './dynamicPatterns/index.ts'

import { Node } from '../nodes/index.ts'
import { parseIndent } from './parseIndent.ts'
import { recursivePatternMatcher } from './patternMatcher.ts'

export function parse(tokens: Node[]) {
    const indentedNodes = parseIndent(tokens)

    const dynamicPatterns = createDynamicPattern(tokens)
    const ast = recursivePatternMatcher(indentedNodes, dynamicPatterns)

    return ast
}
