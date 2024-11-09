import type { Scope } from '../executer/scope.ts'
import { ReturnSignal } from '../executer/signals.ts'
import { Executable } from './base.ts'

export class Return extends Executable {
    override execute(_scope: Scope) {
        throw new ReturnSignal(this.position)
    }
}
