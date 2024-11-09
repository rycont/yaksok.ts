import { createRuleFromFunctionHeader } from './createRuleFromFunctionHeader.ts'

import type { TokenizeResult } from '../../../tokenize/index.ts'
import { Runtime } from '../../../../runtime/index.ts'

export function createLocalDynamicRules(
    { functionHeaders, ffiHeaders }: TokenizeResult,
    runtime: Runtime,
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
