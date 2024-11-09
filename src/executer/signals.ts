import type { Position } from '../node/index.ts'

export class Signal {
    constructor(public position?: Position) {}
}

export class ReturnSignal extends Signal {}
export class BreakSignal extends Signal {}
