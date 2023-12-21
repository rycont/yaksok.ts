import { YaksokError } from '../errors.ts'
import { Block } from '../node/index.ts'
import { Scope } from '../runtime/scope.ts'
import { BREAK, RETURN } from './signals.ts'

export function run(block: Block, scope = new Scope()) {
    try {
        block.execute(scope)
    } catch (e) {
        switch (e) {
            case RETURN:
                throw new YaksokError('CANNOT_RETURN_OUTSIDE_FUNCTION')
            case BREAK:
                throw new YaksokError('BREAK_NOT_IN_LOOP')
        }

        throw e
    }

    return scope
}
