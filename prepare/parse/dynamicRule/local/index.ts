import { TokenizeResult } from '../../../tokenize/index.ts'
// import { getDynamicRulesFromPattern } from './fromPattern/index.ts'
import { createFunctionRules } from './function/index.ts'

export function createLocalDynamicRules({
    functionHeaders,
    ffiHeaders,
}: TokenizeResult) {
    const functionRules = functionHeaders.flatMap((rule) =>
        createFunctionRules(rule, 'yaksok'),
    )

    const ffiRules = ffiHeaders.flatMap((header) =>
        createFunctionRules(header, 'ffi'),
    )

    return [...functionRules, ...ffiRules].map((e) => [e])
}
