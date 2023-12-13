import { YaksokError } from '../../errors.ts'
import { Pattern } from '../pattern.ts'
import {
    Block,
    EOL,
    Evaluable,
    FunctionDeclaration,
    FunctionInvoke,
    Keyword,
    Node,
    StringValue,
    Variable,
} from '../../nodes/index.ts'

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

export function* getVariants(subtokens: (Variable | StringValue)[]) {
    const variants: Variant[] = subtokens
        .map(
            (token, index) =>
                [
                    token instanceof StringValue && token.value.includes('/'),
                    index,
                ] as const,
        )
        .filter((v) => v[0])
        .map((v) => v[1])
        .map((index) => {
            const token = subtokens[index] as StringValue

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
            newTokens[variants[index].index] = new StringValue(
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
    subtokens: (Variable | StringValue)[],
): Pattern {
    const declarationTemplate: Pattern['units'] = subtokens.map((t) => {
        if (t instanceof Variable) {
            return {
                type: Variable,
                as: t.name,
            }
        }

        return {
            type: StringValue,
            value: t.value,
        }
    })

    return {
        wrapper: FunctionDeclaration,
        units: [
            {
                type: Keyword,
                value: '약속',
            },
            ...declarationTemplate,
            {
                type: EOL,
            },
            {
                type: Block,
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
    _subtokens: (Variable | StringValue)[],
): Pattern {
    const subtokens = [..._subtokens]

    for (let i = 0; i < subtokens.length; i++) {
        // If string has space, it will be splitted.
        const node = subtokens[i]
        if (node instanceof StringValue) {
            const splitted = node.value.split(' ')
            subtokens.splice(i, 1, ...splitted.map((s) => new StringValue(s)))
        }
    }

    const invokeTemplate = subtokens.map((t) => {
        if (t instanceof Variable)
            return {
                type: Evaluable,
                as: t.name,
            }

        return {
            type: Keyword,
            value: t.value,
        }
    })

    return {
        wrapper: FunctionInvoke,
        units: invokeTemplate,
        config: {
            name,
        },
    }
}

function subtokensAreValid(
    subtokens: Node[],
): subtokens is (Variable | StringValue)[] {
    return subtokens.every((t) => {
        if (t instanceof Variable) return true
        if (t instanceof StringValue) return true
        return false
    })
}

export function createFunctionPattern(subtokens: Node[]) {
    if (!subtokensAreValid(subtokens))
        throw new YaksokError(
            'UNEXPECTED_TOKEN',
            {},
            { token: JSON.stringify(subtokens) },
        )

    const name = subtokens
        .map((t) => {
            if (t instanceof Variable) return t.name
            if (t instanceof StringValue) return t.value
        })
        .join(' ')

    const variants = [...getVariants(subtokens)]

    return [
        createFunctionDeclarePattern(name, subtokens),
        ...variants.map((v) => createFunctionInvokePattern(name, v)),
    ]
}
