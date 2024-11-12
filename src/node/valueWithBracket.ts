import { Evaluable } from './base.ts'

export class ValueWithBracket extends Evaluable {
    static override friendlyName = '괄호에 묶인 값'
    constructor(public value: Evaluable) {
        super()
    }
}
