import { YaksokError } from '../errors.ts'
import { Scope } from '../scope.ts'

function log(...args: unknown[]) {
    console.log('[DEBUG]', ...args)
}

export class Piece<JSType> {
    content: JSType
    config?: Record<string, unknown>

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
        throw new Error('This ExecutablePiece has no execute method')
    }
}

export class EvaluatablePiece<
    EvaluatedType,
    InternallySavedType,
> extends ExecutablePiece<InternallySavedType> {
    execute(
        scope: Scope,
    ): Promise<ValuePiece<EvaluatedType>> | ValuePiece<EvaluatedType> {
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

export class NumberPiece extends ValuePiece<number> { }
export class StringPiece extends ValuePiece<string> { }
export class BooleanPiece extends ValuePiece<boolean> { }

export class KeywordPiece extends Piece<string> { }

export class OperatorPiece extends Piece<string> {
    call(...operands: ValuePiece[]): ValuePiece {
        throw new Error('This OperatorPiece has no calc method')
    }
}

export class PlusOperatorPiece extends OperatorPiece {
    constructor() {
        super('+')
    }
    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

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
    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
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
    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands
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

    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

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

    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        return new BooleanPiece(left.content === right.content)
    }
}

export class AndOperatorPiece extends OperatorPiece {
    constructor() {
        super('이고')
    }

    call(...operands: ValuePiece[]) {
        if (operands.length !== 2) {
            throw new YaksokError('INVALID_NUMBER_OF_OPERANDS')
        }

        const [left, right] = operands

        if (
            !(left instanceof BooleanPiece) ||
            !(right instanceof BooleanPiece)
        ) {
            throw new YaksokError('INVALID_TYPE_FOR_AND_OPERATOR')
        }

        return new BooleanPiece(left.content && right.content)
    }
}

interface BinaryCalculationPieceContent {
    left: EvaluatablePiece<number, number>
    right: EvaluatablePiece<number, number>
    operator: OperatorPiece
}

export class BinaryCalculationPiece extends EvaluatablePiece<
    number | string | boolean,
    BinaryCalculationPieceContent
> {
    constructor(props: BinaryCalculationPieceContent) {
        super(props)
    }
    async execute(scope) {
        const { left, right, operator } = this.content

        const leftValue = await left.execute(scope)
        const rightValue = await right.execute(scope)

        // console.log({ left, right })
        return operator.call(leftValue, rightValue)
    }
}

interface UnaryCalculationPieceContent {
    operand: EvaluatablePiece<number, number>
    operator: OperatorPiece
}

export class ValueGroupPiece extends EvaluatablePiece<
    unknown,
    {
        value: EvaluatablePiece<unknown, unknown>
    }
> {
    execute(scope: Scope) {
        return this.content.value.execute(scope)
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
    async execute(scope: Scope): Promise<ValuePiece<T>> {
        const { name, content } = this.content
        const value = await content.execute(scope)

        scope.setVariable.bind(scope)(name.content.name.content, value)
        return value
    }
}

export class PlaceholderPiece extends Piece<null> { }

export class ReturnPiece extends ExecutablePiece<{
    value: EvaluatablePiece<unknown, unknown>
}> {
    execute(scope: Scope) {
        return this.content.value.execute(scope)
    }
}

export class BlockPiece extends ExecutablePiece<Piece<unknown>[]> {
    async execute(scope: Scope) {
        for (let i = 0; i < this.content.length; i++) {
            const piece = this.content[i]
            if (piece instanceof ReturnPiece) {
                return await piece.execute(scope)
            }
            if (piece instanceof ExecutablePiece) {
                await piece.execute(scope)
            } else if (piece instanceof EOLPiece) {
                continue
            } else {
                // console.log(this.content)
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
    async execute(scope: Scope) {
        const { condition, body } = this.content

        if ((await condition.execute(scope)).content) {
            await body.execute(scope)
        }
    }
}

export class PrintPiece extends ExecutablePiece<{
    expression: EvaluatablePiece<unknown, unknown>
}> {
    async execute(scope: Scope) {
        console.log(
            'STDOUT',
            (await this.content.expression.execute(scope)).content,
        )
    }
}

export class VariablePiece extends EvaluatablePiece<
    string | number | boolean,
    {
        name: KeywordPiece
    }
> {
    execute(scope: Scope) {
        return scope.getVariable.bind(scope)(this.content.name.content)
    }
}

export class FunctionDeclarationPiece extends ExecutablePiece<{
    body: BlockPiece
}> {
    execute(scope: Scope) {
        const name = this.config?.name

        if (!name || typeof name !== 'string') {
            throw new YaksokError('FUNCTION_MUST_HAVE_NAME')
        }

        scope.setFunction.bind(scope)(name, this.content.body)
    }
}

export class FunctionInvokePiece extends EvaluatablePiece<
    unknown,
    {
        name: KeywordPiece
    }
> {
    async execute(scope: Scope) {
        const name = this.config?.name

        if (!name || typeof name !== 'string') {
            throw new YaksokError('FUNCTION_MUST_HAVE_NAME')
        }


        const args = {}

        for (const key in this.content) {
            const value = this.content[key]
            if (value instanceof EvaluatablePiece) {
                args[key] = await value.execute(scope)
            } else {
                throw new YaksokError('NOT_EVALUABLE_EXPRESSION', {}, { piece: JSON.stringify(value) })
            }
        }

        const result = await scope.invokeFunction(name, args)
        return result || new ValuePiece(0)
    }
}
