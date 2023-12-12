import { YaksokError } from '../errors.ts'
import { OperatorPiece, ValueTypes } from './index.ts'
import {
    NumberPiece,
    StringPiece,
    PrimitiveValuePiece,
    BooleanPiece,
} from './primitive.ts'

export class PlusOperatorPiece extends OperatorPiece {
    constructor() {
        super('+')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value + right.value)
        }

        if (left instanceof StringPiece && right instanceof StringPiece) {
            return new StringPiece(left.value + right.value)
        }

        if (left instanceof StringPiece && right instanceof NumberPiece) {
            return new StringPiece(left.value + right.value.toString())
        }

        if (left instanceof NumberPiece && right instanceof StringPiece) {
            return new StringPiece(left.value.toString() + right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_PLUS_OPERATOR')
    }
}

export class MinusOperatorPiece extends OperatorPiece {
    constructor() {
        super('-')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value - right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_MINUS_OPERATOR')
    }
}

export class MultiplyOperatorPiece extends OperatorPiece {
    constructor() {
        super('*')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value * right.value)
        }

        if (left instanceof StringPiece && right instanceof NumberPiece) {
            return new StringPiece(left.value.repeat(right.value))
        }

        throw new YaksokError('INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
    }
}

export class DivideOperatorPiece extends OperatorPiece {
    constructor() {
        super('/')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value / right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_DIVIDE_OPERATOR')
    }
}

export class EqualOperatorPiece extends OperatorPiece {
    constructor() {
        super('=')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            left instanceof PrimitiveValuePiece &&
            right instanceof PrimitiveValuePiece
        ) {
            return new BooleanPiece(left.value === right.value)
        }

        throw new Error(
            "Evaluation equality between non-primitive values isn't supported yet.",
        )
    }
}

export class AndOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            !(left instanceof BooleanPiece) ||
            !(right instanceof BooleanPiece)
        ) {
            throw new YaksokError('INVALID_TYPE_FOR_AND_OPERATOR')
        }

        return new BooleanPiece(left.value && right.value)
    }
}

export class GreaterThanOperatorPiece extends OperatorPiece {
    constructor() {
        super('>')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value > right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OPERATOR')
    }
}

export class LessThanOperatorPiece extends OperatorPiece {
    constructor() {
        super('<')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value < right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
    }
}

export class GreaterThanOrEqualOperatorPiece extends OperatorPiece {
    constructor() {
        super('>=')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value >= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OR_EQUAL_OPERATOR')
    }
}

export class LessThanOrEqualOperatorPiece extends OperatorPiece {
    constructor() {
        super('<=')
    }

    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value <= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
    }
}
