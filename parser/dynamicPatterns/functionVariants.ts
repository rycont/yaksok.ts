import { YaksokError } from '../../errors.ts'
import { Pattern } from '../pattern.ts'
import {
    BlockPiece,
    EOLPiece,
    EvaluatablePiece,
    FunctionDeclarationPiece,
    FunctionInvokePiece,
    KeywordPiece,
    Piece,
    StringPiece,
    VariablePiece,
} from '../../piece/index.ts'

interface Variant {
    index: number
    options: string[]
    postfix: string
}

function getCombination<T>(arr: T[][]) {
    const result: T[][] = []

    function dfs(index: number, current: T[]) {
        if (index === arr.length) {
            result.push(current)
            return
        }

        for (const item of arr[index]) {
            dfs(index + 1, [...current, item])
        }
    }

    dfs(0, [])

    return result
}

export function* getVariants(subtokens: (VariablePiece | StringPiece)[]) {
    const variants: Variant[] = subtokens
        .map(
            (token, index) =>
                [
                    token instanceof StringPiece && token.value.includes('/'),
                    index,
                ] as const,
        )
        .filter((v) => v[0])
        .map((v) => v[1])
        .map((index) => {
            const token = subtokens[index] as StringPiece

            const [v, postfix] = token.value.split(' ')
            const options = v.split('/')

            return {
                index,
                options,
                postfix,
            }
        })

    for (const choice of getCombination(
        variants.map((v) => v.options.map((_, i) => i)),
    )) {
        const newTokens = [...subtokens]

        for (const [index, optionIndex] of choice.entries()) {
            const { options, postfix } = variants[index]
            newTokens[variants[index].index] = new StringPiece(
                postfix
                    ? options[optionIndex] + ' ' + postfix
                    : options[optionIndex],
            )
        }

        yield newTokens
    }
}

function createFunctionDeclarePattern(
    name: string,
    subtokens: (VariablePiece | StringPiece)[],
): Pattern {
    const declarationTemplate: Pattern['units'] = subtokens.map((t) => {
        if (t instanceof VariablePiece) {
            return {
                type: VariablePiece,
                as: t.name,
            }
        }

        return {
            type: StringPiece,
            value: t.value,
        }
    })

    return {
        wrapper: FunctionDeclarationPiece,
        units: [
            {
                type: KeywordPiece,
                value: '약속',
            },
            ...declarationTemplate,
            {
                type: EOLPiece,
            },
            {
                type: BlockPiece,
                as: 'body',
            },
        ],
        config: {
            name,
        },
    }
}

function createFunctionInvokePattern(
    name: string,
    subtokens: (VariablePiece | StringPiece)[],
): Pattern {
    for (let i = 0; i < subtokens.length; i++) {
        // If string piece has space, it will be splitted.
        const piece = subtokens[i]
        if (piece instanceof StringPiece) {
            const splitted = piece.value.split(' ')
            subtokens.splice(i, 1, ...splitted.map((s) => new StringPiece(s)))
        }
    }

    const invokeTemplate = subtokens.map((t) => {
        if (t instanceof VariablePiece)
            return {
                type: EvaluatablePiece,
                as: t.name,
            }

        return {
            type: KeywordPiece,
            value: t.value,
        }
    })

    return {
        wrapper: FunctionInvokePiece,
        units: invokeTemplate,
        config: {
            name,
        },
    }
}

function subtokensAreValid(
    subtokens: Piece[],
): subtokens is (VariablePiece | StringPiece)[] {
    return subtokens.every((t) => {
        if (t instanceof VariablePiece) return true
        if (t instanceof StringPiece) return true
        return false
    })
}

export function createFunctionPattern(subtokens: Piece[]) {
    if (!subtokensAreValid(subtokens))
        throw new YaksokError(
            'UNEXPECTED_TOKEN',
            {},
            { token: JSON.stringify(subtokens) },
        )

    const name = subtokens
        .map((t) => {
            if (t instanceof VariablePiece) return t.name
            if (t instanceof StringPiece) return t.value
        })
        .join(' ')

    const variants = [...getVariants(subtokens)]

    return [
        createFunctionDeclarePattern(name, subtokens),
        ...variants.map((v) => createFunctionInvokePattern(name, v)),
    ]
}
