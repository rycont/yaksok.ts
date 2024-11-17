import { Evaluable, Executable, type ValueTypes } from './base.ts'
import type { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import { ErrorInModuleError } from '../error/index.ts'
import type { Position } from '../type/position.ts'

export class Mention extends Executable {
    static override friendlyName = '불러올 파일 이름'

    constructor(public value: string, public override position?: Position) {
        super()
    }

    override toPrint(): string {
        return '@' + this.value
    }
}

export class MentionScope extends Evaluable {
    static override friendlyName = '불러오기'

    constructor(public fileName: string, public child: Evaluable) {
        super()
    }

    override execute(_scope: Scope, _callFrame: CallFrame): ValueTypes {
        this.setChildPosition()

        const moduleCodeFile = _scope.runtime!.getCodeFile(this.fileName)
        const { result } = moduleCodeFile.evaluate(this.child)

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
