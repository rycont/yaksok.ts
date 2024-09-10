import {
    FunctionMustHaveOneOrMoreStringPartError,
    UnexpectedEndOfCodeError,
    UnexpectedTokenError,
} from '../../error/index.ts'
import { Expression, Operator } from '../../node/base.ts'
import {
    Node,
    Keyword,
    Variable,
    EOL,
    InlineParenthesisBlock,
    InlineBracketBlock,
} from '../../node/index.ts'
import { BRACKET_TYPE, isBracket, isParentheses } from '../../util/isBracket.ts'
import { satisfiesPattern } from '../parse/satisfiesPattern.ts'
import { parseIndent } from '../parse/parseIndent.ts'
import { Block } from '../../node/block.ts'
import { PatternUnit } from '../parse/rule.ts'
import { FunctionHeaderNode } from '../parse/dynamicRule/local/function/functionRuleByType.ts'

class Lexer {
    private tokens: Node[]
    private lexedTokens: Node[] = []

    static lex(
        tokens: Node[],
        variables: string[] = [],
        functionHeaders: FunctionHeaderNode[][] = [],
        ffiHeaders: FunctionHeaderNode[][] = [],
    ) {
        const lexer = new Lexer(tokens, variables, functionHeaders, ffiHeaders)

        lexer.run()
        const result = lexer.result

        return result
    }

    constructor(
        tokens: Node[],
        private variables: string[] = [],
        private functionHeaders: FunctionHeaderNode[][] = [],
        private ffiHeaders: FunctionHeaderNode[][] = [],
    ) {
        this.tokens = parseIndent(tokens)
    }

    get result() {
        return {
            tokens: this.lexedTokens,
            functionHeaders: this.functionHeaders,
            ffiHeaders: this.ffiHeaders,
        }
    }

    run() {
        while (true) {
            const token = this.tokens.shift()
            if (!token) return

            if (this.isBlock(token)) {
                this.parseBlock(token)
                continue
            }

            if (isParentheses(token) === BRACKET_TYPE.OPENING) {
                const node = this.parseInlineBlock('parenthesis')
                this.lexedTokens.push(node)

                continue
            }

            if (isBracket(token) === BRACKET_TYPE.OPENING) {
                const node = this.parseInlineBlock('bracket')
                this.lexedTokens.push(node)

                continue
            }

            if (isStartOfFunction([token, ...this.tokens])) {
                this.tokens.unshift(token)
                this.parseFunction()

                continue
            }

            if (isStartOfFFI([token, ...this.tokens])) {
                this.tokens.unshift(token)
                throw '아직'
            }

            this.lexedTokens.push(token)
        }
    }

    isBlock(token: Node) {
        return token instanceof Block
    }

    parseBlock(token: Block) {
        const nodes = token.children
        const lexedNodes = lex(nodes, this.variables).tokens

        this.lexedTokens.push(new Block(lexedNodes))
    }

    parseInlineBlock(type: 'parenthesis' | 'bracket') {
        const nodes: Node[] = []

        while (true) {
            const nextToken = this.tokens.shift()

            if (!nextToken) {
                throw this.unexpectedEOL()
            }

            if (isParentheses(nextToken) === BRACKET_TYPE.OPENING) {
                const bracketNode = this.parseInlineBlock('parenthesis')
                nodes.push(bracketNode)
            }

            if (isBracket(nextToken) === BRACKET_TYPE.OPENING) {
                const bracketNode = this.parseInlineBlock('bracket')
                nodes.push(bracketNode)
            }

            if (isParentheses(nextToken) === BRACKET_TYPE.CLOSING) {
                break
            }

            if (isBracket(nextToken) === BRACKET_TYPE.CLOSING) {
                break
            }

            nodes.push(nextToken)
        }

        const lexed = lex(nodes, this.variables).tokens

        const inlineBlockNode =
            type === 'bracket'
                ? new InlineBracketBlock(nodes)
                : new InlineParenthesisBlock(lexed)

        return inlineBlockNode
    }

    isVariableDeclaration(token: Node): token is Keyword {
        const isKeyword = token instanceof Keyword
        const nextToken = this.tokens[0]
        const isDeclaration =
            nextToken instanceof Expression && nextToken.value === ':'

        return isKeyword && isDeclaration
    }

    parseVariableDeclaration(token: Keyword) {
        const variableToken = new Variable(token.value)
        variableToken.position = token.position

        this.lexedTokens.push(variableToken)
        this.variables.push(token.value)
    }

    isVariableUsage(token: Node) {
        const isKeyword = token instanceof Keyword
        const isInArguments = isKeyword && this.variables.includes(token.value)

        return isInArguments
    }

