import { NotEnumerableValueForListLoopError } from '../error/index.ts'
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

    override execute(_scope: Scope, _callFrame: CallFrame): void {
        const scope = new Scope({
            parent: _scope,
        })
        const callFrame = new CallFrame(this, _callFrame)

        const list = this.list.execute(scope, callFrame)

        this.assertRepeatTargetIsList(list)

        try {
            for (const value of list.items!) {
                scope.setVariable(this.variableName, value)
                this.body.execute(scope, callFrame)
            }
        } catch (e) {
            if (!(e instanceof BreakSignal)) throw e
        }
    }

    assertRepeatTargetIsList(target: Evaluable): asserts target is List {
        if (target instanceof List) return

        throw new NotEnumerableValueForListLoopError({
            resource: {
                value: target,
            },
            position: this.position,
        })
    }
}
