import { Pattern } from './pattern.ts'
import { Node } from '../nodes/index.ts'

export function checkPattern(
    tokens: Node[],
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
