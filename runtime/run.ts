import {
    BreakNotInLoopError,
    CannotReturnOutsideFunctionError,
} from '../error/index.ts'
import { Evaluable } from '../node/base.ts'
import { Block } from '../node/index.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from './callFrame.ts'
import { BreakSignal, ReturnSignal } from './signals.ts'

export function run(block: Block, scope = new Scope()) {
    const callFrame = new CallFrame(block, undefined)

    try {
        return block.execute(scope, callFrame)
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

export function evaluate(node: Evaluable, scope = new Scope()) {
    const callFrame = new CallFrame(node, undefined)
    try {
        return node.execute(scope, callFrame)
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
