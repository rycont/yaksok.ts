import {
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
} from '../error/indexed.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { Scope } from '../executer/scope.ts'
import { ValueType } from '../value/base.ts'
import { IndexedValue } from '../value/indexed.ts'
import { ListValue } from '../value/list.ts'
import { NumberValue, StringValue } from '../value/primitive.ts'
import { Evaluable, Executable, Node, Operator } from './base.ts'

export class Sequence extends Node {
    static override friendlyName = '나열된 값'

    constructor(public items: Evaluable[]) {
        super()
    }
}

export class ListLiteral extends Evaluable {
    static override friendlyName = '목록'

    constructor(public items: Evaluable[]) {
        super()
    }

    override execute(scope: Scope, callFrame: CallFrame): ListValue {
        const entries = new Map<number, ValueType>()

        for (const [index, item] of this.items.entries()) {
            entries.set(index + 1, item.execute(scope, callFrame))
        }

        return new ListValue(entries)
    }
}

export class IndexFetch extends Evaluable {
    static override friendlyName = '사전에서 값 가져오기'

    constructor(
        public list: Evaluable<IndexedValue>,
        public index: Evaluable<StringValue | NumberValue>,
    ) {
        super()
    }

    override execute(scope: Scope, callFrame: CallFrame): ValueType {
        const list = this.list.execute(scope, callFrame)
        const index = this.index.execute(scope, callFrame).value

        return list.getItem(index)
    }

    public setValue(scope: Scope, callFrame: CallFrame, value: ValueType) {
        const list = this.list.execute(scope, callFrame)
        const index = this.index.execute(scope, callFrame).value

        list.setItem(index, value)
    }
}

export class SetToIndex extends Executable {
    static override friendlyName = '목록에 값 넣기'

    constructor(private target: IndexFetch, private value: Evaluable) {
        super()

        this.position = target.position
    }

    override execute(scope: Scope, callFrame: CallFrame): void {
        const value = this.value.execute(scope, callFrame)
        this.target.setValue(scope, callFrame, value)
    }
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
