import { createDynamicRule } from './dynamicRule/index.ts'
import { TokenizeResult } from '../tokenize/index.ts'
import { callParseRecursively } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import { Yaksok } from '../../index.ts'

export function parse(tokenized: TokenizeResult, runtime?: Yaksok) {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules)

    return { ast, dynamicRules }
}
