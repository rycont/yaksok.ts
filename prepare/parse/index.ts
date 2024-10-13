import { createDynamicRule } from './dynamicRule/index.ts'
import { TokenizeResult } from '../tokenize/index.ts'
import { callParseRecursively } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import { Yaksok } from '../../index.ts'
import { Block } from '../../node/block.ts'
import { SetVariable } from '../../node/variable.ts'
import type { Rule } from './rule.ts'
import { Identifier } from '../../node/index.ts'

export function parse(tokenized: TokenizeResult, runtime?: Yaksok) {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(indentedNodes, dynamicRules, 'Block')
    const exportedVariables =
        ast instanceof Block ? getExportedVariablesRules(ast) : []

    const exportedRules = [...dynamicRules.flat(), ...exportedVariables]

    return { ast, exportedRules }
}

function getExportedVariablesRules(ast: Block): Rule[] {
    const declaredVariables = ast.children
        .filter((node) => node instanceof SetVariable)
        .map((node) => node.name)

    return declaredVariables.map(
        (variableName) =>
            ({
                pattern: [
                    {
                        type: Identifier,
                        value: variableName,
                    },
                ],
                factory: () => new Identifier(variableName),
                config: {
                    exported: true,
                },
            } satisfies Rule),
    )
}
