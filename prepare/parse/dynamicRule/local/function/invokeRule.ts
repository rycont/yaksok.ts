import { UnexpectedTokenError } from '../../../../../error/index.ts'
import { Expression } from '../../../../../node/base.ts'
import {
    Evaluable,
    FunctionInvoke,
    Keyword,
    Node,
    ValueWithBracket,
    Variable,
} from '../../../../../node/index.ts'
import { PatternUnit, Rule } from '../../../rule.ts'
import { FunctionHeaderNode } from './functionRuleByType.ts'

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
            return new FunctionInvoke({
                name,
                params: getParamsFromMatchedNodes(subtokens, nodes),
            })
        },
    }
}

function getParamsFromMatchedNodes(
    template: FunctionHeaderNode[],
    matchedNodes: Node[],
) {
    return Object.fromEntries(
        template
            .map((token, i) => [token, matchedNodes[i]])
            .filter(
                (set): set is [Variable, Evaluable] =>
                    set[0] instanceof Variable,
            )
            .map(([token, node]) => [token.name, node]),
    )
}

function functionHeaderToInvokeMap(
    token: FunctionHeaderNode,
): PatternUnit | PatternUnit | null {
    if (token instanceof Variable) {
        return {
            type: ValueWithBracket,
        }
    }

    if (token instanceof Keyword) {
        return {
            type: Keyword,
            value: token.value,
        }
    }

    if (token instanceof Expression) {
        return null
    }

    throw new UnexpectedTokenError({
        position: (token as Node).position,
        resource: {
            node: token,
            parts: '새 약속 만들기',
        },
    })
}

function splitFunctionHeaderWithSpace(_tokens: FunctionHeaderNode[]) {
    const tokens = [..._tokens]
    const result: FunctionHeaderNode[] = []

    for (const token of tokens) {
        if (token instanceof Variable || token instanceof Expression) {
            result.push(token)
            continue
        }

        const splitted = token.value.split(' ')
        result.push(...splitted.map((s) => new Keyword(s)))
    }

    return result
}
