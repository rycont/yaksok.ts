import { createDynamicRule } from './dynamicRule/index.ts'

import { Node } from '../nodes/index.ts'
import { parseIndent } from './parseIndent.ts'
import { recursiveSRParse } from './srParse.ts'

export function parse(tokens: Node[]) {
    const indentedNodes = parseIndent(tokens)

    const dynamicRules = createDynamicRule(tokens)
    const ast = recursiveSRParse(indentedNodes, dynamicRules)

    return ast
}
