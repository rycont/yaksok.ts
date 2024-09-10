import { Node, Evaluable } from './base.ts'

export class ValueWithBracket extends Node {
    constructor(public value: Evaluable) {
        super()
    }
}
