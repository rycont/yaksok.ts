import {
    BreakNotInLoopError,
    CannotReturnOutsideFunctionError,
} from '../errors/index.ts'
import { Block } from '../node/index.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from './callFrame.ts'
import { BreakSignal, ReturnSignal } from './signals.ts'

export function run(block: Block, scope = new Scope(), code?: string) {
    const callFrame = new CallFrame(block, undefined, code)

    try {
        block.execute(scope, callFrame)
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

    return scope
}
