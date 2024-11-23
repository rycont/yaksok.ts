import { ObjectValue, ValueType } from './index.ts'

import type { CodeFile } from '../type/code-file.ts'
import type { RunnableObject } from './function.ts'

export class FFIObject extends ObjectValue implements RunnableObject {
    static override friendlyName = '번역'

    constructor(
        public name: string,
        private code: string,
        private runtime: string,
        private delcaredIn?: CodeFile,
    ) {
        super()
    }

    run(args: Record<string, ValueType>): ValueType {
        const result = this.delcaredIn!.runtime!.runFFI(
            this.runtime,
            this.code,
            args,
        )

        return result
    }
}
