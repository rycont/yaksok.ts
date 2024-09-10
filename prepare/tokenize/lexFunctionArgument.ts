import {
    FunctionCannotHaveArgumentsInARowError,
    FunctionMustHaveOneOrMoreStringPartError,
    UnexpectedEndOfCodeError,
    UnexpectedTokenError,
} from '../../error/index.ts'
import { Expression, Operator } from '../../node/base.ts'
import { Node, Keyword, Variable, EOL, Indent } from '../../node/index.ts'
import { BRACKET_TYPE, isBracket } from '../../util/isBracket.ts'
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
                tokenStack.push(token)
                functionHeader.push(token)

                continue
            }

            if (isBracket(token) === BRACKET_TYPE.OPENING) {
                const openingBracket = token

                const argumentKeywordToken = leftTokens.shift()

                if (!argumentKeywordToken) {
                    throw new UnexpectedEndOfCodeError({
                        resource: {
                            parts: '새 약속 만들기',
                        },
                        position: token.position,
                    })
                }

                const isKeyword = argumentKeywordToken instanceof Keyword

                if (!isKeyword) {
                    throw new UnexpectedTokenError({
                        resource: {
                            node: argumentKeywordToken,
                            parts: '함수 인자 이름',
                        },
                    })
                }

                const argumentName = argumentKeywordToken.value
                const argumentVariable = new Variable(argumentName)
                argumentVariable.position = argumentKeywordToken.position

                const closingBracketToken = leftTokens.shift()

                if (!closingBracketToken) {
                    throw new UnexpectedEndOfCodeError({
                        resource: {
                            parts: '새 약속 만들기',
                        },
                        position: argumentVariable.position,
                    })
                }

                const isClosingBracket =
                    isBracket(closingBracketToken) === BRACKET_TYPE.CLOSING
                if (!isClosingBracket) {
                    throw new UnexpectedTokenError({
                        resource: {
                            node: closingBracketToken,
                            parts: '함수 인자 이름을 끝내는 괄호',
                        },
                    })
                }

                tokenStack.push(openingBracket)
                functionHeader.push(openingBracket)

                tokenStack.push(argumentVariable)
                functionHeader.push(argumentVariable)

                tokenStack.push(closingBracketToken)
                functionHeader.push(closingBracketToken)

                paramaters.push(argumentName)

                continue
            }

            if (token instanceof Operator) {
                const lastToken = functionHeader[functionHeader.length - 1]

                if (lastToken instanceof Keyword) {
                    lastToken.value += token.value
                }

                const nextToken = leftTokens.shift()

                if (!nextToken) {
                    throw new UnexpectedEndOfCodeError({
                        resource: {
                            parts: '새 약속 만들기',
                        },
                        position: token.position,
                    })
                }

                if (nextToken instanceof Keyword) {
                    lastToken.value += nextToken.value
                    continue
                }
            }

            if (token instanceof EOL) {
                tokenStack.push(token)
                break
            }

            throw new UnexpectedTokenError({
                resource: {
                    node: token,
                    parts: '함수 인자',
                },
                position: token.position,
            })
        }

        assertHaveStaticPartInFunctionHeader(functionHeader)

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

    let hasStaticPart = false

    for (const token of tokens) {
        const currentTokenType = token.constructor

        if (currentTokenType === Expression && lastTokenType === Expression) {
            throw new FunctionCannotHaveArgumentsInARowError({
                position: token.position,
            })
        }

        lastTokenType = currentTokenType

        if (token instanceof Keyword) {
            hasStaticPart = true
        }
    }

    if (hasStaticPart) {
        return
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
