import { getFunctionTemplatesFromTokens } from './get-function-templates.ts'
import { Token, TOKEN_TYPE } from '../../../tokenize/token.ts'
import { createFunctionInvokeRule } from './invoke-rule.ts'
import { createDeclareRulesFromPreset } from './declare-rule.ts'
import { FFI_PRESET, YAKSOK_PRESET } from './declare-preset.ts'

export function createLocalDynamicRules(tokens: Token[]) {
    const yaksokTemplates = getFunctionTemplatesFromTokens(
        tokens,
        isYaksokStartingPattern,
        'yaksok',
    )

    const ffiTemplates = getFunctionTemplatesFromTokens(
        tokens,
        isFfiStartingPattern,
        'ffi',
    )

    const yaksokInvokeRules = yaksokTemplates.flatMap(createFunctionInvokeRule)
    const ffiInvokeRules = ffiTemplates.flatMap(createFunctionInvokeRule)

    const yaksokDeclareRules = yaksokTemplates.map((template) =>
        createDeclareRulesFromPreset(template, YAKSOK_PRESET),
    )

    const ffiDeclareRules = ffiTemplates.map((template) =>
        createDeclareRulesFromPreset(template, FFI_PRESET),
    )

    const allRules = [
        ...yaksokInvokeRules,
        ...ffiInvokeRules,
        ...yaksokDeclareRules,
        ...ffiDeclareRules,
    ].toSorted(
        (a, b) => b.pattern.length - a.pattern.length,
    )

    return allRules
}

function isYaksokStartingPattern(_: Token, index: number, allTokens: Token[]) {
    const prevPrevToken = allTokens[index - 2]
    const prevToken = allTokens[index - 1]

    if (!prevPrevToken || !prevToken) return false

    const isPrevPrevTokenYaksokKeyword =
        prevPrevToken.type === TOKEN_TYPE.IDENTIFIER &&
        prevPrevToken.value === '약속'

    if (!isPrevPrevTokenYaksokKeyword) return false

    const isPrevTokenComma = prevToken.type === TOKEN_TYPE.COMMA

    return isPrevTokenComma
}

function isFfiStartingPattern(_: Token, index: number, allTokens: Token[]) {
    const prev5Tokens = allTokens.slice(index - 5)
    if (prev5Tokens.length < 5) return false

    function shift() {
        const shifted = prev5Tokens.shift()!

        if (shifted?.type === TOKEN_TYPE.SPACE) {
            return shift()
        }

        if (!shifted) return null

        return shifted
    }

    const first = shift()!
    if (first.type !== TOKEN_TYPE.IDENTIFIER) return false
    if (first.value !== '번역') return false

    const second = shift()!
    if (second.type !== TOKEN_TYPE.OPENING_PARENTHESIS) return false

    const third = shift()!
    if (third.type !== TOKEN_TYPE.IDENTIFIER) return false

    const fourth = shift()!
    if (fourth.type !== TOKEN_TYPE.CLOSING_PARENTHESIS) return false

    const fifth = shift()!
    return fifth?.type === TOKEN_TYPE.COMMA
}
