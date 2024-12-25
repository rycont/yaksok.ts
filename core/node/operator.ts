import { InvalidTypeForCompareError } from '../error/calculation.ts'
import {
    InvalidTypeForOperatorError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
} from '../error/index.ts'
import { Token } from '../prepare/tokenize/token.ts'

import { PrimitiveValue, ValueType } from '../value/base.ts'
import { ListValue } from '../value/list.ts'
import { BooleanValue, NumberValue, StringValue } from '../value/primitive.ts'
import { Operator } from './base.ts'

export class PlusOperator extends Operator {
    static override friendlyName = '더하기(+)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

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
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class MinusOperator extends Operator {
    static override friendlyName = '빼기(-)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '-'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands
        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value - right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class MultiplyOperator extends Operator {
    static override friendlyName = '곱하기(*)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

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
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class DivideOperator extends Operator {
    static override friendlyName = '나누기(/)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '/'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value / right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class ModularOperator extends Operator {
    static override friendlyName = '나머지(%)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '%'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value % right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}
export class PowerOperator extends Operator {
    static override friendlyName = '제곱(**)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '**'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(left.value ** right.value)
        }

        throw new InvalidTypeForOperatorError({
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}
export class IntegerDivideOperator extends Operator {
    static override friendlyName = '정수 나누기(//)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '//'
    }

    override call(...operands: ValueType[]): NumberValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new NumberValue(Math.floor(left.value / right.value))
        }

        throw new InvalidTypeForOperatorError({
            position: this.tokens?.[0].position,
            resource: {
                operator: this,
                operands,
            },
        })
    }
}

export class EqualOperator extends Operator {
    static override friendlyName = '같다(=)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

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
                position: this.tokens?.[0].position,
            })
        }

        return new BooleanValue(left.value === right.value)
    }
}

export class AndOperator extends Operator {
    static override friendlyName = '이고(그리고)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

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
                position: this.tokens?.[0].position,
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

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

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
                position: this.tokens?.[0].position,
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

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '>'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value > right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.tokens?.[0].position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class LessThanOperator extends Operator {
    static override friendlyName = '작다(<)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '<'
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value < right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.tokens?.[0].position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class GreaterThanOrEqualOperator extends Operator {
    static override friendlyName = '크거나 같다(>=)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '>='
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value >= right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.tokens?.[0].position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class LessThanOrEqualOperator extends Operator {
    static override friendlyName = '작거나 같다(<=)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '<='
    }

    override call(...operands: ValueType[]): BooleanValue {
        const [left, right] = operands

        if (left instanceof NumberValue && right instanceof NumberValue) {
            return new BooleanValue(left.value <= right.value)
        }

        throw new InvalidTypeForCompareError({
            position: this.tokens?.[0].position,
            resource: {
                left,
                right,
            },
        })
    }
}

export class RangeOperator extends Operator {
    static override friendlyName = '범위에서 목록 만들기(~)'

    constructor(public override tokens: Token[]) {
        super(null, tokens)
    }

    override toPrint(): string {
        return '~'
    }

    override call(...operands: ValueType[]): ListValue {
        this.assertProperOperands(operands)

        const [start, end] = operands
        const items = new Array(end.value - start.value + 1)
            .fill(null)
            .map((_, index) => new NumberValue(start.value + index))

        return new ListValue(items)
    }

    private assertProperOperands(
        operands: ValueType[],
    ): asserts operands is [NumberValue, NumberValue] {
        const [start, end] = operands
        this.assertProperStartType(start)
        this.assertProperEndType(end)

        this.assertRangeStartLessThanEnd(start.value, end.value)
    }

    private assertProperStartType(
        start: ValueType,
    ): asserts start is NumberValue {
        if (start instanceof NumberValue) return

        throw new RangeStartMustBeNumberError({
            position: this.tokens[0].position,
            resource: {
                start,
            },
        })
    }

    private assertProperEndType(end: ValueType): asserts end is NumberValue {
        if (end instanceof NumberValue) return

        throw new RangeEndMustBeNumberError({
            position: this.tokens[0].position,
            resource: {
                end,
            },
        })
    }

    private assertRangeStartLessThanEnd(start: number, end: number) {
        if (start <= end) return

        throw new RangeStartMustBeLessThanEndError({
            position: this.tokens[0].position,
            resource: {
                start,
                end,
            },
        })
    }
}
