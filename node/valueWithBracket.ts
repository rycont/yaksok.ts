import { Evaluable } from './base.ts'

export class ValueWithBracket extends Evaluable {
    constructor(public value: Evaluable) {
        super()
    }
}
