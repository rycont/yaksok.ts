import { YaksokError } from '../errors.ts'
import { Block } from '../node/index.ts'
import { Scope } from '../runtime/scope.ts'
import { RETURN } from './signals.ts'

export function run(block: Block, scope = new Scope()) {
    try {
        block.execute(scope)
    } catch (e) {
        if (e === RETURN) {
            throw new YaksokError('CANNOT_RETURN_OUTSIDE_FUNCTION')
        }

        throw e
    }

    return scope
}
