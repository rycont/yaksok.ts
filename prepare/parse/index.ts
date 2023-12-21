import { createDynamicRule } from './dynamicRule/index.ts'
import { parseIndent } from './parseIndent.ts'
import { callParseRecursively } from './srParse.ts'
import { Node } from '../../node/index.ts'

interface ParseProps {
    tokens: Node[]
    functionHeaders: Node[][]
}

export function parse(props: ParseProps) {
    const dynamicRules = createDynamicRule(props)
    const indentedNodes = parseIndent(props.tokens)
    const ast = callParseRecursively(indentedNodes, dynamicRules)

    return ast
}