    parseVariableUsage(token: Node) {
        const variableToken = new Variable((token as Keyword).value)
        variableToken.position = token.position

        this.lexedTokens.push(variableToken)
    }

    parseFunction() {
        const { argumentNames, functionHeader } = this.parseFunctionHeader()
        this.variables = argumentNames
        this.functionHeaders.push(functionHeader)
    }

    parseFunctionHeader() {
        this.pull()
        this.pull()

        const functionHeader: FunctionHeaderNode[] = []
        const argumentNames: string[] = []

        while (true) {
            const token = this.tokens.shift()

            if (!token) {
                throw this.unexpectedEOL()
            }

            if (token instanceof Keyword) {
                functionHeader.push(token)

                continue
            }

            if (token instanceof Operator && this.isFunctionVariants(token)) {
                const nextToken = this.tokens.shift() as Keyword | undefined

                if (!nextToken) {
                    throw this.unexpectedEOL()
                }

                const lastToken = functionHeader[functionHeader.length - 1]
                lastToken.value += token.value + '/' + nextToken.value

                continue
            }

            if (isBracket(token) === BRACKET_TYPE.OPENING) {
                const { argumentName, nodes } = this.parseFunctionArgument(
                    token as Expression,
                )

                functionHeader.push(...nodes)
                argumentNames.push(argumentName)

                continue
            }

            if (token instanceof EOL) {
                this.lexedTokens.push(...functionHeader)
                this.lexedTokens.push(token)
                break
            }
        }

        assertHaveStaticPartInFunctionHeader(functionHeader)

        return {
            argumentNames,
            functionHeader,
        }
    }

    parseFunctionArgument(openingBracket: Expression) {
        const argumentNameToken = this.tokens.shift()

        if (!argumentNameToken) {
            throw this.unexpectedEOL()
        }

        if (!(argumentNameToken instanceof Keyword)) {
            throw new UnexpectedTokenError({
                resource: {
                    node: argumentNameToken,
                    parts: '함수 인자 이름',
                },
            })
        }

        const closingBracketToken = this.tokens.shift()

        if (!closingBracketToken) {
            throw this.unexpectedEOL()
        }

        if (isBracket(closingBracketToken) !== BRACKET_TYPE.CLOSING) {
            throw new UnexpectedTokenError({
                resource: {
                    node: closingBracketToken,
                    parts: '함수 인자 이름을 끝내는 괄호',
                },
            })
        }

        const argumentName = argumentNameToken.value
        const nodes: FunctionHeaderNode[] = [
            openingBracket,
            argumentNameToken,
            closingBracketToken as Expression,
        ]

        return {
            argumentName,
            nodes,
        }
    }

    isFunctionVariants(token: Operator) {
        const isLastTokenKeyword =
            this.lexedTokens.slice(-1)[0] instanceof Keyword
        const isNextTokenKeyword = this.tokens[0] instanceof Keyword
        const isDivision = token.value === '/'

        return isLastTokenKeyword && isNextTokenKeyword && isDivision
    }

    pull() {
        this.lexedTokens.push(this.tokens.shift()!)
    }

    unexpectedEOL() {
        return new UnexpectedEndOfCodeError({
            resource: {
                parts: '???',
            },
            position:
                this.tokens?.[0]?.position ||
                this.lexedTokens.slice(-1)?.[0]?.position,
        })
    }

    postprocess() {}

    replaceFunctionDeclaration() {
        this.functionHeaders.map()
    }

    replaceFunctionInvocation() {}
}

function functionHeaderToPattern() {}

export const lex = Lexer.lex

// function classicLexer(tokens: Node[]) {
//     const leftTokens = [...tokens]
//     const tokenStack: Node[] = []

//     const functionHeaders: Node[][] = []
//     const ffiHeaders: Node[][] = []

//     while (leftTokens.length) {
//         const isFunctionDeclare = isStartOfFunction(leftTokens)
//         const isFFIDeclare = isStartOfFFI(leftTokens)

//         if (!isFunctionDeclare && !isFFIDeclare) {
//             tokenStack.push(leftTokens.shift()!)
//             continue
//         }

//         if (isFFIDeclare) {
//             tokenStack.push(leftTokens.shift()!)
//             tokenStack.push(leftTokens.shift()!)
//             tokenStack.push(leftTokens.shift()!)
//         }

//         tokenStack.push(leftTokens.shift()!)
//         const token = leftTokens.shift()!
//         tokenStack.push(token)

//         const paramaters: string[] = []
//         const functionHeader: Node[] = []

