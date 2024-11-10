import {
    EnabledFlags,
    FEATURE_FLAG,
} from '../../../../constant/feature-flags.ts'
import { Evaluable } from '../../../../node/base.ts'
import { ValueWithParenthesis } from '../../../../node/calculation.ts'
import { type Node, Identifier, Expression } from '../../../../node/index.ts'
import { isParentheses } from '../../../../util/isBracket.ts'
import { createFunctionDeclareRule } from './declareRule.ts'
import type {
    functionRuleByType,
    FunctionHeaderNode,
} from './functionRuleByType.ts'
import { getVariants } from './getVariants.ts'
import { createFunctionInvokeRule } from './invokeRule.ts'

interface Args {
    subtokens: Node[]
    type: keyof typeof functionRuleByType
    flags: EnabledFlags
}

export function createRuleFromFunctionHeader(args: Args) {
    assertValidFunctionHeader(args.subtokens)

    const name = getFunctionNameFromHeader(args.subtokens)
    const variants = [...getVariants(args.subtokens)]

    const declareRule = createFunctionDeclareRule(name, args.subtokens, {
        type: args.type,
    })

    let invokeRules = variants.map((v) => createFunctionInvokeRule(name, v))

    if (!args.flags[FEATURE_FLAG.FUTURE_FUNCTION_INVOKE_SYNTAX]) {
        invokeRules = invokeRules.map((rule) => ({
            ...rule,
            pattern: rule.pattern.map((unit) => {
                if (unit.type === ValueWithParenthesis) {
                    return {
                        type: Evaluable,
                    }
                }

                return unit
            }),
        }))
    }

    return [declareRule, ...invokeRules]
}

function assertValidFunctionHeader(
    subtokens: Node[],
): asserts subtokens is FunctionHeaderNode[] {
    for (const token of subtokens) {
        if (token instanceof Identifier) continue
        if (isParentheses(token)) continue
    }
}

function getFunctionNameFromHeader(subtokens: FunctionHeaderNode[]) {
    return subtokens.map(functionHeaderToNameMap).filter(Boolean).join(' ')
}

function functionHeaderToNameMap(token: FunctionHeaderNode) {
    if (token instanceof Identifier) {
        return token.value
    }

    if (token instanceof Expression) {
        return null
    }
}
