import { YaksokError } from '../errors.ts'
import { Scope } from '../scope.ts'

export class Piece {
    toJSON() {
        return {
            type: this.constructor.name,
            ...this,
        }
    }
}

class CallFrame {
    parent: CallFrame | undefined
    event: Record<string, (...args: any[]) => void> = {}

    constructor(piece: Piece, parent?: CallFrame) {
        this.parent = parent
    }

    invokeEvent(name: string, ...args: unknown[]) {
        if (this.event[name]) {
            this.event[name](...args)
        } else if (this.parent) {
            this.parent.invokeEvent(name, ...args)
        } else {
            throw new YaksokError('EVENT_NOT_FOUND', {}, { name })
        }
    }
}

export class ExecutablePiece extends Piece {
    execute(scope: Scope, callFrame: CallFrame) {
        throw new Error(`${this.constructor.name} has no execute method`)
    }
    toPrint(): string {
        throw new Error(`${this.constructor.name} has no toPrint method`)
    }
}

export class CommentPiece extends ExecutablePiece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    execute() {}
}

export class EvaluatablePiece extends ExecutablePiece {
    execute(scope: Scope, callFrame: CallFrame): ValueTypes {
        throw new Error('This EvaluatablePiece has no execute method')
    }
}

export class EOLPiece extends Piece {}

export class IndentPiece extends Piece {
    size: number
    constructor(size: number) {
        super()
        this.size = size
    }
}

export class PrimitiveValuePiece<T> extends EvaluatablePiece {
    value: T

    constructor(content: T) {
        super()
        this.value = content
    }

    execute(scope: Scope, _callFrame: CallFrame): PrimitiveValuePiece<T> {
        return this
    }
}

export type PrimitiveTypes = NumberPiece | StringPiece | BooleanPiece
export type ValueTypes = PrimitiveValuePiece<unknown> | IndexedValuePiece

export abstract class IndexedValuePiece extends EvaluatablePiece {
    abstract getItem(
        index: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): ValueTypes
    abstract setItem(
        index: ValueTypes,
        value: ValueTypes,
        scope: Scope,
        callFrame: CallFrame,
    ): void
}

export class NumberPiece extends PrimitiveValuePiece<number> {
    toPrint() {
        return this.value.toString()
    }
}
export class StringPiece extends PrimitiveValuePiece<string> {
    toPrint() {
        return this.value
    }
}
export class BooleanPiece extends PrimitiveValuePiece<boolean> {
    toPrint() {
        return this.value.toString()
    }
}

export class KeywordPiece extends Piece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export class OperatorPiece extends Piece {
    value: string

    constructor(char: string) {
        super()
        this.value = char
    }

    call(...operands: ValueTypes[]): ValueTypes {
        throw new Error('This OperatorPiece has no calc method')
    }
}

export class ExpressionPiece extends Piece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }
}

export class PlusOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value + right.value)
        }

        if (left instanceof StringPiece && right instanceof StringPiece) {
            return new StringPiece(left.value + right.value)
        }

        if (left instanceof StringPiece && right instanceof NumberPiece) {
            return new StringPiece(left.value + right.value.toString())
        }

        if (left instanceof NumberPiece && right instanceof StringPiece) {
            return new StringPiece(left.value.toString() + right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_PLUS_OPERATOR')
    }
}

export class MinusOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value - right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_MINUS_OPERATOR')
    }
}

export class MultiplyOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value * right.value)
        }

        if (left instanceof StringPiece && right instanceof NumberPiece) {
            return new StringPiece(left.value.repeat(right.value))
        }

        throw new YaksokError('INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
    }
}

export class DivideOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.value / right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_DIVIDE_OPERATOR')
    }
}

export class EqualOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            left instanceof PrimitiveValuePiece &&
            right instanceof PrimitiveValuePiece
        ) {
            return new BooleanPiece(left.value === right.value)
        }

        throw new Error(
            "Evaluation equality between non-primitive values isn't supported yet.",
        )
    }
}

