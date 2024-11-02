import { createDynamicRule } from './dynamicRule/index.ts'
import type { TokenizeResult } from '../tokenize/index.ts'
import { callParseRecursively } from './srParse.ts'
import { parseIndent } from './parseIndent.ts'
import type { Yaksok } from '../../index.ts'
import type { Block } from '../../node/block.ts'
import { SetVariable } from '../../node/variable.ts'
import type { Rule } from './rule.ts'
import { Identifier } from '../../node/index.ts'

interface ParseResult {
    ast: Block
    exportedRules: Rule[]
}

export function parse(tokenized: TokenizeResult, runtime: Yaksok): ParseResult {
    const dynamicRules = createDynamicRule(tokenized, runtime)
    const indentedNodes = parseIndent(tokenized.tokens)

    const ast = callParseRecursively(
        indentedNodes,
        dynamicRules,
        'Block',
    ) as Block
    const exportedVariables = getExportedVariablesRules(ast)

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
