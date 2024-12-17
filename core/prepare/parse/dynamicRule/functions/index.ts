import { getFunctionTemplatesFromTokens } from './get-function-templates.ts'
import { createFunctionInvokeRule } from './invoke-rule.ts'
import { getFunctionDeclareRanges } from '../../../../util/get-function-declare-ranges.ts'

import type { Token } from '../../../tokenize/token.ts'

export function createLocalDynamicRules(
    tokens: Token[],
    functionDeclareRanges: [number, number][] = getFunctionDeclareRanges(
        tokens,
    ),
) {
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

    const allRules = [...yaksokInvokeRules, ...ffiInvokeRules].toSorted(
        (a, b) => b.pattern.length - a.pattern.length,
    )

    return allRules
}
