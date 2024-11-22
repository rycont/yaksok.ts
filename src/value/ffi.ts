import type { CodeFile } from '../type/code-file.ts'
import type { RunnableObject } from './function.ts'
import type { ValueTypes } from '../node/base.ts'

export class FFIObject implements RunnableObject {
    constructor(
        public name: string,
        private code: string,
        private runtime: string,
        private delcaredIn?: CodeFile,
    ) {}

    run(args: Record<string, ValueTypes>): ValueTypes {
        const result = this.delcaredIn!.runtime!.runFFI(
            this.runtime,
            this.code,
            args,
        )

        return result
    }
}
