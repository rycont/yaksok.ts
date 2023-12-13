import { YaksokError } from '../errors.ts'
import { Operator, ValueTypes } from './index.ts'
import {
    NumberValue,
    StringValue,
    PrimitiveValue,
    BooleanValue,
} from './primitive.ts'

export class PlusOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value + right.value)
        }

        if (left instanceof StringValue && right instanceof StringValue) {
            return new StringValue(left.value + right.value)
        }

        if (left instanceof StringValue && right instanceof NumberValue) {
            return new StringValue(left.value + right.value.toString())
        }

        if (left instanceof NumberValue && right instanceof StringValue) {
            return new StringValue(left.value.toString() + right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_PLUS_OPERATOR')
    }
}

export class MinusOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value - right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_MINUS_OPERATOR')
    }
}

export class MultiplyOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value * right.value)
        }

        if (left instanceof StringValue && right instanceof NumberValue) {
            return new StringValue(left.value.repeat(right.value))
        }

        throw new YaksokError('INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
    }
}

export class DivideOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value / right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_DIVIDE_OPERATOR')
    }
}

export class EqualOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof PrimitiveValue && right instanceof PrimitiveValue) {
            return new BooleanValue(left.value === right.value)
        }

        throw new Error(
            "Evaluation equality between non-primitive values isn't supported yet.",
        )
    }
}

export class AndOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            !(left instanceof BooleanValue) ||
            !(right instanceof BooleanValue)
        ) {
            throw new YaksokError('INVALID_TYPE_FOR_AND_OPERATOR')
        }

        return new BooleanValue(left.value && right.value)
    }
}

export class GreaterThanOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value > right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OPERATOR')
    }
}

export class LessThanOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value < right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
    }
}

export class GreaterThanOrEqualOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value >= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OR_EQUAL_OPERATOR')
    }
}

export class LessThanOrEqualOperator extends Operator {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value <= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_OR_EQUAL_OPERATOR')
    }
}
