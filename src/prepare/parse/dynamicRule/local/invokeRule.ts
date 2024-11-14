import { FunctionParams } from '../../../../constant/type.ts'
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

    const paramNameIndexMap = getParamNameIndexMapFromHeader(subtokens)

    return {
        pattern: invokeTemplate,
        factory(nodes: Node[]) {
            const params = getParamsFromMatchedNodes(paramNameIndexMap, nodes)

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
    paramNameIndexMap: Map<string, number>,
    nodes: Node[],
) {
    const params = {} as FunctionParams

    for (const [paramName, index] of paramNameIndexMap) {
        const node = nodes[index]

        if (!(node instanceof Evaluable)) {
            throw new Error('Node is not Evaluable')
        }

        params[paramName] = node
    }

    return params
}

function getParamNameIndexMapFromHeader(
    functionHeaderNodes: FunctionHeaderNode[],
) {
    let parenthesesCount = 0

    const paramNameIndexMap = new Map(
        (
            functionHeaderNodes
                .map((token, index) => {
                    if (token instanceof Expression) {
                        parenthesesCount += 1
                        return null
                    }

                    const prevToken = functionHeaderNodes[index - 1]
                    const nextToken = functionHeaderNodes[index + 1]

                    if (!prevToken || !nextToken) {
                        return null
                    }

                    const isPreviousTokenOpeningParentheses =
                        isParentheses(prevToken) === BRACKET_TYPE.OPENING
                    const isNextTokenClosingParentheses =
                        isParentheses(nextToken) === BRACKET_TYPE.CLOSING

                    if (
                        !isPreviousTokenOpeningParentheses ||
                        !isNextTokenClosingParentheses
                    ) {
                        return null
                    }

                    return [token, index - parenthesesCount]
                })
                .filter(Boolean) as [FunctionHeaderNode, number][]
        ).map(([token, index]) => [token.value, index]),
    )

    return paramNameIndexMap
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