export class AndOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            !(left instanceof BooleanPiece) ||
            !(right instanceof BooleanPiece)
        ) {
            throw new YaksokError('INVALID_TYPE_FOR_AND_OPERATOR')
        }

        return new BooleanPiece(left.value && right.value)
    }
}

export class GreaterThanOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value > right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OPERATOR')
    }
}

export class LessThanOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value < right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
    }
}

export class GreaterThanOrEqualOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value >= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_GREATER_THAN_OR_EQUAL_OPERATOR')
    }
}

export class LessThanOrEqualOperatorPiece extends OperatorPiece {
    call(...operands: ValueTypes[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new BooleanPiece(left.value <= right.value)
        }

        throw new YaksokError('INVALID_TYPE_FOR_LESS_THAN_OPERATOR')
    }
}

export class BinaryCalculationPiece extends EvaluatablePiece {
    left: EvaluatablePiece
    right: EvaluatablePiece
    operator: OperatorPiece

    constructor(props: {
        left: EvaluatablePiece
        right: EvaluatablePiece
        operator: OperatorPiece
    }) {
        super()

        this.left = props.left
        this.right = props.right
        this.operator = props.operator
    }

    execute(scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const { left, right, operator } = this

        const leftValue = left.execute(scope, callFrame)
        const rightValue = right.execute(scope, callFrame)

        return operator.call(leftValue, rightValue)
    }
}

export class ValueGroupPiece extends EvaluatablePiece {
    value: EvaluatablePiece

    constructor(props: { value: EvaluatablePiece }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }
}

export class DeclareVariablePiece extends EvaluatablePiece {
    name: string
    value: EvaluatablePiece

    constructor(props: { name: VariablePiece; value: EvaluatablePiece }) {
        super()

        this.name = props.name.name
        this.value = props.value
    }
    execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)

        const { name, value } = this
        const result = value.execute(scope, callFrame)

        if (name === '결과') {
            callFrame.invokeEvent('returnValue', result)
            return result
        }

        scope.setVariable(name, result)
        return result
    }
}

export class BlockPiece extends ExecutablePiece {
    content: Piece[]

    constructor(content: Piece[]) {
        super()
        this.content = content
    }

    execute(scope: Scope, _callFrame?: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (let i = 0; i < this.content.length; i++) {
            const piece = this.content[i]
            if (piece instanceof ExecutablePiece) {
                piece.execute(scope, callFrame)
            } else if (piece instanceof EOLPiece) {
                continue
            } else {
                throw new YaksokError(
                    'CANNOT_PARSE',
                    {},
                    {
                        piece: JSON.stringify(piece),
                    },
                )
            }
        }
    }
}

function isTruthy(value: ValueTypes) {
    if (value instanceof BooleanPiece) {
        return value.value
    }

    if (value instanceof NumberPiece) {
        return value.value !== 0
    }

    if (value instanceof StringPiece) {
        return value.value !== ''
    }

    if (value instanceof ListPiece) {
        return value.items!.length !== 0
    }

    return true
}

export class ConditionPiece extends ExecutablePiece {
    condition: EvaluatablePiece
    ifBody: BlockPiece
    elseBody: BlockPiece

    constructor(
        props:
            | { condition: EvaluatablePiece; body: BlockPiece }
            | {
                  ifBody: ConditionPiece
                  elseBody: BlockPiece
              },
    ) {
        super()

        if ('ifBody' in props) {
            this.condition = props.ifBody.condition
            this.ifBody = props.ifBody.ifBody
            this.elseBody = props.elseBody
        } else {
            this.condition = props.condition
            this.ifBody = props.body
        }
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const { condition, ifBody: body } = this

        if (isTruthy(condition.execute(scope, callFrame))) {
            body.execute(scope, callFrame)
        } else {
            if (this.elseBody) {
                this.elseBody.execute(scope, callFrame)
            }
        }
    }
}

export class PrintPiece extends ExecutablePiece {
    value: EvaluatablePiece

    constructor(props: { value: EvaluatablePiece }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        console.log(this.value.execute(scope, _callFrame).toPrint())
    }
}

