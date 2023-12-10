import { Pattern, internalPatterns } from '../pattern.ts'
import { Piece } from '../piece/index.ts'
import { checkPattern } from './checkPattern.ts'

export function patternMatcher(tokens: Piece[], _patterns: Pattern[]) {
    const patterns = [..._patterns, ...internalPatterns]

    let end = 0

    while (true) {
        for (const pattern of patterns) {
            if (end < pattern.units.length) continue
            const substack = tokens.slice(end - pattern.units.length, end)

            if (checkPattern(substack, pattern)) {
                const Wrapper = pattern.wrapper

                if (
                    substack.length === 1 &&
                    substack[0].constructor === Wrapper
                ) {
                    continue
                }

                let content: Record<string, unknown> = {}

                for (let i = 0; i < pattern.units.length; i++) {
                    const unit = pattern.units[i]
                    const token = substack[i]

                    if (unit.as) content[unit.as] = token
                }

                if (pattern.config) {
                    content = {
                        ...content,
                        ...pattern.config,
                    }
                }

                const wrapper = new Wrapper(content)

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
}