//         // Detect function header and convert arguments to variable

//         while (true) {
//             const token = leftTokens.shift()
//             if (!token) break

//             if (token instanceof Keyword) {
//                 tokenStack.push(token)
//                 functionHeader.push(token)

//                 continue
//             }

//             if (isBracket(token) === BRACKET_TYPE.OPENING) {
//                 const openingBracket = token

//                 const argumentKeywordToken = leftTokens.shift()

//                 if (!argumentKeywordToken) {
//                     throw new UnexpectedEndOfCodeError({
//                         resource: {
//                             parts: '새 약속 만들기',
//                         },
//                         position: token.position,
//                     })
//                 }

//                 const isKeyword = argumentKeywordToken instanceof Keyword

//                 if (!isKeyword) {
//                     throw new UnexpectedTokenError({
//                         resource: {
//                             node: argumentKeywordToken,
//                             parts: '함수 인자 이름',
//                         },
//                     })
//                 }

//                 const argumentName = argumentKeywordToken.value
//                 const argumentVariable = new Variable(argumentName)
//                 argumentVariable.position = argumentKeywordToken.position

//                 const closingBracketToken = leftTokens.shift()

//                 if (!closingBracketToken) {
//                     throw new UnexpectedEndOfCodeError({
//                         resource: {
//                             parts: '새 약속 만들기',
//                         },
//                         position: argumentVariable.position,
//                     })
//                 }

//                 const isClosingBracket =
//                     isBracket(closingBracketToken) === BRACKET_TYPE.CLOSING
//                 if (!isClosingBracket) {
//                     throw new UnexpectedTokenError({
//                         resource: {
//                             node: closingBracketToken,
//                             parts: '함수 인자 이름을 끝내는 괄호',
//                         },
//                     })
//                 }

//                 tokenStack.push(openingBracket)
//                 functionHeader.push(openingBracket)

//                 tokenStack.push(argumentVariable)
//                 functionHeader.push(argumentVariable)

//                 tokenStack.push(closingBracketToken)
//                 functionHeader.push(closingBracketToken)

//                 paramaters.push(argumentName)

//                 continue
//             }

//             if (token instanceof Operator) {
//                 const lastToken = functionHeader[functionHeader.length - 1]

//                 if (lastToken instanceof Keyword) {
//                     lastToken.value += token.value
//                 }

//                 const nextToken = leftTokens.shift()

//                 if (!nextToken) {
//                     throw new UnexpectedEndOfCodeError({
//                         resource: {
//                             parts: '새 약속 만들기',
//                         },
//                         position: token.position,
//                     })
//                 }

//                 if (nextToken instanceof Keyword) {
//                     lastToken.value += nextToken.value
//                     continue
//                 }
//             }

//             if (token instanceof EOL) {
//                 tokenStack.push(token)
//                 break
//             }

//             throw new UnexpectedTokenError({
//                 resource: {
//                     node: token,
//                     parts: '함수 인자',
//                 },
//                 position: token.position,
//             })
//         }

//         assertHaveStaticPartInFunctionHeader(functionHeader)

//         if (isFFIDeclare) {
//             ffiHeaders.push(functionHeader)
//         } else {
//             functionHeaders.push(functionHeader)
//         }

//         if (isFunctionDeclare)
//             // Convert function body to variable
//             while (true) {
//                 const token = leftTokens.shift()
//                 if (!token) break

//                 // 줄바꿈이 됐는데 들여쓰기가 없으면 함수가 끝난 것
//                 if (
//                     token instanceof EOL &&
//                     !(leftTokens[0] instanceof Indent)
//                 ) {
//                     tokenStack.push(token)
//                     break
//                 }

//                 // 키워드이고 인자에 포함되어 있으면 변수로 바꿔줌
//                 if (
//                     token instanceof Keyword &&
//                     paramaters.includes(token.value)
//                 ) {
//                     tokenStack.push(new Variable(token.value))
//                     continue
//                 }
//                 tokenStack.push(token)
//             }
//     }

//     return {
//         tokens: tokenStack,
//         functionHeaders,
//         ffiHeaders,
//     }
// }

function isStartOfFunction(tokens: Node[]) {
    const isFunctionDeclare = satisfiesPattern(tokens, [
        {
            type: Keyword,
            value: '약속',
        },
        {
            type: Expression,
            value: ',',
        },
    ])

    return isFunctionDeclare
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
        {
            type: Expression,
            value: ',',
        },
    ])
}

function assertHaveStaticPartInFunctionHeader(tokens: Node[]) {
    for (const token of tokens) {
        if (token instanceof Keyword) {
            return
        }
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
