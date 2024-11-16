import { getFunctionTemplatesFromTokens } from './get-function-templates.ts'
import { Token } from '../../../tokenize/token.ts'
import { createFunctionInvokeRule } from './invoke-rule.ts'
import { FileRunner } from '../../../../runtime/file-runner.ts'
import { getFunctionDeclareRanges } from '../../../../util/get-function-declare-ranges.ts'

export function createLocalDynamicRules(
    tokens: Token[],
    fileRunner?: FileRunner,
) {
    const functionDeclareRanges =
        fileRunner?.functionDeclareRanges || getFunctionDeclareRanges(tokens)

    const yaksokTemplates = getFunctionTemplatesFromTokens(
        tokens,
        functionDeclareRanges,
        'yaksok',
    )

    const ffiTemplates = getFunctionTemplatesFromTokens(
        tokens,
        functionDeclareRanges,
        'ffi',
    )

    const yaksokInvokeRules = yaksokTemplates.flatMap(createFunctionInvokeRule)
    const ffiInvokeRules = ffiTemplates.flatMap(createFunctionInvokeRule)

    console.log(yaksokInvokeRules)

    const allRules = [...yaksokInvokeRules, ...ffiInvokeRules].toSorted(
        (a, b) => b.pattern.length - a.pattern.length,
    )

    return allRules
}
