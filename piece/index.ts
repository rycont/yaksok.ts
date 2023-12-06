export class Scope {
    variables: Record<string, ValuePiece> = {}

    setVariable(name: string, value: ValuePiece) {
        this.variables[name] = value
    }

    getVariable<VariableType extends ValuePiece>(name: string) {
        return this.variables[name] as VariableType
    }
}

export class Piece<JSType> {
    content: JSType

    constructor(value: JSType) {
        this.content = value
    }

    toJSON() {
        return {
            type: this.constructor.name,
            content: this.content,
        }
    }
}

export class EvaluatablePiece<
    EvaluatedType,
    InternallySavedType,
> extends Piece<InternallySavedType> {
    evaluate(scope: Scope): ValuePiece<EvaluatedType> {
        throw new Error('This EvaluatablePiece has no evaluate method')
    }
}

export class EOLPiece extends Piece<'\n'> {
    constructor() {
        super('\n')
    }
}

export class IndentPiece extends Piece<number> {
    constructor(size: number) {
        super(size)
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

export class PlusOperatorPiece extends OperatorPiece {
    constructor() {
        super('+')
    }
}

export class MinusOperatorPiece extends OperatorPiece {
    constructor() {
        super('-')
    }
}

export class MultiplyOperatorPiece extends OperatorPiece {
    constructor() {
        super('*')
    }
}

export class DivideOperatorPiece extends OperatorPiece {
    constructor() {
        super('/')
    }
}

interface CalculationPieceContent {
    left: ValuePiece<number>
    right: ValuePiece<number>
    operator: OperatorPiece
}

export class CalculationPiece extends EvaluatablePiece<
    number,
    CalculationPieceContent
> {
    constructor(props: CalculationPieceContent) {
        super(props)
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

interface DeclareVariablePieceContent<T extends string | number> {
    name: string
    content: ValuePiece<T>
}

export class DeclareVariablePiece<
    T extends string | number,
> extends EvaluatablePiece<T, DeclareVariablePieceContent<T>> {
    constructor(content: DeclareVariablePieceContent<T>) {
        super(content)
    }
    evaluate(scope: Scope): ValuePiece<T> {
        const { name, content } = this.content
        scope.setVariable(name, content)
        return content
    }
}

export abstract class ExecutablePiece<ContentType> extends Piece<ContentType> {
    abstract execute(scope: Scope): void
}

export class BlockPiece extends ExecutablePiece<Piece<unknown>[]> {
    async execute(scope: Scope) {
        for (const piece of this.content) {
            if ('execute' in piece && typeof piece.execute === 'function')
                await piece.execute(scope)
            else {
                throw new Error('Hey..')
            }
        }
    }
}

interface ConditionPieceContent {
    condition: EvaluatablePiece<boolean, boolean>
    body: BlockPiece
}

export class ConditionPiece extends ExecutablePiece<ConditionPieceContent> {
    execute(scope: Scope) {
        const { condition, body } = this.content

        if (condition.evaluate(scope).content) {
            body.execute(scope)
        }
    }
}

export class PrintPiece extends ExecutablePiece<{
    expression: EvaluatablePiece<unknown, unknown>
}> {
    execute(scope: Scope) {
        console.log('STDOUT', this.content.expression.evaluate(scope).content)
    }
}
