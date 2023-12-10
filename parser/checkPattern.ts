import { Pattern } from '../pattern.ts'
import { Piece } from '../piece/index.ts'

export function checkPattern(
    tokens: Piece[],
    pattern: Omit<Pattern, 'wrapper'>,
) {
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const unit = pattern.units[i]

        if (!(token instanceof unit.type)) return false

        if (unit.value) {
            if (typeof unit.value === 'object') {
                for (const key in unit.value) {
                    if (!(key in token)) return false
                    if (unit.value[key] !== token[key]) return false
                }
            }

            if (!('value' in token) || unit.value !== token.value) return false
        }
    }

    return true
}
