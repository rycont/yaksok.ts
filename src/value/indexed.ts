import { ValueType } from './base.ts'

export class IndexedValue extends ValueType {
    static override friendlyName = '색인값'

    constructor(public index: ValueType, public value: ValueType) {
        super()
    }

    override toPrint() {
        return `${this.index.toPrint()}의 값 ${this.value.toPrint()}`
    }
}
