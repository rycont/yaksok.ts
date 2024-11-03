import {
    type Node,
    Expression,
    Identifier,
    Evaluable,
} from '../../../../node/base.ts'
import { ValueWithParenthesis } from '../../../../node/calculation.ts'
import { FunctionInvoke } from '../../../../node/function.ts'
import { isParentheses, BRACKET_TYPE } from '../../../../util/isBracket.ts'
import type { Rule, PatternUnit } from '../../rule.ts'
import type { FunctionHeaderNode } from './functionRuleByType.ts'

export function createFunctionInvokeRule(
    name: string,
    _subtokens: FunctionHeaderNode[],
): Rule {
    const subtokens = splitFunctionHeaderWithSpace(_subtokens)
    const invokeTemplate = subtokens
        .map(functionHeaderToInvokeMap)
        .filter(Boolean) as PatternUnit[]

    return {
        pattern: invokeTemplate,
        factory(nodes: Node[]) {
            const params = getParamsFromMatchedNodes(subtokens, nodes)
            return new FunctionInvoke({
                name,
                params,
            })
        },
        config: {
            exported: true,
        },
    }
}

function getParamsFromMatchedNodes(
    template: FunctionHeaderNode[],
    matchedNodes: Node[],
) {
    return Object.fromEntries(
        template
            .filter((token) => !(token instanceof Expression))
            .map((token, i) => [token, matchedNodes[i]])
            .filter(
                (set): set is [Identifier, Evaluable] =>
                    set[1] instanceof Evaluable &&
                    !(set[1] instanceof Identifier),
            )
            .map(([token, node]) => [token.value, node]),
    )
}

function functionHeaderToInvokeMap(
    token: FunctionHeaderNode,
    index: number,
    tokenSequence: FunctionHeaderNode[],
): PatternUnit | PatternUnit | null {
    const previousToken = tokenSequence[index - 1]
    const isParameterToken =
        previousToken && isParentheses(previousToken) === BRACKET_TYPE.OPENING
    if (isParameterToken) {
        return {
            type: ValueWithParenthesis,
        }
    }

    if (token instanceof Identifier) {
        return {
            type: Identifier,
            value: token.value,
        }
    }

    return null
}

function splitFunctionHeaderWithSpace(_tokens: FunctionHeaderNode[]) {
    const tokens = [..._tokens]
    const result: FunctionHeaderNode[] = []

    for (const token of tokens) {
        if (token instanceof Expression) {
            result.push(token)
            continue
        }

        const splitted = token.value.split(' ')
        result.push(...splitted.map((s) => new Identifier(s)))
    }

    return result
}
