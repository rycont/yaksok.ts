export class Scope {
    variables: Record<string, ValuePiece> = {}

    setVariable(name: string, value: ValuePiece) {
        this.variables[name] = value
    }

    getVariable<VariableType extends ValuePiece>(name: string) {
        return this.variables[name] as VariableType
    }
}

export abstract class Piece<JSType> {
    content: JSType

    constructor(value: JSType) {
        this.content = value
    }
}

export abstract class EvaluatablePiece<
    EvaluatedType,
    InternallySavedType,
> extends Piece<InternallySavedType> {
    abstract evaluate(scope: Scope): ValuePiece<EvaluatedType>
}

export class EOLPiece extends Piece<'\n'> {
    constructor() {
        super('\n')
    }
}

export class ValuePiece<T = string | number> extends EvaluatablePiece<T, T> {
    constructor(content: T) {
        super(content)
        this.content = content
    }
    evaluate(): ValuePiece<T> {
        return this
    }
}

export class NumberPiece extends ValuePiece<number> {}
export class StringPiece extends ValuePiece<string> {}
export class KeywordPiece extends Piece<string> {}
export class OperatorPiece extends Piece<string> {}

export class CalculationPiece extends EvaluatablePiece<
    number,
    {
        left: ValuePiece<number>
        right: ValuePiece<number>
        operator: OperatorPiece
    }
> {
    constructor(
        left: ValuePiece<number>,
        right: ValuePiece<number>,
        operator: OperatorPiece,
    ) {
        super({
            left,
            right,
            operator,
        })

        this.content = {
            left,
            right,
            operator,
        }
    }
    evaluate() {
        const { left, right, operator } = this.content
        const leftValue = left.evaluate().content
        const rightValue = right.evaluate().content
        const operatorValue = operator.content

        switch (operatorValue) {
            case '+':
                return new NumberPiece(leftValue + rightValue)
            case '-':
                return new NumberPiece(leftValue - rightValue)
            case '*':
                return new NumberPiece(leftValue * rightValue)
            case '/':
                return new NumberPiece(leftValue / rightValue)
            default:
                throw new Error(`Unknown operator ${operatorValue}`)
        }
    }
}

export class DeclareVariablePiece<
    T extends string | number,
> extends EvaluatablePiece<
    T,
    {
        name: string
        content: ValuePiece<T>
    }
> {
    constructor(name: string, content: ValuePiece<T>) {
        super({
            name,
            content,
        })
    }
    evaluate(scope: Scope): ValuePiece<T> {
        const { name, content } = this.content
        scope.setVariable(name, content)
        return content
    }
}
