import { Position } from '../node/base.ts'
import { YaksokError } from './common.ts'

export class BreakNotInLoopError extends YaksokError {
    constructor(props: { position?: Position }) {
        super(props)
        this.message = `"반복 그만"은 반복문 안에서만 사용할 수 있어요.`
    }
}
