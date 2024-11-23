import {
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
} from '../error/indexed.ts'
import { ValueType } from '../value/base.ts'
import { ListValue } from '../value/list.ts'
import { NumberValue } from '../value/primitive.ts'
import { Evaluable, Executable, Node, Operator } from './base.ts'

export class Sequence extends Node {
    static override friendlyName = '나열된 값'
}

export class List extends Evaluable {
    static override friendlyName = '목록'
}

export class IndexFetch extends Evaluable {
    static override friendlyName = '목록에서 값 가져오기'
}

export class SetToIndex extends Executable {
    static override friendlyName = '목록에 값 넣기'
}

export class RangeOperator extends Operator {
    static override friendlyName = '범위에서 목록 만들기(~)'

    override toPrint(): string {
        return '~'
    }

    override call(...operands: ValueType[]): ListValue {
        this.assertProperOperands(operands)

        const [start, end] = operands
        const entries = new Map<number, ValueType>()

        for (let i = start.value; i <= end.value; i++) {
            entries.set(i, new NumberValue(i))
        }

        return new ListValue(entries)
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
            position: this.position,
            resource: {
                start,
            },
        })
    }

    private assertProperEndType(end: ValueType): asserts end is NumberValue {
        if (end instanceof NumberValue) return

        throw new RangeEndMustBeNumberError({
            position: this.position,
            resource: {
                end,
            },
        })
    }

    private assertRangeStartLessThanEnd(start: number, end: number) {
        if (start <= end) return

        throw new RangeStartMustBeLessThanEndError({
            position: this.position,
            resource: {
                start,
                end,
            },
        })
    }
}
