import { type Rule, internalPatternsByLevel } from './rule.ts'
import { satisfiesPattern } from './satisfiesPattern.ts'
import {
    Block,
    EOL,
    Evaluable,
    List,
    type Node,
    Sequence,
    ValueWithBracket,
    ValueWithParenthesis,
} from '../../node/index.ts'
import { CannotParseError } from '../../error/index.ts'
import { InlineParenthesisBlock } from '../../node/block.ts'
import { InlineBracketBlock } from '../../node/block.ts'

export function SRParse(_tokens: Node[], rules: Rule[]) {
    const tokens = [..._tokens]
    const stack: Node[] = []

    let changed = false

    tokenloop: while (true) {
        for (const rule of rules) {
            if (stack.length < rule.pattern.length) continue
            const stackSlice = stack.slice(-rule.pattern.length)

            const satisfies = satisfiesPattern(stackSlice, rule.pattern)

            if (!satisfies) continue
            const reduced = reduce(stackSlice, rule)

            stack.splice(-rule.pattern.length, rule.pattern.length, reduced)

            changed = true
            continue tokenloop
        }

        if (tokens.length === 0) break
        stack.push(tokens.shift()!)
    }

    return {
        changed,
        tokens: stack,
    }
}

export function reduce(tokens: Node[], rule: Rule) {
    const reduced = rule.factory(tokens)
    reduced.position = tokens[0].position

    return reduced
}

type BlockType =
    | typeof Block
    | typeof ValueWithParenthesis
    | typeof ValueWithBracket

export function callParseRecursively(
    _tokens: Node[],
    externalPatterns: Rule[][],
    blockTypeFactory: BlockType = Block,
) {
    let parsedTokens = [..._tokens]

    for (let i = 0; i < parsedTokens.length; i++) {
        const token = parsedTokens[i]

        if (!(token instanceof Block)) continue

        const blockWrapper = {
            [Block.name]: Block,
            [InlineParenthesisBlock.name]: ValueWithParenthesis,
            [InlineBracketBlock.name]: ValueWithBracket,
        }[token.constructor.name]

        parsedTokens[i] = callParseRecursively(
            token.children,
            externalPatterns,
            blockWrapper,
        )
    }

    parsedTokens.push(new EOL())

    const patternsByLevel = [...externalPatterns, ...internalPatternsByLevel]

    loop1: while (true) {
        for (const patterns of patternsByLevel) {
            const result = SRParse(parsedTokens, patterns)
            parsedTokens = result.tokens

            if (result.changed) continue loop1
        }

        break
    }

    if (blockTypeFactory === Block) {
        return new Block(parsedTokens)
    }

    const validTokens = parsedTokens.filter((token) => !(token instanceof EOL))

    if (validTokens.length !== 1 || !(validTokens[0] instanceof Evaluable)) {
        throw new CannotParseError({
            position: validTokens[0].position,
            resource: {
                part: validTokens[0],
            },
        })
    }

    const lastToken = validTokens[0]

    if (blockTypeFactory === ValueWithParenthesis) {
        return new ValueWithParenthesis(lastToken)
    }

    if (lastToken instanceof Sequence) {
        const list = new List(lastToken.items)
        return list
    }

    return new ValueWithBracket(lastToken)
}
