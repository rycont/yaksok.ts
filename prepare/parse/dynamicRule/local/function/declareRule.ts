import { EOL, StringValue, Variable } from '../../../../../node/index.ts'
import { PatternUnit, Rule } from '../../../rule.ts'
import { FunctionHeaderNode, functionRuleByType } from './functionRuleByType.ts'

export function createFunctionDeclareRule(
    name: string,
    subtokens: FunctionHeaderNode[],
    config: { type: keyof typeof functionRuleByType },
): Rule {
    const declarationTemplate = subtokens.map(functionHeaderToRuleMap)

    const preset = functionRuleByType[config.type]

    return {
        pattern: [
            ...preset.prefix,
            ...declarationTemplate,
            {
                type: EOL,
            },
            {
                type: preset.body,
            },
        ],
        factory: preset.createFactory(subtokens, name),
    }
}

function functionHeaderToRuleMap(token: FunctionHeaderNode): PatternUnit {
    if (token instanceof Variable) {
        return {
            type: Variable,
        }
    }

    return {
        type: StringValue,
        value: token.value,
    }
}
