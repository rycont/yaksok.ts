import { FunctionParams } from '../../../../constant/type.ts'
import { Evaluable, Identifier, Node } from '../../../../node/base.ts'
import { FunctionInvoke } from '../../../../node/function.ts'
import {
    FunctionTemplate,
    FunctionTemplatePiece,
} from '../../../../type/function-template.ts'
import { PatternUnit } from '../../rule.ts'
import { Rule } from '../../rule.ts'
import { getCombination } from './combination.ts'

interface VariantedPart {
    index: number
    candidates: string[]
}

export function createFunctionInvokeRule(
    functionTemplate: FunctionTemplate,
): Rule[] {
    const variantParts = [...getVariantParts(functionTemplate.pieces)]
    const availableCombinations = getCombination(
        variantParts.map((v) => v.candidates.map((_, i) => i)),
    )

    const templatePieces = availableCombinations.map((choice) =>
        createTemplatePieceFromChoices(
            functionTemplate.pieces,
            variantParts,
            choice,
        ),
    )

    const rules = templatePieces.map((pieces) =>
        createRuleFromFunctionTemplate({
            ...functionTemplate,
            pieces,
        }),
    )

    return rules
}

function* getVariantParts(
    templatePieces: FunctionTemplatePiece[],
): Iterable<VariantedPart> {
    for (const templatePieceIndex in templatePieces) {
        const templatePiece = templatePieces[templatePieceIndex]

        const isStatic = templatePiece.type === 'static'
        const hasSlash = templatePiece.value.length

        if (isStatic && hasSlash) {
            yield {
                index: +templatePieceIndex,
                candidates: templatePiece.value,
            }
        }
    }
}

function createTemplatePieceFromChoices(
    templatePieces: FunctionTemplatePiece[],
    variantParts: VariantedPart[],
    choice: number[],
): FunctionTemplatePiece[] {
    const parts = [...templatePieces]

    for (const [index, optionIndex] of choice.entries()) {
        const { candidates } = variantParts[index]
        const content = candidates[optionIndex]

        parts[variantParts[index].index] = {
            type: 'static',
            value: [content],
        }
    }

    return parts
}

function createRuleFromFunctionTemplate(
    functionTemplate: FunctionTemplate,
): Rule {
    const pattern = createPatternFromTemplatePieces(functionTemplate.pieces)

    return {
        pattern,
        factory(matchedNodes) {
            const params = parseParameterFromTemplate(
                functionTemplate,
                matchedNodes,
            )

            return new FunctionInvoke({
                name: functionTemplate.name,
                params,
            })
        },
        config: {
            isExported: true,
        },
    }
}

function createPatternFromTemplatePieces(
    pieces: FunctionTemplatePiece[],
): PatternUnit[] {
    return pieces.map((piece) => {
        if (piece.value.length !== 1) {
            throw new Error('piece.value.length is not 1')
        }

        if (piece.type === 'static') {
            return {
                type: Identifier,
                value: piece.value[0],
            }
        }

        return {
            type: Evaluable,
        }
    })
}

function parseParameterFromTemplate(
    template: FunctionTemplate,
    matchedNodes: Node[],
): FunctionParams {
    const parameters = template.pieces
        .map((piece, index) => {
            if (piece.type === 'static') {
                return null
            }

            const matchedNode = matchedNodes[index]
            if (!(matchedNode instanceof Evaluable)) {
                throw new Error('matchedNode is not Evaluable')
            }

            return [piece.value[0], matchedNode]
        })
        .filter(Boolean) as [string, Identifier][]

    return Object.fromEntries(parameters)
}
