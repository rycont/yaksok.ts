import { UnexpectedTokenError } from '../../../../../error/index.ts'
import { Expression, Keyword } from '../../../../../node/base.ts'
import { EOL, Node, Variable } from '../../../../../node/index.ts'
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

    if (token instanceof Keyword) {
        return {
            type: Keyword,
            value: token.value,
        }
    }

    if (token instanceof Expression) {
        return {
            type: Expression,
            value: token.value,
        }
    }

    throw new UnexpectedTokenError({
        position: (token as Node).position,
        resource: {
            node: token,
            parts: '새 약속 만들기',
        },
    })
}
