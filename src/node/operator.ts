import { InvalidTypeForCompareError } from '../error/calculation.ts'
import { InvalidTypeForOperatorError } from '../error/index.ts'
import { PrimitiveValue, ValueType } from '../value/index.ts'
import { BooleanValue, NumberValue, StringValue } from '../value/primitive.ts'
import { Operator } from './base.ts'

export class PlusOperator extends Operator {
    static override friendlyName = '더하기(+)'

    override toPrint(): string {
        return '+'
    }

    override call(...operands: ValueType[]): NumberValue | StringValue {
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

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class MinusOperator extends Operator {
    static override friendlyName = '빼기(-)'

    override toPrint(): string {
        return '-'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands
        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value - right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class MultiplyOperator extends Operator {
    static override friendlyName = '곱하기(*)'

    override toPrint(): string {
        return '*'
    }

    override call(...operands: ValueType[]): NumberValue | StringValue {
        const [left, right] = operands
        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value * right.value)
        }

        if (left instanceof StringValue && right instanceof NumberValue) {
            return new StringValue(left.value.repeat(right.value))
        }

        if (left instanceof NumberValue && right instanceof StringValue) {
            return new StringValue(right.value.repeat(left.value))
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class DivideOperator extends Operator {
    static override friendlyName = '나누기(/)'

    override toPrint(): string {
        return '/'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value / right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class ModularOperator extends Operator {
    static override friendlyName = '나머지(%)'

    override toPrint(): string {
        return '%'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value % right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}
export class PowerOperator extends Operator {
    static override friendlyName = '제곱(**)'

    override toPrint(): string {
        return '**'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value ** right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}
export class IntegerDivideOperator extends Operator {
    static override friendlyName = '정수 나누기(//)'

    override toPrint(): string {
        return '//'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(Math.floor(left.value / right.value))
        }

        throw new InvalidTypeForOperatorError({
            position: this.position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class EqualOperator extends Operator {
    static override friendlyName = '같다(=)'

    override toPrint(): string {
        return '='
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        const isSameType = left.constructor === right.constructor
        const isBothPrimitive =
            left instanceof PrimitiveValue && right instanceof PrimitiveValue

        if (!isSameType || !isBothPrimitive) {
            throw new InvalidTypeForCompareError({
                resource: {
                    left,
                    right,
                },
                position: this.position,
            })
        }

        return new BooleanValue(left.value === right.value)
    }
}

export class AndOperator extends Operator {
    static override friendlyName = '이고(그리고)'

    override toPrint(): string {
        return '이고(그리고)'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (
            !(left instanceof BooleanValue) ||
            !(right instanceof BooleanValue)
        ) {
            throw new InvalidTypeForOperatorError({
                position: this.position,
                resource: {
                    operator: this,
                    operands,
                },
            })
        }

        return new BooleanValue(left.value && right.value)
    }
}

export class OrOperator extends Operator {
    static override friendlyName = '이거나(거나)'

    override toPrint(): string {
        return '이거나(거나)'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (
            !(left instanceof BooleanValue) ||
            !(right instanceof BooleanValue)
        ) {
            throw new InvalidTypeForOperatorError({
                position: this.position,
                resource: {
                    operator: this,
                    operands,
                },
            })
        }

        return new BooleanValue(left.value || right.value)
    }
}

export class GreaterThanOperator extends Operator {
    static override friendlyName = '크다(>)'

    override toPrint(): string {
        return '>'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value > right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class LessThanOperator extends Operator {
    static override friendlyName = '작다(<)'

    override toPrint(): string {
        return '<'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value < right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class GreaterThanOrEqualOperator extends Operator {
    static override friendlyName = '크거나 같다(>=)'

    override toPrint(): string {
        return '>='
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value >= right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class LessThanOrEqualOperator extends Operator {
    static override friendlyName = '작거나 같다(<=)'

    override toPrint(): string {
        return '<='
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value <= right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.position,
            resource: {
                left,
                right,
            },
        })
    }
}
