import { UnexpectedTokenError } from '../../../../error/prepare.ts'
import { Node, Identifier, Expression } from '../../../../node/index.ts'
import { isParentheses, BRACKET_TYPE } from '../../../../util/isBracket.ts'
import { createFunctionDeclareRule } from './declareRule.ts'
import type {
    functionRuleByType,
    FunctionHeaderNode,
} from './functionRuleByType.ts'
import { getVariants } from './getVariants.ts'
import { createFunctionInvokeRule } from './invokeRule.ts'

export function createRuleFromFunctionHeader(
    subtokens: Node[],
    type: keyof typeof functionRuleByType,
) {
    assertValidFunctionHeader(subtokens)

    const name = getFunctionNameFromHeader(subtokens)
    const variants = [...getVariants(subtokens)]

    const declareRule = createFunctionDeclareRule(name, subtokens, {
        type,
    })
    const invokeRules = variants.map((v) => createFunctionInvokeRule(name, v))

    return [declareRule, ...invokeRules]
}

function assertValidFunctionHeader(
    subtokens: Node[],
): asserts subtokens is FunctionHeaderNode[] {
    let isInParenthesis = false

    for (const token of subtokens) {
        if (token instanceof Identifier) continue

        const parenthesisType = isParentheses(token)

        if (parenthesisType === BRACKET_TYPE.OPENING && !isInParenthesis) {
            isInParenthesis = true
            continue
        }

        if (parenthesisType === BRACKET_TYPE.CLOSING && isInParenthesis) {
            isInParenthesis = false
            continue
        }

        throw new UnexpectedTokenError({
            position: subtokens[0].position,
            resource: {
                node: token,
                parts: '새 약속 만들기',
            },
        })
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
