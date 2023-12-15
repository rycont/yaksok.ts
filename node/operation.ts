import { Evaluable, Operator } from './index.ts'

import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

export class BinaryOperation extends Evaluable {
    left: Evaluable
    right: Evaluable
    operator: Operator

    constructor(props: {
        left: Evaluable
        right: Evaluable
        operator: Operator
    }) {
        super()

        this.left = props.left
        this.right = props.right
        this.operator = props.operator
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        const { left, right, operator } = this

        const leftValue = left.execute(scope, callFrame)
        const rightValue = right.execute(scope, callFrame)

        return operator.call(leftValue, rightValue)
    }
}

export class ValueGroup extends Evaluable {
    value: Evaluable

    constructor(props: { value: Evaluable }) {
        super()
        this.value = props.value
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }
}
