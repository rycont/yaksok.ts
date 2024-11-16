import { Expression, Identifier, Operator } from '../../../../node/base.ts'
import { FunctionTemplatePiece } from '../../../../type/function-template.ts'
import { FunctionTemplate } from '../../../../type/function-template.ts'
import { PatternUnit, Rule } from '../../rule.ts'
import { FunctionDeclareRulePreset } from './type.ts'

export function createDeclareRulesFromPreset(
    template: FunctionTemplate,
    preset: FunctionDeclareRulePreset,
): Rule {
    const pattern = [
        ...preset.prefix,
        ...template.pieces.flatMap(mapTemplatePieceToPatternUnit),
        ...preset.postfix,
    ]

    return {
        pattern,
        factory: preset.createFactory(template),
        config: {
            exported: true,
        },
    }
}

function mapTemplatePieceToPatternUnit(
    piece: FunctionTemplatePiece,
): PatternUnit[] {
    if (piece.type === 'static') {
        const units = []

        for (const value of piece.value) {
            units.push({
                type: Identifier,
                value,
            })
            units.push({
                type: Operator,
                value: '/',
            })
        }

        units.pop()
        return units
    }

    return [
        {
            type: Expression,
            value: '(',
        },
        {
            type: Identifier,
            value: piece.value[0],
        },
        {
            type: Expression,
            value: ')',
        },
    ]
}
