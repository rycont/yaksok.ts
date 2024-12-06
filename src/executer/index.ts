import {
    BreakNotInLoopError,
    CannotReturnOutsideFunctionError,
} from '../error/index.ts'
import type { Executable } from '../node/base.ts'
import { Scope } from './scope.ts'
import { CallFrame } from './callFrame.ts'
import { BreakSignal, ReturnSignal } from './signals.ts'

export async function executer<NodeType extends Executable>(
    node: NodeType,
    scope = new Scope(),
): Promise<Awaited<ReturnType<NodeType['execute']>>> {
    const callFrame = new CallFrame(node, undefined)

    try {
        return (await node.execute(scope, callFrame)) as Awaited<
            ReturnType<NodeType['execute']>
        >
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
