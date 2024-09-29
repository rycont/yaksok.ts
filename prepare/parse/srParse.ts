import { Rule, internalPatternsByLevel } from './rule.ts'
import { satisfiesPattern } from './satisfiesPattern.ts'
import {
    Block,
    EOL,
    Evaluable,
    Node,
    ValueWithBracket,
    ValueWithParenthesis,
} from '../../node/index.ts'

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

export function callParseRecursively(
    _tokens: Node[],
    externalPatterns: Rule[][],
    wrapper: 'Block' | 'ValueWithParenthesis' | 'ValueWithBracket' = 'Block',
) {
    let parsedTokens = [..._tokens]

    for (let i = 0; i < parsedTokens.length; i++) {
        const token = parsedTokens[i]

        if (!(token instanceof Block)) continue

        const blockWrapper = {
            Block: 'Block',
            InlineParenthesisBlock: 'ValueWithParenthesis',
            InlineBracketBlock: 'ValueWithBracket',
        }[token.constructor.name] as
            | 'Block'
            | 'ValueWithParenthesis'
            | 'ValueWithBracket'

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

    if (wrapper === 'Block') {
        return new Block(parsedTokens)
    }

    console.log(_tokens)
    const validTokens = parsedTokens.filter((token) => !(token instanceof EOL))

    const lastToken = validTokens[validTokens.length - 1]

    if (!(lastToken instanceof Evaluable)) {
        throw new Error('lastToken is not Evaluable')
    }

    if (wrapper === 'ValueWithParenthesis') {
        return new ValueWithParenthesis(lastToken)
    }

    return new ValueWithBracket(lastToken)
}
