import { createDynamicRule } from './dynamicRule/index.ts'
import { TokenizeResult } from '../tokenize/index.ts'
import { callParseRecursively } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import { Yaksok } from '../../index.ts'

export function parse(tokenized: TokenizeResult, runtime?: Yaksok) {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules)
    console.log(tokenized.tokens)
    // console.log(ast.children[5].body.children)
    // console.log(ast.children[5])
    return { ast, dynamicRules }
}
