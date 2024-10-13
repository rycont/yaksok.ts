import { Evaluable, Executable, ValueTypes } from './base.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

export class Mention extends Executable {
    constructor(public value: string) {
        super()
    }

    override toPrint(): string {
        return '@' + this.value
    }
}

export class MentionScope extends Evaluable {
    constructor(public fileName: string, public child: Evaluable) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        this.setChildPosition()

        const scope = _scope.createChild()
        const runner = _scope.runtime!.runOnce(this.fileName)
        const moduleScope = runner.scope

        moduleScope.parent = scope

        const result = runner.evaluateFromExtern(this.child)

        moduleScope.parent = undefined

        return result
    }

    override toPrint(): string {
        return '@' + this.fileName + ' ' + this.child.toPrint()
    }

    private setChildPosition() {
        if (!this.position) return

        this.child.position = {
            line: this.position.line,
            column: this.position.column + 1 + this.fileName.length,
        }
    }
}
