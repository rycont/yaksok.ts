import {
    FunctionMustHaveOneOrMoreStringPartError,
    UnexpectedEndOfCodeError,
    UnexpectedTokenError,
} from '../../error/index.ts'
import { Expression, Operator } from '../../node/base.ts'
import {
    Node,
    Identifier,
    EOL,
    InlineParenthesisBlock,
    InlineBracketBlock,
} from '../../node/index.ts'
import { BRACKET_TYPE, isBracket, isParentheses } from '../../util/isBracket.ts'
import { satisfiesPattern } from '../parse/satisfiesPattern.ts'
import { parseIndent } from '../parse/parseIndent.ts'
import { Block } from '../../node/block.ts'
import { FunctionHeaderNode } from '../parse/dynamicRule/local/functionRuleByType.ts'

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

            if (
                isParentheses(token) === BRACKET_TYPE.OPENING &&
                isParentheses(this.tokens[0]) !== BRACKET_TYPE.CLOSING
            ) {
                const node = this.parseInlineBlock('parenthesis')
                this.lexedTokens.push(node)

                continue
            }

            if (
                isBracket(token) === BRACKET_TYPE.OPENING &&
                isBracket(this.tokens[0]) !== BRACKET_TYPE.CLOSING
            ) {
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
                this.parseFFI()

                continue
            }

            this.lexedTokens.push(token)
        }
    }

    isBlock(token: Node): token is Block {
        return token.constructor.name === 'Block'
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
                throw this.unexpectedEOF('괄호로 묶인 코드')
            }

            if (isParentheses(nextToken) === BRACKET_TYPE.OPENING) {
                const bracketNode = this.parseInlineBlock('parenthesis')
                nodes.push(bracketNode)

                continue
            }

            if (isBracket(nextToken) === BRACKET_TYPE.OPENING) {
                const bracketNode = this.parseInlineBlock('bracket')
                nodes.push(bracketNode)

                continue
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

    parseFunction() {
        this.pull()
        this.pull()
        const { argumentNames, functionHeader } = this.parseFunctionHeader()
        this.functionHeaders.push(functionHeader)

        this.parseFunctionBody(argumentNames)
    }

    parseFunctionHeader() {
        const functionHeader: FunctionHeaderNode[] = []
        const argumentNames: string[] = []

        while (true) {
            const token = this.tokens.shift()!

            if (token instanceof Identifier) {
                functionHeader.push(token)
                this.lexedTokens.push(token)

                continue
            }

            const isFunctionVariants =
                token instanceof Operator && this.isFunctionVariants(token)

            if (isFunctionVariants) {
                const nextToken = this.tokens.shift()! as Identifier

                const lastToken = functionHeader[functionHeader.length - 1]
                lastToken.value += token.value + nextToken.value

                continue
            }

            if (isParentheses(token) === BRACKET_TYPE.OPENING) {
                const { argumentName, nodes } = this.parseFunctionArgument(
                    token as Expression,
                )

                functionHeader.push(...nodes)
                this.lexedTokens.push(...nodes)
                argumentNames.push(argumentName)

                continue
            }

            if (token instanceof EOL) {
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
        const argumentNameToken = this.tokens.shift()!

        if (!(argumentNameToken instanceof Identifier)) {
            throw new UnexpectedTokenError({
                resource: {
                    node: argumentNameToken,
                    parts: '함수 인자 이름',
                },
            })
        }

        const closingBracketToken = this.tokens.shift()!

        if (isParentheses(closingBracketToken) !== BRACKET_TYPE.CLOSING) {
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
            this.lexedTokens.slice(-1)[0] instanceof Identifier
        const isNextTokenKeyword = this.tokens[0] instanceof Identifier
        const isDivision = token.value === '/'

        return isLastTokenKeyword && isNextTokenKeyword && isDivision
    }

    parseFunctionBody(argumentNames: string[]) {
        const functionBodyBlock = this.tokens.shift()

        if (!functionBodyBlock) {
            throw this.unexpectedEOF('새 약속의 코드')
        }

        if (!(functionBodyBlock instanceof Block)) {
            throw new UnexpectedTokenError({
                resource: {
                    node: functionBodyBlock,
                    parts: '새 약속의 코드',
                },
            })
        }

        const functionBodyTokens = lex(
            functionBodyBlock.children,
            argumentNames,
        ).tokens

        const lexedFunctionBody = new Block(functionBodyTokens)
        lexedFunctionBody.position = functionBodyBlock.position

        this.lexedTokens.push(lexedFunctionBody)
    }

    parseFFI() {
        this.pull()
        this.pull()
        this.pull()
        this.pull()
        this.pull()

        const { functionHeader } = this.parseFunctionHeader()

        this.ffiHeaders.push(functionHeader)
        this.pull()
    }

    pull() {
        const currentToken = this.tokens.shift()!
        this.lexedTokens.push(currentToken)

        return currentToken
    }

    unexpectedEOF(parts: string) {
        return new UnexpectedEndOfCodeError({
            resource: {
                parts,
            },
            position:
                this.tokens[0]?.position ||
                this.lexedTokens.slice(-1)?.[0]?.position,
        })
    }
}

export const lex = Lexer.lex

function isStartOfFunction(tokens: Node[]) {
    const isFunctionDeclare = satisfiesPattern(tokens, [
        {
            type: Identifier,
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
            type: Identifier,
            value: '번역',
        },
        {
            type: Expression,
            value: '(',
        },
        {
            type: Identifier,
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
    for (const tokenIndex in tokens) {
        const previousToken = tokens[Number(tokenIndex) - 1]
        const isPreviousTokenOpeningParenthesis =
            previousToken instanceof Expression &&
            isParentheses(previousToken) === BRACKET_TYPE.OPENING

        const isCurrentTokenIdentifier =
            tokens[tokenIndex] instanceof Identifier

        if (!isPreviousTokenOpeningParenthesis && isCurrentTokenIdentifier) {
            return
        }
    }

    throw new FunctionMustHaveOneOrMoreStringPartError({
        position: tokens[0].position,
    })
}
