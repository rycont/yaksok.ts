import { createDynamicRule } from './dynamicRule/index.ts'
import { parseIndent } from './parseIndent.ts'
import { SRParse } from './srParse.ts'
import { Node } from '../node/index.ts'
import { convertFunctionArgumentsToVariable } from '../tokenize/convertFunctionArgumentsToVariable.ts'

interface ParseProps {
    tokens: Node[]
    functionHeaders?: Node[][]
}

export function parse(_props: ParseProps) {
    const props = {
        ..._props,
        functionHeaders:
            _props.functionHeaders ||
            convertFunctionArgumentsToVariable(_props.tokens).functionHeaders,
    }

    const dynamicRules = createDynamicRule(props)
    const indentedNodes = parseIndent(props.tokens)

    const ast = SRParse(indentedNodes, dynamicRules)

    return ast
}
