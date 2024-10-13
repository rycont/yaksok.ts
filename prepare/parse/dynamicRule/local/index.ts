import { TokenizeResult } from '../../../tokenize/index.ts'
import { createRuleFromFunctionHeader } from './createRuleFromFunctionHeader.ts'

export function createLocalDynamicRules({
    functionHeaders,
    ffiHeaders,
}: TokenizeResult) {
    const functionRules = functionHeaders.flatMap((rule) =>
        createRuleFromFunctionHeader(rule, 'yaksok'),
    )

    const ffiRules = ffiHeaders.flatMap((header) =>
        createRuleFromFunctionHeader(header, 'ffi'),
    )

    return [...functionRules, ...ffiRules].map((e) => [e])
}
