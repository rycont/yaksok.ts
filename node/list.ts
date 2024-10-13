import {
    InvalidNumberOfOperandsError,
    ListIndexMustBeGreaterThan1Error,
    ListIndexOutOfRangeError,
    ListIndexTypeError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
} from '../error/index.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Evaluable, Executable, Operator, ValueTypes } from './index.ts'
import { IndexedValue } from './indexed.ts'
import { NumberValue, PrimitiveValue } from './primitive.ts'

export class Sequence extends Evaluable {
    constructor(public items: Evaluable[]) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const indexItem = this.items[this.items.length - 1]
        const result = indexItem.execute(scope, callFrame)

        return result
    }

    override toPrint() {
        const content = this.items.map((item) => item.toPrint()).join(' ')
        return '( ' + content + ' )'
    }
}

export class List extends IndexedValue {
    evaluatedItems?: ValueTypes[]

    constructor(public items: Evaluable[]) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        this.evaluatedItems = List.evaluateList(
            this.items,
            new Scope(),
            callFrame,
        )

        return this
    }

    getItem(
        index: ValueTypes,
        scope: Scope,
        _callFrame: CallFrame,
    ): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)

        if (index instanceof NumberValue) {
            return this.getItemByNumberIndex(index.value, scope, callFrame)
        } else if (index instanceof List) {
            return this.getItemsByListIndex(index, scope, callFrame)
        }

        throw new ListIndexTypeError({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    private getItemByNumberIndex(
        index: number,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        this.assertGreaterOrEqualThan1(index)
        this.assertIndexLessThanLength(index)

        const indexValue = index - 1
        const list = this.execute(scope, callFrame).evaluatedItems!

        return list[indexValue]
    }

    private getItemsByListIndex(
        index: List,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        const list = this.execute(scope, callFrame).evaluatedItems!
        const indexes = index.execute(scope, callFrame).evaluatedItems!

        const items = this.getItemsByIndexes(list, indexes)
        const itemsList = new List(items)

        return itemsList
    }

    private getItemsByIndexes(list: ValueTypes[], indexes: ValueTypes[]) {
        return indexes.map((index) => {
            this.assertProperIndexPrimitiveType(index)
            return list[index.value - 1]
        })
    }

    setItem(index: PrimitiveValue<unknown>, value: PrimitiveValue<unknown>) {
        this.assertProperIndexPrimitiveType(index)
        this.assertGreaterOrEqualThan1(index.value)

        const indexValue = index.value - 1
        this.items[indexValue] = value

        return value
    }

    static evaluateList(
        items: Evaluable[],
        scope: Scope,
        callFrame: CallFrame,
    ) {
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
        index: ValueTypes,
    ): asserts index is NumberValue {
        if (index instanceof NumberValue) return

        throw new ListIndexTypeError({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    private assertIndexLessThanLength(index: number) {
        if (index <= this.items.length) return

        throw new ListIndexOutOfRangeError({
            resource: {
                index,
            },
            position: this.position,
        })
    }

    override toPrint() {
        const content = this.items.map((item) => item.toPrint()).join(', ')
        return '[' + content + ']'
    }
}

export class IndexFetch extends Evaluable {
    constructor(public target: Evaluable, public index: Evaluable) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const target = this.target.execute(scope, callFrame)
        this.assertProperTargetType(target)

        const index = this.index.execute(scope, callFrame)
        const value = target.getItem(index, scope, callFrame)

        return value
    }

    assertProperTargetType(target: ValueTypes): asserts target is IndexedValue {
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

    assertProperTargetType(target: ValueTypes): asserts target is IndexedValue {
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
    override call(...operands: ValueTypes[]): List {
        this.assertProperOperands(operands)

        const [start, end] = operands

        const items = Array.from(
            { length: end.value - start.value + 1 },
            (_, i) => new NumberValue(i + start.value),
        )

        const list = new List(items)
        list.evaluatedItems = items

        return list
    }

    private assertProperOperands(
        operands: ValueTypes[],
    ): asserts operands is [NumberValue, NumberValue] {
        this.assertProperOperandsLength(operands)
        this.assertProperStartType(operands[0])
        this.assertProperEndType(operands[1])
        this.assertRangeStartLessThanEnd(operands[0].value, operands[1].value)
    }

    private assertProperOperandsLength(operands: ValueTypes[]) {
        if (operands.length === 2) return

        throw new InvalidNumberOfOperandsError({
            position: this.position,
            resource: {
                actual: operands.length,
                expected: 2,
                operator: this,
            },
        })
    }

    private assertProperStartType(
        start: ValueTypes,
    ): asserts start is NumberValue {
        if (start instanceof NumberValue) return

        throw new RangeStartMustBeNumberError({
            position: this.position,
            resource: {
                start,
            },
        })
    }

    private assertProperEndType(end: ValueTypes): asserts end is NumberValue {
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
