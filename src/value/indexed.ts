import { IndexOutOfRangeError } from '../error/indexed.ts'
import { ObjectValue, ValueType } from './base.ts'

export type IndexKeyType = string | number

export class IndexedValue extends ObjectValue {
    static override friendlyName = '사전'

    constructor(protected entries: Map<string | number, ValueType>) {
        super()
    }

    getItem(index: string | number): ValueType {
        if (!this.entries.has(index)) {
            throw new IndexOutOfRangeError({
                resource: {
                    target: (this.constructor as typeof IndexedValue)
                        .friendlyName,
                    index: index.toString(),
                },
            })
        }

        return this.entries.get(index)!
    }

    setItem(index: string | number, value: ValueType): void {
        this.entries.set(index, value)
    }
}
