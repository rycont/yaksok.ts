import { Pattern, internalPatterns } from '../pattern.ts'
import { checkPattern } from './checkPattern.ts'
import { BlockPiece, EOLPiece, Piece } from '../piece/index.ts'

export function patternMatcher(_tokens: Piece[], _patterns: Pattern[]) {
    const tokens = [..._tokens]
    const patterns = [..._patterns, ...internalPatterns]

    let end = 0

    while (true) {
        for (const pattern of patterns) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (checkPattern(substack, pattern)) {
                const Wrapper = pattern.wrapper

                let content: Record<string, unknown> = {}
                let hasContent = false

                for (let i = 0; i < pattern.units.length; i++) {
                    const unit = pattern.units[i]
                    const token = substack[i]

                    if (unit.as) {
                        content[unit.as] = token
                        hasContent = true
                    }
                }

                if (pattern.config) {
                    content = {
                        ...content,
                        ...pattern.config,
                    }
                }

                const wrapper = new Wrapper(hasContent ? content : undefined)

                tokens.splice(
                    end - pattern.units.length,
                    pattern.units.length,
                    wrapper,
                )

                end -= pattern.units.length
            }
        }

        end++

        if (end > tokens.length) break
    }

    return tokens
}

export function recursivePatternMatcher(_tokens: Piece[], patterns: Pattern[]) {
    const tokens = [..._tokens]

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]

        if (token instanceof BlockPiece) {
            tokens[i] = recursivePatternMatcher(token.content, patterns)
        }
    }

    tokens.push(new EOLPiece())
    const matchedTokens = patternMatcher(tokens, patterns)
    return new BlockPiece(matchedTokens)
}
