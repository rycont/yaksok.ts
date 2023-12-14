import { ValueTypes } from '../../node/base.ts'
import { BooleanValue, NumberValue, StringValue } from '../../node/primitive.ts'

export function isTruthy(value: ValueTypes) {
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
