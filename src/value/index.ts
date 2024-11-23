export class ValueType {
    static friendlyName = '값'

    toString(): string {
        return `${
            (this.constructor as typeof ValueType).friendlyName
        } (${JSON.stringify(this)})`
    }
}

export class PrimitiveValue<T> extends ValueType {
    constructor(public value: T) {
        super()
    }
}

export class ObjectValue extends ValueType {
    static override friendlyName = '객체'

    override toString(): string {
        return JSON.stringify(this)
    }
}
