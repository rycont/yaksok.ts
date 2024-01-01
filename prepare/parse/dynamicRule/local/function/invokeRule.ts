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
                params: Object.fromEntries(
                    invokeTemplate
                        .map((unit, i) => [unit, nodes[i]])
                        .filter(([unit]) => unit.as)
                        .map(([unit, node]) => [unit.as!, node]),
                ),
            })
        },
    }
}

function functionHeaderToInvokeMap(token: FunctionHeaderNode): PatternUnit {
    if (token instanceof Variable) {
        return {
            type: Evaluable,
            as: token.name,
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
