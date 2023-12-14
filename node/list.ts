import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Evaluable, ValueTypes, Node, Executable, Operator } from './index.ts'
import { IndexedValue } from './indexed.ts'
import { NumberValue, PrimitiveValue } from './primitive.ts'

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
                throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_1')

            const list = this.execute(scope, callFrame).evaluatedItems!.map(
                (item) => item.execute(scope, callFrame),
            )

            if (list.length <= indexValue)
                throw new YaksokError('LIST_INDEX_OUT_OF_RANGE')

            return list[indexValue]
        }

        if (index instanceof List) {
            const list = this.execute(scope, callFrame).evaluatedItems!.map(
                (item) => item.execute(scope, callFrame),
            )

            const indexValue = index.execute(scope, callFrame).evaluatedItems!

            return new List({
                evaluatedItems: indexValue.map((index) => {
                    if (!(index instanceof NumberValue)) {
                        throw new YaksokError(
                            'LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST',
                        )
                    }

                    return list[index.value - 1]
                }),
            })
        }

        throw new YaksokError('LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
    }

    setItem(
        index: PrimitiveValue<unknown>,
        value: PrimitiveValue<unknown>,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        if (!(index instanceof NumberValue)) {
            throw new YaksokError('LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
        }

        const indexValue = index.value - 1

        if (indexValue < 0)
            throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_1')

        const content = this.execute(scope, callFrame).evaluatedItems!
        content[indexValue] = value

        return value
    }

    toPrint(): string {
        if (!this.evaluatedItems) throw new YaksokError('LIST_NOT_EVALUATED')
        return (
            '[ ' +
            this.evaluatedItems.map((item) => item.toPrint()).join(' ') +
            ' ]'
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
            throw new YaksokError('INVALID_TYPE_FOR_INDEX_FETCH')
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

        const targetSequence = this.target.target.execute(scope, callFrame)
        const targetIndex = this.target.index.value.execute(scope, callFrame)

        if (!(targetSequence instanceof IndexedValue)) {
            throw new YaksokError('INVALID_SEQUENCE_TYPE_FOR_INDEX_FETCH')
        }

        targetSequence.setItem(targetIndex, value, scope, callFrame)
    }
}

export class RangeOperator extends Operator {
    call(...operands: ValueTypes[]): List {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }
        const [left, right] = operands

        if (!(left instanceof NumberValue)) {
            throw new YaksokError('RANGE_START_MUST_BE_NUMBER')
        }

        if (!(right instanceof NumberValue)) {
            throw new YaksokError('RANGE_END_MUST_BE_NUMBER')
        }

        if (left.value > right.value)
            throw new YaksokError('RANGE_START_MUST_BE_LESS_THAN_END')

        const evaluatedItems: NumberValue[] = []

        for (let i = left.value; i <= right.value; i++) {
            evaluatedItems.push(new NumberValue(i))
        }

        return new List({
            evaluatedItems,
        })
    }
}
