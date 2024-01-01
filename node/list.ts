import { Evaluable, ValueTypes, Node, Executable, Operator } from './index.ts'
import { NumberValue, PrimitiveValue } from './primitive.ts'
import { IndexedValue } from './indexed.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
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

export class Sequence extends Evaluable {
    constructor(public items: Evaluable[]) {
        super()
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const result = this.items[this.items.length - 1].execute(
            scope,
            callFrame,
        )

        return result
    }

    toPrint() {
        return '( ' + this.items.map((item) => item.toPrint()).join(' ') + ' )'
    }
}

export class List extends IndexedValue {
    constructor(public items: Evaluable[]) {
        super()
    }

    execute() {
        return this
    }

    getItem(
        index: ValueTypes,
        scope: Scope,
        _callFrame: CallFrame,
    ): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)

        if (index instanceof NumberValue) {
            const indexValue = index.value - 1

            if (indexValue < 0)
                throw new ListIndexMustBeGreaterThan1Error({
                    position: this.position,
                    resource: {
                        index,
                    },
                })

            const list = this.items.map((item) =>
                item.execute(scope, callFrame),
            )

            if (list.length <= indexValue)
                throw new ListIndexOutOfRangeError({
                    resource: {
                        index,
                    },
                    position: this.position,
                })

            return list[indexValue]
        }

        if (index instanceof List) {
            const list = this.items.map((item) =>
                item.execute(scope, callFrame),
            )

            const indexValue = index.items.map((item) =>
                item.execute(scope, callFrame),
            )

            const fetchedItems = indexValue.map((index) => {
                if (index instanceof NumberValue) {
                    return list[index.value - 1]
                }

                throw new ListIndexTypeError({
                    position: this.position,
                    resource: {
                        index,
                    },
                })
            })

            return new List(fetchedItems)
        }

        throw new ListIndexTypeError({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    setItem(index: PrimitiveValue<unknown>, value: PrimitiveValue<unknown>) {
        if (!(index instanceof NumberValue)) {
            throw new ListIndexTypeError({
                position: this.position,
                resource: {
                    index,
                },
            })
        }

        const indexValue = index.value - 1

        if (indexValue < 0) {
            throw new ListIndexMustBeGreaterThan1Error({
                position: this.position,
                resource: {
                    index,
                },
            })
        }

        this.items[indexValue] = value

        return value
    }

    toPrint(): string {
        return '[' + this.items.map((item) => item.toPrint()).join(', ') + ']'
    }
}

export class Indexing extends Node {
    constructor(public value: Evaluable) {
        super()
    }
}

export class IndexFetch extends Evaluable {
    constructor(public target: Evaluable, public index: Evaluable) {
        super()
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const index = this.index.execute(scope, callFrame)
        const target = this.target.execute(scope, callFrame)

        if (!(target instanceof IndexedValue)) {
            throw new TargetIsNotIndexedValueError({
                position: this.position,
                resource: {
                    target,
                },
            })
        }

        const value = target.getItem(index, scope, callFrame)
        return value
    }
}

export class SetToIndex extends Executable {
    constructor(public target: IndexFetch, public value: Evaluable) {
        super()
    }
    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const value = this.value.execute(scope, callFrame)

        const targetList = this.target.target.execute(scope, callFrame)
        const targetIndex = this.target.index.execute(scope, callFrame)

        if (!(targetList instanceof IndexedValue)) {
            throw new TargetIsNotIndexedValueError({
                position: this.position,
                resource: {
                    target: targetList,
                },
            })
        }

        targetList.setItem(targetIndex, value, scope, callFrame)
    }
}

export class RangeOperator extends Operator {
    call(...operands: ValueTypes[]): List {
        if (operands.length !== 2) {
            throw new InvalidNumberOfOperandsError({
                position: this.position,
                resource: {
                    actual: operands.length,
                    expected: 2,
                    operator: this,
                },
            })
        }
        const [start, end] = operands

        if (!(start instanceof NumberValue)) {
            throw new RangeStartMustBeNumberError({
                position: this.position,
                resource: {
                    start,
                },
            })
        }

        if (!(end instanceof NumberValue)) {
            throw new RangeEndMustBeNumberError({
                position: this.position,
                resource: {
                    end,
                },
            })
        }

        if (start.value > end.value) {
            throw new RangeStartMustBeLessThanEndError({
                position: this.position,
                resource: {
                    start: start.value,
                    end: end.value,
                },
            })
        }

        const items: NumberValue[] = []

        for (let i = start.value; i <= end.value; i++) {
            items.push(new NumberValue(i))
        }

        return new List(items)
    }
}
