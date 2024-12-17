import type { Scope } from '../executer/scope.ts'
import { ReturnSignal } from '../executer/signals.ts'
import { Executable } from './base.ts'

export class Return extends Executable {
    static override friendlyName = '결과'

    override execute(_scope: Scope): Promise<never> {
        throw new ReturnSignal(this.position)
    }
}
