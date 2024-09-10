import { createDynamicRule } from './dynamicRule/index.ts'
import { TokenizeResult } from '../tokenize/index.ts'
import { callParseRecursively } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import { Yaksok } from '../../index.ts'

let i = 0

export function parse(tokenized: TokenizeResult, runtime?: Yaksok) {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules)
    // console.log(ast.children[1].body.children[0].cases[1].body.children)

    // if (i++ === 1) {
    //     console.log(ast.children[2].cases[0].body.children[2].value)
    // }

    return { ast, dynamicRules }
}
