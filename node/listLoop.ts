import {
    ListNotEvaluatedError,
    NotEnumerableValueForListLoopError,
} from '../error/index.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { BreakSignal } from '../runtime/signals.ts'
import { Evaluable, Executable } from './base.ts'
import { Block } from './block.ts'
import { List } from './list.ts'

export class ListLoop extends Executable {
    constructor(
        public list: Evaluable,
        public variableName: string,
        public body: Block,
    ) {
        super()
    }

    execute(_scope: Scope, _callFrame: CallFrame): void {
        const scope = new Scope({
            parent: _scope,
        })
        const callFrame = new CallFrame(this, _callFrame)

        const list = this.list.execute(scope, callFrame)

        if (!(list instanceof List)) {
            throw new NotEnumerableValueForListLoopError({
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
                scope.setVariable(this.variableName, evaluatedValue)

                this.body.execute(scope, callFrame)
            }
        } catch (e) {
            if (!(e instanceof BreakSignal)) throw e
        }
    }
}
