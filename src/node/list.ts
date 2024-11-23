import {
    ListIndexMustBeGreaterThan1Error,
    ListIndexOutOfRangeError,
    ListIndexError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
} from '../error/index.ts'
import { CallFrame } from '../executer/callFrame.ts'
import { Scope } from '../executer/scope.ts'
import { ValueType } from '../value/base.ts'
import { NumberValue } from '../value/primitive.ts'
import { Evaluable, Executable, Operator } from './base.ts'
import { IndexedValue } from './indexed.ts'
import { NumberLiteral, type PrimitiveLiteral } from './primitive-literal.ts'

export class Sequence extends Executable {
    static override friendlyName = '나열된 값'

    constructor(public items: Evaluable[]) {
        super()
    }

    override toPrint(): string {
        const content = this.items.map((item) => item.toPrint()).join(' ')
        return '( ' + content + ' )'
    }
}

export class List extends IndexedValue {
    static override friendlyName = '목록'

    items?: ValueType[]

    constructor(private initialValue: Evaluable[]) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): List {
        const callFrame = new CallFrame(this, _callFrame)

        this.items = List.evaluateList(this.initialValue, _scope, callFrame)

        return this
    }

    getItem(index: ValueType, scope: Scope, callFrame: CallFrame): ValueType {
        this.assertProperIndexPrimitiveType(index)

        if (index instanceof NumberLiteral) {
            return this.getItemByNumberIndex(index.value)
        }

        return this.getItemsByListIndex(index, scope, callFrame)
    }

    private getItemByNumberIndex(index: number) {
        this.assertGreaterOrEqualThan1(index)
        this.assertIndexLessThanLength(index)

        const indexValue = index - 1
        const list = this.items!

        return list[indexValue]
    }

    private getItemsByListIndex(
        index: List,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        const list = this.items!
        const indexes = index.items! as NumberValue[]

        const items = this.getItemsByIndexes(list, indexes)
        const itemsList = new List(items)

        itemsList.execute(scope, callFrame)

        return itemsList
    }

    private getItemsByIndexes(
        list: ValueType[],
        indexes: NumberValue[],
    ): ValueType[] {
        return indexes.map((index) => {
            return list[index.value - 1]
        })
    }

    setItem(
        index: PrimitiveLiteral<unknown>,
        value: PrimitiveLiteral<unknown>,
    ): PrimitiveLiteral<unknown> {
        this.assertProperIndexPrimitiveType(index)
        this.assertGreaterOrEqualThan1(index.value)

        const indexValue = index.value - 1

        this.items![indexValue] = value

        return value
    }

    static evaluateList(
        items: Evaluable[],
        scope: Scope,
        callFrame: CallFrame,
    ): ValueType[] {
        return items.map((item) => item.execute(scope, callFrame))
    }

    private assertGreaterOrEqualThan1(index: number) {
        if (index >= 1) return

        throw new ListIndexMustBeGreaterThan1Error({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    private assertProperIndexPrimitiveType(
        index: ValueType,
    ): asserts index is NumberLiteral | List {
        if (index instanceof List) {
            for (const item of index.items!) {
                this.assertProperIndexPrimitiveType(item)
            }

            return
        }

        if (index instanceof NumberLiteral && Number.isInteger(index.value))
            return

        throw new ListIndexError({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    private assertIndexLessThanLength(index: number) {
        if (index <= this.items!.length) return

        throw new ListIndexOutOfRangeError({
            resource: {
                index,
            },
            position: this.position,
        })
    }

    override toPrint(): string {
        const content = this.items?.map((item) => item.toPrint()).join(', ')
        return '[' + content + ']'
    }
}

export class IndexFetch extends Evaluable {
    static override friendlyName = '목록에서 값 가져오기'

    constructor(public target: Evaluable, public index: Evaluable) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame): ValueType {
        const callFrame = new CallFrame(this, _callFrame)

        const target = this.target.execute(scope, callFrame)
        this.assertProperTargetType(target)

        const index = this.index.execute(scope, callFrame)
        const value = target.getItem(index, scope, callFrame)

        return value
    }

    assertProperTargetType(target: ValueType): asserts target is IndexedValue {
        if (target instanceof IndexedValue) return

        throw new TargetIsNotIndexedValueError({
            position: this.position,
            resource: {
                target,
            },
        })
    }
}

export class SetToIndex extends Executable {
    static override friendlyName = '목록에 값 넣기'

    constructor(public target: IndexFetch, public value: Evaluable) {
        super()
    }
    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const value = this.value.execute(scope, callFrame)

        const targetList = this.target.target.execute(scope, callFrame)
        const targetIndex = this.target.index.execute(scope, callFrame)

        this.assertProperTargetType(targetList)
        targetList.setItem(targetIndex, value, scope, callFrame)
    }

    assertProperTargetType(target: ValueType): asserts target is IndexedValue {
        if (target instanceof IndexedValue) return

        throw new TargetIsNotIndexedValueError({
            position: this.position,
            resource: {
                target,
            },
        })
    }
}

export class RangeOperator extends Operator {
    static override friendlyName = '범위에서 목록 만들기(~)'

    override call(...operands: ValueType[]): List {
        this.assertProperOperands(operands)

        const [start, end] = operands

        const items = Array.from(
            { length: end.value - start.value + 1 },
            (_, i) => new NumberLiteral(i + start.value),
        )

        const list = new List(items)
        list.items = items

        return list
    }

    private assertProperOperands(
        operands: ValueType[],
    ): asserts operands is [NumberLiteral, NumberLiteral] {
        this.assertProperStartType(operands[0])
        this.assertProperEndType(operands[1])
        this.assertRangeStartLessThanEnd(operands[0].value, operands[1].value)
    }

    private assertProperStartType(
        start: ValueType,
    ): asserts start is NumberLiteral {
        if (start instanceof NumberLiteral) return

        throw new RangeStartMustBeNumberError({
            position: this.position,
            resource: {
                start,
            },
        })
    }

    private assertProperEndType(end: ValueType): asserts end is NumberLiteral {
        if (end instanceof NumberLiteral) return

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
