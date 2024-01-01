import { EOL, StringValue, Variable } from '../../../../../node/index.ts'
import { PatternUnit, Rule } from '../../../rule.ts'
import { FunctionHeaderNode, functionRuleByType } from './functionRuleByType.ts'

export function createFunctionDeclareRule(
    name: string,
    subtokens: FunctionHeaderNode[],
    config: { type: keyof typeof functionRuleByType },
): Rule {
    const declarationTemplate = subtokens.map(functionHeaderToRuleMap)
    const factory = functionRuleByType[config.type]

    return {
        _to: factory.target,
        pattern: [
            ...factory.prefix,
            ...declarationTemplate,
            {
                type: EOL,
            },
            {
                type: factory.body,
                as: 'body',
            },
        ],
        config: {
            name,
        },
        factory() {
            throw new Error('factory not implemented')
        },
    }
}

function functionHeaderToRuleMap(token: FunctionHeaderNode): PatternUnit {
    if (token instanceof Variable) {
        return {
            type: Variable,
            as: token.name,
        }
    }

    return {
        type: StringValue,
        value: token.value,
    }
}
