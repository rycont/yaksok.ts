import { PrimitiveValue } from './index.ts'

export class StringValue extends PrimitiveValue<string> {
    static override friendlyName = '문자'

    override toString() {
        return `"${this.value}"`
    }
}

export class NumberValue extends PrimitiveValue<number> {
    static override friendlyName = '숫자'

    override toString() {
        return this.value.toString()
    }
}
