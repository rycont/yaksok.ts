import { Evaluable, Executable, ValueTypes } from './base.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

export class Mention extends Executable {
    constructor(public value: string) {
        super()
    }

    toPrint(): string {
        return '@' + this.value
    }
}

export class MentionScope extends Evaluable {
    filename: string
    child: Evaluable

    constructor(props: { child: Evaluable; filename: string }) {
        super()

        this.filename = props.filename
        this.child = props.child
    }

    execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        if (this.position) {
            this.child.position = {
                line: this.position.line,
                column: this.position.column + 1 + this.filename.length,
            }
        }

        const scope = _scope.createChild()
        const runner = _scope.runtime!.runOnce(this.filename)
        const moduleScope = runner.scope

        moduleScope.parent = scope

        const result = runner.evaluateFromExtern(this.child)

        moduleScope.parent = undefined

        return result
    }

    toPrint(): string {
        return '@' + this.filename + ' ' + this.child.toPrint()
    }
}
