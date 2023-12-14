import { createDynamicRule } from './dynamicRule/index.ts'
import { parseIndent } from './parseIndent.ts'
import { callParseRecursively } from './srParse.ts'
import { Node } from '../node/index.ts'
import { convertKeywordToVariable } from '../tokenize/convertKeywordToVariable.ts'

interface ParseProps {
    tokens: Node[]
    functionHeaders?: Node[][]
}

export function parse(_props: ParseProps) {
    const props = {
        ..._props,
        functionHeaders:
            _props.functionHeaders ||
            convertKeywordToVariable(_props.tokens).functionHeaders,
    }

    const dynamicRules = createDynamicRule(props)
    const indentedNodes = parseIndent(props.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules)

    return ast
}
