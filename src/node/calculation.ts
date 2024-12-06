import { CallFrame } from '../executer/callFrame.ts'
import type { Scope } from '../executer/scope.ts'
import {
    AndOperator,
    DivideOperator,
    EqualOperator,
    GreaterThanOperator,
    GreaterThanOrEqualOperator,
    IntegerDivideOperator,
    LessThanOperator,
    LessThanOrEqualOperator,
    MinusOperator,
    ModularOperator,
    MultiplyOperator,
    OrOperator,
    PlusOperator,
    PowerOperator,
} from './operator.ts'
import { Evaluable, Operator, type ValueTypes } from './base.ts'
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
    static override friendlyName = '괄호로 묶인 값'

    constructor(public value: Evaluable) {
        super()
    }

    override execute(scope: Scope, _callFrame: CallFrame): Promise<ValueTypes> {
        const callFrame = new CallFrame(this, _callFrame)
        return this.value.execute(scope, callFrame)
    }

    override toPrint(): string {
        return '(' + this.value.toPrint() + ')'
    }
}

export class Formula extends Evaluable {
    static override friendlyName = '계산식'

    constructor(public terms: (Evaluable | Operator)[]) {
        super()
    }

    override async execute(
        scope: Scope,
        _callFrame: CallFrame,
    ): Promise<ValueTypes> {
        const callFrame = new CallFrame(this, _callFrame)
        const terms = [...this.terms]

        for (
            let currentPrecedence = OPERATOR_PRECEDENCES.length - 1;
            currentPrecedence >= 0;
            currentPrecedence--
        ) {
            await this.calculateOperatorWithPrecedence(
                terms,
                currentPrecedence,
                scope,
                callFrame,
            )
        }

        return terms[0] as ValueTypes
    }

    async calculateOperatorWithPrecedence(
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

            const left = await leftTerm.execute(scope, callFrame)
            const right = await rightTerm.execute(scope, callFrame)

            const result = term.call(left, right)
            terms.splice(i - 1, 3, result)

            i--
        }
    }

    override toPrint(): string {
        return this.terms.map((term) => term.toPrint()).join(' ')
    }
}
