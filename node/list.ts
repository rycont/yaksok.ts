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
    ListNotEvaluatedError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
} from '../errors/index.ts'

export class Sequence extends Evaluable {
    items: Evaluable[]

    constructor(props: { a: Evaluable | Sequence; b: Evaluable | Sequence }) {
        super()

        const { a, b } = props
        let items: Evaluable[] = []

        if (a instanceof Sequence && b instanceof Evaluable) {
            items = [...a.items, b]
        } else if (a instanceof Evaluable && b instanceof Evaluable) {
            items = [a, b]
        }

        this.items = items
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
    items?: Evaluable[]
    evaluatedItems?: ValueTypes[]

    constructor(props: { sequence?: Sequence; evaluatedItems?: ValueTypes[] }) {
        super()

        if (props.evaluatedItems) {
            this.evaluatedItems = props.evaluatedItems
            this.items = props.evaluatedItems

            return
        }

        if (props.sequence) {
            this.items = props.sequence.items
            return
        }

        this.evaluatedItems = []
    }

    execute(scope: Scope, callFrame: CallFrame) {
        if (this.evaluatedItems) return this

        const items = this.items!.map((item) => item.execute(scope, callFrame))

        this.evaluatedItems = items
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

            const list = this.execute(scope, callFrame).evaluatedItems!.map(
                (item) => item.execute(scope, callFrame),
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
            const list = this.execute(scope, callFrame).evaluatedItems!.map(
                (item) => item.execute(scope, callFrame),
            )

            const indexValue = index.execute(scope, callFrame).evaluatedItems!

            return new List({
                evaluatedItems: indexValue.map((index) => {
                    if (index instanceof NumberValue) {
                        return list[index.value - 1]
                    }

                    throw new ListIndexTypeError({
                        position: this.position,
                        resource: {
                            index,
                        },
                    })
                }),
            })
        }

        throw new ListIndexTypeError({
            position: this.position,
            resource: {
                index,
            },
        })
    }

    setItem(
        index: PrimitiveValue<unknown>,
        value: PrimitiveValue<unknown>,
        scope: Scope,
        callFrame: CallFrame,
    ) {
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

        const content = this.execute(scope, callFrame).evaluatedItems!
        content[indexValue] = value

        return value
    }

    toPrint(): string {
        if (!this.evaluatedItems) {
            throw new ListNotEvaluatedError({
                position: this.position,
            })
        }
        return (
            '[' +
            this.evaluatedItems.map((item) => item.toPrint()).join(', ') +
            ']'
        )
    }
}

export class Indexing extends Node {
    value: Evaluable

    constructor(props: { index: Evaluable }) {
        super()
        this.value = props.index
    }
}

export class IndexFetch extends Evaluable {
    target: Evaluable
    index: Indexing

    constructor(props: { target: Evaluable; index: Indexing }) {
        super()

        this.target = props.target
        this.index = props.index
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const index = this.index.value.execute(scope, callFrame)
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
    target: IndexFetch
    value: Evaluable

    constructor(props: { target: IndexFetch; value: Evaluable }) {
        super()

        this.target = props.target
        this.value = props.value
    }
    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const value = this.value.execute(scope, callFrame)

        const targetList = this.target.target.execute(scope, callFrame)
        const targetIndex = this.target.index.value.execute(scope, callFrame)

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

        const evaluatedItems: NumberValue[] = []

        for (let i = start.value; i <= end.value; i++) {
            evaluatedItems.push(new NumberValue(i))
        }

        return new List({
            evaluatedItems,
        })
    }
}
