import { Identifier } from '../../../../node/index.ts'
import { FunctionHeaderNode } from './functionRuleByType.ts'
import { getCombination } from './getCombination.ts'

interface VariantedPart {
    index: number
    candidates: string[]
}

export function* getVariants(subtokens: FunctionHeaderNode[]) {
    const variants: VariantedPart[] = [...getVariantParts(subtokens)]

    for (const choice of getCombination(
        variants.map((v) => v.candidates.map((_, i) => i)),
    )) {
        yield createVariantFromChoices(subtokens, variants, choice)
    }
}

function* getVariantParts(subtokens: FunctionHeaderNode[]) {
    for (const [index, token] of subtokens.entries()) {
        if (!(token instanceof Identifier)) continue
        if (!token.value.includes('/')) continue

        const candidates = token.value.split('/')

        yield {
            index,
            candidates,
        }
    }
}

function createVariantFromChoices(
    _tokens: FunctionHeaderNode[],
    variants: VariantedPart[],
    choice: number[],
) {
    const tokens = [..._tokens]

    for (const [index, optionIndex] of choice.entries()) {
        const { candidates } = variants[index]
        const content = candidates[optionIndex]

        tokens[variants[index].index] = new Identifier(content)
    }

    return tokens
}
