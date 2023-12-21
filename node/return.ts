import { Scope } from '../runtime/scope.ts'
import { RETURN } from '../runtime/signals.ts'
import { Executable } from './base.ts'

export class Return extends Executable {
    execute(_scope: Scope) {
        throw RETURN
    }
}
