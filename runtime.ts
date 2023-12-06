import { BlockPiece } from './piece/index.ts'
import { Scope } from './scope.ts'

export function run(program: BlockPiece) {
    const scope = new Scope(program)
    program.execute(scope)
}
