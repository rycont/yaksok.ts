import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import {
    EvaluatablePiece,
    ValueTypes,
    Piece,
    ExecutablePiece,
    OperatorPiece,
} from './index.ts'
import { IndexedValuePiece } from './indexed.ts'
import { NumberPiece, PrimitiveValuePiece } from './primitive.ts'

export class SequencePiece extends EvaluatablePiece {
    items: EvaluatablePiece[]

    constructor(props: {
        a: EvaluatablePiece | SequencePiece
        b: EvaluatablePiece | SequencePiece
    }) {
        super()

        const { a, b } = props
        let items: EvaluatablePiece[] = []

        if (a instanceof SequencePiece && b instanceof EvaluatablePiece) {
            items = [...a.items, b]
        } else if (
            a instanceof EvaluatablePiece &&
            b instanceof EvaluatablePiece
        ) {
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

export class ListPiece extends IndexedValuePiece {
    sequence?: SequencePiece
    items?: ValueTypes[]

    constructor(props: { sequence?: SequencePiece; items?: ValueTypes[] }) {
        super()

        this.sequence = props.sequence
        this.items = props.items

        if (!this.sequence && !this.items) {
            this.items = []
        }
    }

    execute(scope: Scope, callFrame: CallFrame) {
        if (this.items) return this

        const items = this.sequence!.items.map((item) =>
            item.execute(scope, callFrame),
        )

        this.items = items

        return this
    }

    getItem(
        index: ValueTypes,
        scope: Scope,
        _callFrame: CallFrame,
    ): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)

        if (index instanceof NumberPiece) {
            const indexValue = index.value - 1

            if (indexValue < 0)
                throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_1')

            const list = this.execute(scope, callFrame).items!.map((item) =>
                item.execute(scope, callFrame),
            )

            if (list.length <= indexValue)
                throw new YaksokError('LIST_INDEX_OUT_OF_RANGE')

            return list[indexValue]
        }

        if (index instanceof ListPiece) {
            const list = this.execute(scope, callFrame).items!.map((item) =>
                item.execute(scope, callFrame),
            )

            const indexValue = index.execute(scope, callFrame).items!

            return new ListPiece({
                items: indexValue.map((index) => {
                    if (!(index instanceof NumberPiece)) {
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
        index: PrimitiveValuePiece<unknown>,
        value: PrimitiveValuePiece<unknown>,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        if (!(index instanceof NumberPiece)) {
            throw new YaksokError('LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
        }

        const indexValue = index.value - 1

        if (indexValue < 0)
            throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_1')

        const content = this.execute(scope, callFrame).items!
        content[indexValue] = value

        return value
    }

    toPrint(): string {
        if (!this.items) throw new YaksokError('LIST_NOT_EVALUATED')
        return '[ ' + this.items.map((item) => item.toPrint()).join(' ') + ' ]'
    }
}

export class IndexingPiece extends Piece {
    value: EvaluatablePiece

    constructor(props: { index: EvaluatablePiece }) {
        super()
        this.value = props.index
    }
}

export class IndexFetchPiece extends EvaluatablePiece {
    target: EvaluatablePiece
    index: IndexingPiece

    constructor(props: { target: EvaluatablePiece; index: IndexingPiece }) {
        super()

        this.target = props.target
        this.index = props.index
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const index = this.index.value.execute(scope, callFrame)
        const target = this.target.execute(scope, callFrame)

        if (!(target instanceof IndexedValuePiece)) {
            throw new YaksokError('INVALID_TYPE_FOR_INDEX_FETCH')
        }

        const value = target.getItem(index, scope, callFrame)
        return value
    }
}

export class SetToIndexPiece extends ExecutablePiece {
    target: IndexFetchPiece
    value: EvaluatablePiece

    constructor(props: { target: IndexFetchPiece; value: EvaluatablePiece }) {
        super()

        this.target = props.target
        this.value = props.value
    }
    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        const value = this.value.execute(scope, callFrame)

        const targetSequence = this.target.target.execute(scope, callFrame)
        const targetIndex = this.target.index.value.execute(scope, callFrame)

        if (!(targetSequence instanceof IndexedValuePiece)) {
            throw new YaksokError('INVALID_SEQUENCE_TYPE_FOR_INDEX_FETCH')
        }

        targetSequence.setItem(targetIndex, value, scope, callFrame)
    }
}

export class RangeOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]): ListPiece {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }
        const [left, right] = operands

        if (!(left instanceof NumberPiece)) {
            throw new YaksokError('RANGE_START_MUST_BE_NUMBER')
        }

        if (!(right instanceof NumberPiece)) {
            throw new YaksokError('RANGE_END_MUST_BE_NUMBER')
        }

        if (left.value > right.value)
            throw new YaksokError('RANGE_START_MUST_BE_LESS_THAN_END')

        const items: NumberPiece[] = []

        for (let i = left.value; i <= right.value; i++) {
            items.push(new NumberPiece(i))
        }

        return new ListPiece({
            items,
        })
    }
}
