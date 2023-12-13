import { BlockPiece } from '../piece/index.ts'
import { Scope } from '../runtime/scope.ts'

export function run(block: BlockPiece) {
    const scope = new Scope()
    block.execute(scope)

    return scope
}
