import { Pattern } from './pattern.ts'
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
            if (!('value' in token) || unit.value !== token.value) return false
        }
    }

    return true
}
