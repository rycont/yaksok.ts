import { UnexpectedTokenError } from '../../../../../error/prepare.ts'
import { Keyword, Node, Variable } from '../../../../../node/index.ts'
import { BRACKET_TYPE, isBracket } from '../../../../../util/isBracket.ts'
import { createFunctionDeclareRule } from './declareRule.ts'
import { FunctionHeaderNode, functionRuleByType } from './functionRuleByType.ts'
import { getVariants } from './getVariants.ts'
import { createFunctionInvokeRule } from './invokeRule.ts'

export function createFunctionRules(
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
    let isInBracket = false

    for (const token of subtokens) {
        if (token instanceof Variable) continue
        if (token instanceof Keyword) continue

        const bracketType = isBracket(token)

        if (bracketType === BRACKET_TYPE.OPENING && !isInBracket) {
            isInBracket = true
            continue
        }

        if (bracketType === BRACKET_TYPE.CLOSING && isInBracket) {
            isInBracket = false
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
    return subtokens.map(functionHeaderToNameMap).join(' ')
}

function functionHeaderToNameMap(token: FunctionHeaderNode) {
    if (token instanceof Variable) {
        return token.name
    } else {
        return token.value
    }
}
