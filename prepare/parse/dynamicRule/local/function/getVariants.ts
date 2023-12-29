import { StringValue } from '../../../../../node/index.ts'
import { getCombination } from '../getCombination.ts'
import { FunctionHeaderNode } from './functionRuleByType.ts'

interface VariantedPart {
    index: number
    candidates: string[]
    postfix: string
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
        if (!(token instanceof StringValue)) continue
        if (!token.value.includes('/')) continue

        const [v, postfix] = token.value.split(' ')
        const candidates = v.split('/')

        yield {
            index,
            candidates,
            postfix,
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
        const { candidates, postfix } = variants[index]
        const content = postfix
            ? candidates[optionIndex] + ' ' + postfix
            : candidates[optionIndex]

        tokens[variants[index].index] = new StringValue(content)
    }

    return tokens
}
