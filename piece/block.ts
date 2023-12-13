import { ExecutablePiece, Piece } from './index.ts'
import { YaksokError } from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { EOLPiece } from './misc.ts'

export class BlockPiece extends ExecutablePiece {
    content: Piece[]

    constructor(content: Piece[]) {
        super()
        this.content = content
    }

    execute(scope: Scope, _callFrame?: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (let i = 0; i < this.content.length; i++) {
            const piece = this.content[i]
            if (piece instanceof ExecutablePiece) {
                piece.execute(scope, callFrame)
            } else if (piece instanceof EOLPiece) {
                continue
            } else {
                throw new YaksokError(
                    'CANNOT_PARSE',
                    {},
                    {
                        piece: JSON.stringify(piece),
                    },
                )
            }
        }
    }
}
