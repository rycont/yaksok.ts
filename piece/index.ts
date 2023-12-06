import { YaksokError } from '../errors.ts'
import { Scope } from '../scope.ts'

function log(...args: unknown[]) {
    // console.log('[DEBUG]', ...args)
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

export class ExecutablePiece<ContentType> extends Piece<ContentType> {
    execute(scope: Scope): void {
        log("Error in 'execute' method")
        log(this)
        throw new Error('This ExecutablePiece has no execute method')
    }
}

export class EvaluatablePiece<
    EvaluatedType,
    InternallySavedType,
> extends ExecutablePiece<InternallySavedType> {
    execute(scope: Scope): ValuePiece<EvaluatedType> {
        log("Error in 'execute' method")
        log(this)
        throw new Error('This EvaluatablePiece has no execute method')
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

export class ValuePiece<T = string | number | boolean> extends EvaluatablePiece<
    T,
    T
> {
    constructor(content: T) {
        super(content)
        this.content = content
    }
    execute(): ValuePiece<T> {
        return this
    }
}

export class NumberPiece extends ValuePiece<number> {}
export class StringPiece extends ValuePiece<string> {}
export class BooleanPiece extends ValuePiece<boolean> {}

export class KeywordPiece extends Piece<string> {}

export class OperatorPiece extends Piece<string> {
    call(left: ValuePiece, right: ValuePiece): ValuePiece {
        throw new Error('This OperatorPiece has no calc method')
    }
}

export class PlusOperatorPiece extends OperatorPiece {
    constructor() {
        super('+')
    }
    call(left: ValuePiece, right: ValuePiece) {
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.content + right.content)
        }

        if (left instanceof StringPiece && right instanceof StringPiece) {
            return new StringPiece(left.content + right.content)
        }

        if (left instanceof StringPiece) {
            return new StringPiece(left.content + right.content.toString())
        }

        if (right instanceof StringPiece) {
            return new StringPiece(left.content.toString() + right.content)
        }

        throw new YaksokError('INVALID_TYPE_FOR_PLUS_OPERATOR')
    }
}

export class MinusOperatorPiece extends OperatorPiece {
    constructor() {
        super('-')
    }
    call(left: ValuePiece, right: ValuePiece) {
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.content - right.content)
        }

        throw new YaksokError('INVALID_TYPE_FOR_MINUS_OPERATOR')
    }
}

export class MultiplyOperatorPiece extends OperatorPiece {
    constructor() {
        super('*')
    }
    call(left: ValuePiece, right: ValuePiece) {
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.content * right.content)
        }

        if (left instanceof StringPiece && right instanceof NumberPiece) {
            return new StringPiece(left.content.repeat(right.content))
        }

        throw new YaksokError('INVALID_TYPE_FOR_MULTIPLY_OPERATOR')
    }
}

export class DivideOperatorPiece extends OperatorPiece {
    constructor() {
        super('/')
    }

    call(left: ValuePiece, right: ValuePiece) {
        if (left instanceof NumberPiece && right instanceof NumberPiece) {
            return new NumberPiece(left.content / right.content)
        }

        throw new YaksokError('INVALID_TYPE_FOR_DIVIDE_OPERATOR')
    }
}

export class EqualOperatorPiece extends OperatorPiece {
    constructor() {
        super('=')
    }

    call(left: ValuePiece, right: ValuePiece) {
        return new ValuePiece(left.content === right.content)
    }
}

interface CalculationPieceContent {
    left: EvaluatablePiece<number, number>
    right: EvaluatablePiece<number, number>
    operator: OperatorPiece
}

export class CalculationPiece extends EvaluatablePiece<
    number | string | boolean,
    CalculationPieceContent
> {
    constructor(props: CalculationPieceContent) {
        super(props)
    }
    execute(scope) {
        const { left, right, operator } = this.content
        log(left)
        const leftValue = left.execute(scope)
        const rightValue = right.execute(scope)

        return operator.call(leftValue, rightValue)
    }
}

interface DeclareVariablePieceContent<T extends string | number> {
    name: VariablePiece
    content: EvaluatablePiece<T, T>
}

export class DeclareVariablePiece<
    T extends string | number,
> extends EvaluatablePiece<T, DeclareVariablePieceContent<T>> {
    constructor(content: DeclareVariablePieceContent<T>) {
        super(content)
    }
    execute(scope: Scope): ValuePiece<T> {
        const { name, content } = this.content
        const value = content.execute(scope)

        scope.setVariable(name.content.name.content, value)
        return value
    }
}

export class PlaceholderPiece extends Piece<null> {}

export class BlockPiece extends ExecutablePiece<Piece<unknown>[]> {
    async execute(scope: Scope, tries = 0) {
        for (let i = 0; i < this.content.length; i++) {
            const piece = this.content[i]
            if (piece instanceof ExecutablePiece) {
                await piece.execute(scope)
            } else if (piece instanceof EOLPiece) {
                continue
            } else {
                log(piece)
                throw new YaksokError(
                    'CANNOT_PARSE',
                    {},
                    {
                        piece: JSON.stringify(piece),
                    },
                )
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

        if (condition.execute(scope).content) {
            body.execute(scope)
        }
    }
}

export class PrintPiece extends ExecutablePiece<{
    expression: EvaluatablePiece<unknown, unknown>
}> {
    execute(scope: Scope) {
        log('내용', this.content.expression)
        log('결과', this.content.expression.execute(scope))
        console.log('STDOUT', this.content.expression.execute(scope).content)
    }
}

export class VariablePiece extends EvaluatablePiece<
    string | number | boolean,
    {
        name: KeywordPiece
    }
> {
    execute(scope: Scope) {
        return scope.getVariable(this.content.name.content)
    }
}
