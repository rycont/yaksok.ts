import { ExecutablePiece } from './basement.ts'

export class CommentPiece extends ExecutablePiece {
    value: string

    constructor(value: string) {
        super()
        this.value = value
    }

    execute() {}
}
