import {
    BooleanLiteral,
    NumberLiteral,
    StringLiteral,
} from '../../node/primitive-literal.ts'
import { ValueType } from '../../value/index.ts'

export function isTruthy(value: ValueType) {
    if (value instanceof BooleanLiteral) {
        return value.value
    }

    if (value instanceof NumberLiteral) {
        return value.value !== 0
    }

    if (value instanceof StringLiteral) {
        return value.value !== ''
    }

    return !!value
}
