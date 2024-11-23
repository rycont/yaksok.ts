import { ListIndexMustBeGreaterThan1Error } from '../error/indexed.ts'
import { ValueType } from './base.ts'
import { IndexedValue } from './indexed.ts'

export class ListValue extends IndexedValue {
    static override friendlyName = '목록'

    constructor(entries: Map<number, ValueType>) {
        super(entries)
    }

    override getItem(index: number): ValueType {
        ListValue.assertProperIndex(index)

        return super.getItem(index)
    }

    override setItem(index: number, value: ValueType): void {
        ListValue.assertProperIndex(index)

        super.setItem(index, value)
    }

    static assertProperIndex(index: number): void {
        const isProperIndex = index >= 1 && Number.isSafeInteger(index)

        if (isProperIndex) {
            return
        }

        throw new ListIndexMustBeGreaterThan1Error({
            resource: {
                index,
            },
        })
    }

    override toPrint(): string {
        return `[${[...this.entries.values()]
            .map((value) => value.toPrint())
            .join(', ')}]`
    }
}
