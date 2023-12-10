import { ValueTypes } from '../piece/basement.ts'
import { ListPiece } from '../piece/list.ts'
import { BooleanPiece, NumberPiece, StringPiece } from '../piece/primitive.ts'

export function isTruthy(value: ValueTypes) {
    if (value instanceof BooleanPiece) {
        return value.value
    }

    if (value instanceof NumberPiece) {
        return value.value !== 0
    }

    if (value instanceof StringPiece) {
        return value.value !== ''
    }

    if (value instanceof ListPiece) {
        return value.items!.length !== 0
    }

    return true
}
