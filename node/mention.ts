import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'
import { Executable, Keyword } from './base.ts'

export class Mention extends Executable {
    name: string

    constructor(props: { name: Keyword }) {
        super()
        this.name = props.name.value
    }
    execute(_scope: Scope, _callFrame: CallFrame) {
        throw new Error('Method not implemented.')
    }
}
