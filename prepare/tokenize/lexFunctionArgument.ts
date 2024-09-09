import {
    FunctionCannotHaveArgumentsInARowError,
    FunctionMustHaveOneOrMoreStringPartError,
} from '../../error/index.ts'
import { Expression } from '../../node/base.ts'
import {
    Node,
    Keyword,
    Variable,
    EOL,
    Indent,
    StringValue,
} from '../../node/index.ts'
import { satisfiesPattern } from '../parse/satisfiesPattern.ts'

export function lexFunctionArgument(tokens: Node[]) {
    const leftTokens = [...tokens]
    const tokenStack: Node[] = []

    const functionHeaders: Node[][] = []
    const ffiHeaders: Node[][] = []

    while (leftTokens.length) {
        const isFunctionDeclare = isStartOfFunction(leftTokens)
        const isFFIDeclare = isStartOfFFI(leftTokens)

        if (!isFunctionDeclare && !isFFIDeclare) {
            tokenStack.push(leftTokens.shift()!)
            continue
        }

        if (isFFIDeclare) {
            tokenStack.push(leftTokens.shift()!)
            tokenStack.push(leftTokens.shift()!)
        }

        tokenStack.push(leftTokens.shift()!)
        const token = leftTokens.shift()!
        tokenStack.push(token)

        const paramaters: string[] = []
        const functionHeader: Node[] = []

        // Detect function header and convert arguments to variable

        while (true) {
            const token = leftTokens.shift()
            if (!token) break

            if (token instanceof Keyword) {
                paramaters.push(token.value)
                const variable = new Variable(token.value)
                variable.position = token.position

                tokenStack.push(variable)
                functionHeader.push(variable)

                continue
            }

            if (token instanceof EOL) {
                tokenStack.push(token)
                break
            }

            functionHeader.push(token)
            tokenStack.push(token)
        }

        assertHaveStaticPartInFunctionHeader(functionHeader)
        console.log(functionHeader)

        if (isFFIDeclare) {
            ffiHeaders.push(functionHeader)
        } else {
            functionHeaders.push(functionHeader)
        }

        if (isFunctionDeclare)
            // Convert function body to variable
            while (true) {
                const token = leftTokens.shift()
                if (!token) break

                // 줄바꿈이 됐는데 들여쓰기가 없으면 함수가 끝난 것
                if (
                    token instanceof EOL &&
                    !(leftTokens[0] instanceof Indent)
                ) {
                    tokenStack.push(token)
                    break
                }

                // 키워드이고 인자에 포함되어 있으면 변수로 바꿔줌
                if (
                    token instanceof Keyword &&
                    paramaters.includes(token.value)
                ) {
                    tokenStack.push(new Variable(token.value))
                    continue
                }
                tokenStack.push(token)
            }
    }

    return {
        tokens: tokenStack,
        functionHeaders,
        ffiHeaders,
    }
}

function isStartOfFunction(tokens: Node[]) {
    const isFunctionDeclare = satisfiesPattern(tokens, [
        {
            type: Keyword,
            value: '약속',
        },
    ])

    const isNotFunctionBreak = satisfiesPattern(tokens.slice(1, 2), [
        {
            type: Keyword,
            value: '그만',
        },
    ])

    return isFunctionDeclare && !isNotFunctionBreak
}

function isStartOfFFI(tokens: Node[]) {
    return satisfiesPattern(tokens, [
        {
            type: Keyword,
            value: '번역',
        },
        {
            type: Expression,
            value: '(',
        },
        {
            type: Keyword,
        },
        {
            type: Expression,
            value: ')',
        },
    ])
}

function assertHaveStaticPartInFunctionHeader(tokens: Node[]) {
    let lastTokenType = null

    for (const token of tokens) {
        const currentTokenType = token.constructor

        if (currentTokenType === Variable && lastTokenType === Variable) {
            throw new FunctionCannotHaveArgumentsInARowError({
                position: token.position,
            })
        }

        lastTokenType = currentTokenType

        if (token instanceof StringValue) return
    }

    throw new FunctionMustHaveOneOrMoreStringPartError({
        position: tokens[0].position,
        resource: {
            declarationString: (tokens as Variable[])
                .map((token) => token.name)
                .join(' '),
        },
    })
}
