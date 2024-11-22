import { convertTokensToNodes } from '../tokenize/convert-tokens-to-nodes.ts'
import { createDynamicRule } from './dynamicRule/index.ts'
import { SetVariable } from '../../node/variable.ts'
import { callParseRecursively } from './srParse.ts'
import { Identifier } from '../../node/base.ts'
import { parseIndent } from './parse-indent.ts'
import { Block } from '../../node/block.ts'

import type { CodeFile } from '../../type/code-file.ts'
import type { Rule } from './rule.ts'

interface ParseResult {
    ast: Block
    exportedRules: Rule[]
}

export function parse(codeFile: CodeFile): ParseResult {
    const dynamicRules = createDynamicRule(codeFile)
    const indentedNodes = parseIndent(convertTokensToNodes(codeFile.tokens))

    const ast = new Block(callParseRecursively(indentedNodes, dynamicRules))

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
