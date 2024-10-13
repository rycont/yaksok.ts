import { UnexpectedTokenError } from '../../../../error/prepare.ts'
import { Identifier, Expression, Node } from '../../../../node/index.ts'
import { EOL } from '../../../../node/misc.ts'
import type { Rule, PatternUnit } from '../../rule.ts'
import {
    type FunctionHeaderNode,
    functionRuleByType,
} from './functionRuleByType.ts'

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
    // if (token instanceof Variable) {
    //     return {
    //         type: Variable,
    //     }
    // }

    if (token instanceof Identifier) {
        return {
            type: Identifier,
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
