import { createDynamicRule } from './dynamicRule/index.ts'
import { SetVariable } from '../../node/variable.ts'
import { callParseRecursively } from './srParse.ts'
import { Identifier } from '../../node/index.ts'
import { parseIndent } from './parse-indent.ts'
import { Token } from '../tokenize/token.ts'
import { convertTokensToNodes } from '../tokenize/convert-tokens-to-nodes.ts'

import type { FileRunner } from '../../runtime/file-runner.ts'
import type { Block } from '../../node/block.ts'
import type { Rule } from './rule.ts'

interface ParseResult {
    ast: Block
    exportedRules: Rule[]
}

export function parse(tokens: Token[], fileRunner?: FileRunner): ParseResult {
    const dynamicRules = createDynamicRule(tokens, fileRunner)
    const indentedNodes = parseIndent(convertTokensToNodes(tokens))

    const ast = callParseRecursively(indentedNodes, dynamicRules) as Block
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
