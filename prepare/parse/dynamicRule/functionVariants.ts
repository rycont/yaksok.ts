import { UnexpectedTokenError } from '../../../errors/index.ts'
import { PatternUnit, Rule } from '../rule.ts'
import {
    Block,
    EOL,
    Evaluable,
    DeclareFunction,
    FunctionInvoke,
    Keyword,
    Node,
    StringValue,
    Variable,
} from '../../../node/index.ts'

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

function createFunctionDeclareRule(
    name: string,
    subtokens: (Variable | StringValue)[],
): Rule {
    const declarationTemplate: PatternUnit[] = subtokens.map((t) => {
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
        to: DeclareFunction,
        pattern: [
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

function createFunctionInvokeRule(
    name: string,
    _subtokens: (Variable | StringValue)[],
): Rule {
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
        to: FunctionInvoke,
        pattern: invokeTemplate,
        config: {
            name,
        },
    }
}

function assertValidFunctionHeader(
    subtokens: Node[],
): asserts subtokens is (Variable | StringValue)[] {
    for (const token of subtokens) {
        if (token instanceof Variable) continue
        if (token instanceof StringValue) continue

        throw new UnexpectedTokenError({
            position: subtokens[0].position,
            resource: {
                node: token,
                parts: '',
            },
        })
    }
}

export function createFunctionRules(subtokens: Node[]) {
    assertValidFunctionHeader(subtokens)

    const name = subtokens
        .map((t) => {
            if (t instanceof Variable) return t.name
            if (t instanceof StringValue) return t.value
        })
        .join(' ')

    const variants = [...getVariants(subtokens)]

    return [
        createFunctionDeclareRule(name, subtokens),
        ...variants.map((v) => createFunctionInvokeRule(name, v)),
    ]
}
