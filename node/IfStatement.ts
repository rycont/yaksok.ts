import { Executable, Evaluable } from './base.ts'
import { Block } from './block.ts'

import { isTruthy } from '../runtime/internal/isTruthy.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

interface Case {
    condition?: Evaluable
    body: Block
}

export class IfStatement extends Executable {
    cases: Case[]

    constructor(
        props:
            | { condition: Evaluable; body: Block }
            | {
                  ifStatement: IfStatement
                  elseStatement: ElseStatement
              }
            | {
                  ifStatement: IfStatement
                  elseIfStatement: ElseIfStatement
              }
            | {
                  cases: Case[]
              },
    ) {
        super()

        if ('condition' in props) {
            const { condition, body } = props
            this.cases = [{ condition, body }]
        } else if ('elseStatement' in props) {
            const { ifStatement, elseStatement } = props

            const elseCase: Case = {
                body: elseStatement.body,
            }

            this.cases = [...ifStatement.cases, elseCase]
        } else if ('elseIfStatement' in props) {
            const { ifStatement, elseIfStatement } = props
            const elseIfCase: Case = elseIfStatement.elseIfCase

            this.cases = [...ifStatement.cases, elseIfCase]
        } else {
            this.cases = props.cases
        }
    }

    execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)

        for (const { condition, body } of this.cases) {
            if (!condition || isTruthy(condition.execute(scope, callFrame))) {
                body.execute(scope, callFrame)
                break
            }
        }
    }
}

export class ElseStatement extends Executable {
    body: Block

    constructor(props: { body: Block }) {
        super()
        this.body = props.body
    }
}

export class ElseIfStatement extends Executable {
    constructor(public elseIfCase: Case) {
        super()
    }
}