export class VariablePiece extends EvaluatablePiece {
    name: string

    constructor(args: { name: KeywordPiece }) {
        super()
        this.name = args.name.value
    }

    execute(scope: Scope) {
        return scope.getVariable(this.name)
    }
}

export class FunctionDeclarationPiece extends ExecutablePiece {
    name: string
    body: BlockPiece

    constructor(props: { body: BlockPiece; name: string }) {
        super()

        this.name = props.name
        this.body = props.body
    }

    execute(scope: Scope) {
        const name = this.name

        if (!name || typeof name !== 'string') {
            throw new YaksokError('FUNCTION_MUST_HAVE_NAME')
        }

        scope.setFunction(name, this)
    }

    run(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        let returnValue: ValueTypes

        callFrame.event.returnValue = (value: ValueTypes) => {
            returnValue = value
        }
        this.body.execute(scope, callFrame)

        return returnValue!
    }
}

export class FunctionInvokePiece extends EvaluatablePiece {
    #name: string

    constructor(props: { name: string }) {
        super()

        for (const key in props) {
            if (key === 'name') continue
            this[key] = props[key]
        }

        this.#name = props.name
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const name = this.#name

        if (!name || typeof name !== 'string') {
            throw new YaksokError('FUNCTION_MUST_HAVE_NAME')
        }

        const args: { [key: string]: ValueTypes } = {}

        for (const key in this) {
            const value = this[key]
            if (value instanceof EvaluatablePiece) {
                args[key] = value.execute(scope, callFrame)
            } else {
                throw new YaksokError(
                    'NOT_EVALUABLE_EXPRESSION',
                    {},
                    { piece: JSON.stringify(value) },
                )
            }
        }

        const func = scope.getFunction(name)

        const childScope = new Scope(scope, args)
        const result = func.run(childScope, callFrame)

        return result || new PrimitiveValuePiece(0)
    }
}

export class BreakPiece extends ExecutablePiece {
    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        callFrame.invokeEvent('break')
    }
}

export class RepeatPiece extends ExecutablePiece {
    body: BlockPiece
    constructor(props: { body: BlockPiece }) {
        super()
        this.body = props.body
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        let running = true

        callFrame.event.break = () => {
            running = false
        }

        while (true) {
            if (!running) break
            this.body.execute(scope, callFrame)
        }
    }
}

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
            b instanceof SequencePiece
        ) {
            items = [a, ...b.items]
        } else if (
            a instanceof EvaluatablePiece &&
            b instanceof EvaluatablePiece
        ) {
            items = [a, b]
        } else if (a instanceof SequencePiece && b instanceof SequencePiece) {
            items = [...a.items, ...b.items]
        } else {
            throw new YaksokError('INVALID_TYPE_FOR_EVALUATABLE_SEQUENCE')
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
    }

    execute(scope: Scope, callFrame: CallFrame) {
        if (this.items) return this
        if (!this.sequence) throw new YaksokError('LIST_NOT_EVALUATED')

        const items = this.sequence?.items.map((item) =>
            item.execute(scope, callFrame),
        )

        this.items = items

        return this
    }

    getItem(index: ValueTypes, scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        if (index instanceof NumberPiece) {
            const indexValue = index.value - 1

            if (indexValue < 0)
                throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_0')

            const list = this.execute(scope, callFrame).items!.map((item) =>
                item.execute(scope, callFrame),
            )

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
                        throw new YaksokError('LIST_INDEX_MUST_BE_NUMBER')
                    }

                    return list[index.value - 1]
                }),
            })
        }
    }

    setItem(
        index: PrimitiveValuePiece<unknown>,
        value: PrimitiveValuePiece<unknown>,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        if (!(index instanceof NumberPiece)) {
            throw new YaksokError('LIST_INDEX_MUST_BE_NUMBER')
        }

        const indexValue = index.value - 1

        if (indexValue < 0)
            throw new YaksokError('LIST_INDEX_MUST_BE_GREATER_THAN_0')

        this.execute(scope, callFrame).items![indexValue] = value

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
