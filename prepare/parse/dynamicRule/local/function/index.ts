import { UnexpectedTokenError } from '../../../../../error/prepare.ts'
import { Node, StringValue, Variable } from '../../../../../node/index.ts'
import { PatternUnit } from '../../../rule.ts'
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

    return [
        createFunctionDeclareRule(name, subtokens, {
            type,
        }),
        ...variants.map((v) => createFunctionInvokeRule(name, v)),
    ]
}

function assertValidFunctionHeader(
    subtokens: Node[],
): asserts subtokens is FunctionHeaderNode[] {
    for (const token of subtokens) {
        if (token instanceof Variable) continue
        if (token instanceof StringValue) continue

        throw new UnexpectedTokenError({
            position: subtokens[0].position,
            resource: {
                node: token,
                parts: '약속 만들기',
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
