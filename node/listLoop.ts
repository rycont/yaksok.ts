import {
    ListNotEvaluatedError,
    NotEnumerableValueForListLoopError,
} from '../errors.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { BreakSignal } from '../runtime/signals.ts'
import { Evaluable, Executable } from './base.ts'
import { Block } from './block.ts'
import { List } from './list.ts'
import { Variable } from './variable.ts'

export class ListLoop extends Executable {
    list: Evaluable
    name: Variable
    body: Block

    constructor(props: { list: Evaluable; name: Variable; body: Block }) {
        super()

        this.list = props.list
        this.name = props.name
        this.body = props.body
    }

    execute(_scope: Scope, _callFrame: CallFrame): void {
        const scope = new Scope(_scope)
        const callFrame = new CallFrame(this, _callFrame)

        const list = this.list.execute(scope, callFrame)

        if (!(list instanceof List)) {
            throw new NotEnumerableValueForListLoopError({
                callFrame,
                resource: {
                    value: list,
                },
                position: this.position,
            })
        }

        if (!list.items) {
            throw new ListNotEvaluatedError({
                position: this.position,
            })
        }

        try {
            for (const value of list.items) {
                const evaluatedValue = value.execute(scope, callFrame)
                scope.setVariable(this.name.name, evaluatedValue)

                this.body.execute(scope, callFrame)
            }
        } catch (e) {
            if (!(e instanceof BreakSignal)) throw e
        }
    }
}
