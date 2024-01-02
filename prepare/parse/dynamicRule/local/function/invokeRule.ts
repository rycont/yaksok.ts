import {
    Evaluable,
    FunctionInvoke,
    Keyword,
    Node,
    StringValue,
    Variable,
} from '../../../../../node/index.ts'
import { PatternUnit, Rule } from '../../../rule.ts'
import { FunctionHeaderNode } from './functionRuleByType.ts'

export function createFunctionInvokeRule(
    name: string,
    _subtokens: FunctionHeaderNode[],
): Rule {
    const subtokens = splitFunctionHeaderWithSpace(_subtokens)
    const invokeTemplate = subtokens.map(functionHeaderToInvokeMap)

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

function functionHeaderToInvokeMap(token: FunctionHeaderNode): PatternUnit {
    if (token instanceof Variable) {
        return {
            type: Evaluable,
        }
    }

    return {
        type: Keyword,
        value: token.value,
    }
}

function splitFunctionHeaderWithSpace(_tokens: FunctionHeaderNode[]) {
    const tokens = [..._tokens]
    const result: FunctionHeaderNode[] = []

    for (const token of tokens) {
        if (token instanceof Variable) {
            result.push(token)
            continue
        }

        const splitted = token.value.split(' ')
        result.push(...splitted.map((s) => new StringValue(s)))
    }

    return result
}
