import {
    BreakNotInLoopError,
    CannotReturnOutsideFunctionError,
} from '../error/index.ts'
import type { Executable } from '../node/base.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from './callFrame.ts'
import { BreakSignal, ReturnSignal } from './signals.ts'

export function run<NodeType extends Executable>(
    node: NodeType,
    scope = new Scope(),
) {
    const callFrame = new CallFrame(node, undefined)

    try {
        return node.execute(scope, callFrame) as ReturnType<NodeType['execute']>
    } catch (e) {
        if (e instanceof ReturnSignal) {
            throw new CannotReturnOutsideFunctionError({
                position: e.position,
            })
        }

        if (e instanceof BreakSignal) {
            throw new BreakNotInLoopError({
                position: e.position,
            })
        }

        throw e
    }
}
