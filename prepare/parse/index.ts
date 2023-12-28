import { createDynamicRule } from './dynamicRule/index.ts'
import { callParseRecursively } from './srParse.ts'
import { tokenize } from '../tokenize/index.ts'
import { parseIndent } from './parseIndent.ts'
import { Yaksok } from '../../index.ts'

export function parse(
    tokenized: ReturnType<typeof tokenize>,
    runtime?: Yaksok,
) {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules)

    return { ast, dynamicRules }
}
