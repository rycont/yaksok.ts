import { createDynamicRule } from './dynamicRule/index.ts'
import { parseIndent } from './parseIndent.ts'
import { SRParse } from './srParse.ts'
import { Node } from '../node/index.ts'
import { Yaksok } from '../index.ts'

export function parse(this: Yaksok | unknown, tokens: Node[]) {
    const dynamicRules = createDynamicRule(tokens)
    const indentedNodes = parseIndent(tokens)

    const ast = SRParse(indentedNodes, dynamicRules)

    return ast
}
