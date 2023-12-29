import { Position } from './base.ts'
import { Keyword } from './index.ts'

export class FFIBody extends Keyword {
    constructor(public code: string, public position?: Position) {
        super(code, position)
    }
}
