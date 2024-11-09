import { Evaluable, Executable, type ValueTypes } from './base.ts'
import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import { ErrorInModuleError } from '../error/index.ts'

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

        try {
            const runner = _scope.runtime!.runOnce(this.fileName)
            const moduleScope = runner.scope

            moduleScope.parent = scope

            const result = runner.evaluateFromExtern(this.child)

            moduleScope.parent = undefined

            return result
        } catch (_) {
            throw new ErrorInModuleError({
                resource: {
                    fileName: this.fileName,
                },
                position: this.position,
            })
        }
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
