import { CallFrame } from '../runtime/callFrame.ts'
import type { Scope } from '../runtime/scope.ts'
import {
    AndOperator,
    DivideOperator,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    LessThanOperator,
    LessThanOrEqualOperator,
    MinusOperator,
    MultiplyOperator,
    OrOperator,
    PlusOperator,
} from './operator.ts'
import { Evaluable, Operator, type ValueTypes } from './base.ts'
import {
    EqualOperator,
    IntegerDivideOperator,
    ModularOperator,
    PowerOperator,
} from './index.ts'
import { RangeOperator } from './list.ts'

const OPERATOR_PRECEDENCES: Array<(typeof Operator)[]> = [
    [AndOperator, OrOperator],
    [
        EqualOperator,
        LessThanOperator,
        GreaterThanOperator,
        LessThanOrEqualOperator,
        GreaterThanOrEqualOperator,
        RangeOperator,
    ],
    [MinusOperator, PlusOperator],
    [MultiplyOperator, DivideOperator, ModularOperator, IntegerDivideOperator],
    [PowerOperator],
]

export class ValueWithParenthesis extends Evaluable {
    constructor(public value: Evaluable) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame) {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }

    override toPrint() {
        return '(' + this.value.toPrint() + ')'
    }
}

export class Formula extends Evaluable {
    constructor(public terms: (Evaluable | Operator)[]) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame): ValueTypes {
        const callFrame = new CallFrame(this, _callFrame)
        const terms = [...this.terms]

        for (
            let currentPrecedence = OPERATOR_PRECEDENCES.length - 1;
            currentPrecedence >= 0;
            currentPrecedence--
        ) {
            this.calculateOperatorWithPrecedence(
                terms,
                currentPrecedence,
                scope,
                callFrame,
            )
        }

        return terms[0] as ValueTypes
    }

    calculateOperatorWithPrecedence(
        terms: (Evaluable | Operator)[],
        precedence: number,
        scope: Scope,
        callFrame: CallFrame,
    ) {
        const currentOperators = OPERATOR_PRECEDENCES[precedence]

        for (let i = 0; i < terms.length; i++) {
            const term = terms[i]

            const isOperator = term instanceof Operator
            const isCurrentPrecedence = currentOperators.includes(
                term.constructor as typeof Operator,
            )

            if (!isOperator || !isCurrentPrecedence) continue

            const leftTerm: Evaluable = terms[i - 1] as Evaluable
            const rightTerm: Evaluable = terms[i + 1] as Evaluable

            const left = leftTerm.execute(scope, callFrame)
            const right = rightTerm.execute(scope, callFrame)

            const result = term.call(left, right)
            terms.splice(i - 1, 3, result)

            i--
        }
    }

    override toPrint(): string {
        return this.terms.map((term) => term.toPrint()).join(' ')
    }
}
