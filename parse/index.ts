import { createDynamicRule } from './dynamicRule/index.ts'
import { SRParse } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import { Node } from '../node/index.ts'

export function parse(tokens: Node[]) {
    const dynamicRules = createDynamicRule(tokens)

    const indentedNodes = parseIndent(tokens)
    const ast = SRParse(indentedNodes, dynamicRules)

    return ast
}
