import { ValueType } from '../../value/base.ts'
import {
    BooleanValue,
    NumberValue,
    StringValue,
} from '../../value/primitive.ts'

export function isTruthy(value: ValueType) {
    if (value instanceof BooleanValue) {
        return value.value
    }

    if (value instanceof NumberValue) {
        return value.value !== 0
    }

    if (value instanceof StringValue) {
        return value.value !== ''
    }

    return !!value
}
