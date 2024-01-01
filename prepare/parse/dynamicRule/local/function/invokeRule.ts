import {
    Evaluable,
    FunctionInvoke,
    Keyword,
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
        _to: FunctionInvoke,
        pattern: invokeTemplate,
        config: {
            name,
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
