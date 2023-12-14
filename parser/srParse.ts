import { Rule, internalPatterns } from './rule.ts'
import { Block, EOL, Node } from '../nodes/index.ts'
import { satisfiesPattern } from "./satisfiesPattern.ts";

export function srParse(tokens: Node[], patterns: Rule[]) {
    const stack: Node[] = []
    const rules = [...internalPatterns, ...patterns]

    tokenloop: while (true) {
        for (const rule of rules) {
            if (stack.length < rule.pattern.length) continue

            const stackSlice = stack.slice(-rule.pattern.length)
            const isSatisfies = satisfiesPattern(stackSlice, rule.pattern)

            if (isSatisfies) {
                const args: Record<string, unknown> = rule.config || {}
                let hasArgs = rule.config ? true : undefined

                for (let i = 0; i < rule.pattern.length; i++) {
                    const pattern = rule.pattern[i]
                    if (pattern.as) {
                        args[pattern.as] = stackSlice[i]
                        hasArgs = true
                    }
                }

                stack.splice(-rule.pattern.length, rule.pattern.length)
                stack.push(new rule.to(hasArgs && args))

                continue tokenloop
            }
        }

        if (tokens.length === 0) break
        stack.push(tokens.shift()!)
    }

    return stack
}

export function recursiveSRParse(_tokens: Node[], patterns: Rule[]) {
    const tokens = [..._tokens]

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        if (token instanceof Block) {
            tokens[i] = recursiveSRParse(token.children, patterns)
        }
    }

    tokens.push(new EOL())
    const matchedTokens = srParse(tokens, patterns)
    return new Block(matchedTokens)
}
