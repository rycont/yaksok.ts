import type { TokenizeResult } from '../../../tokenize/index.ts'
import type { Yaksok } from '../../../../index.ts'
import { createRuleFromFunctionHeader } from './createRuleFromFunctionHeader.ts'

export function createLocalDynamicRules(
    { functionHeaders, ffiHeaders }: TokenizeResult,
    runtime: Yaksok,
) {
    const functionRules = functionHeaders.flatMap((rule) =>
        createRuleFromFunctionHeader({
            subtokens: rule,
            type: 'yaksok',
            flags: runtime.flags,
        }),
    )

    const ffiRules = ffiHeaders.flatMap((header) =>
        createRuleFromFunctionHeader({
            subtokens: header,
            type: 'ffi',
            flags: runtime.flags,
        }),
    )

    return [...functionRules, ...ffiRules].map((e) => [e])
}
