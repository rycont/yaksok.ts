import { PatternUnit } from './rule.ts'
import { Node } from '../nodes/index.ts'

export function satisfiesPattern(tokens: Node[], pattern: PatternUnit[]) {
    return pattern.every((pattern, index) => {
        const token = tokens[index]
        if (!(token instanceof pattern.type)) return false

        if ('value' in pattern && token.value !== pattern.value)
            return false

        return true
    })
}
