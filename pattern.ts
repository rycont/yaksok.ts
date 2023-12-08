import {
    Piece,
    DeclareVariablePiece,
    KeywordPiece,
    EvaluatablePiece,
    EOLPiece,
    DivideOperatorPiece,
    MultiplyOperatorPiece,
    BinaryCalculationPiece,
    OperatorPiece,
    ConditionPiece,
    BlockPiece,
    PrintPiece,
    VariablePiece,
    PlusOperatorPiece,
    MinusOperatorPiece,
    EqualOperatorPiece,
    ValueGroupPiece,
    AndOperatorPiece,
    RepeatPiece,
    GreaterThanOperatorPiece,
    GreaterThanOrEqualOperatorPiece,
    BreakPiece,
    LessThanOperatorPiece,
    LessThanOrEqualOperatorPiece,
    EvaluatableSequencePiece,
    ListPiece,
    IndexingPiece,
    IndexFetchPiece,
    SetToIndexPiece,
    ExpressionPiece,
} from './piece/index.ts'

export interface Pattern {
    wrapper: typeof Piece<unknown>
    units: {
        type: typeof Piece<unknown>
        content?: Record<string, unknown> | string | number
        as?: string
    }[]
    setMode?: string
    config?: Record<string, unknown>
}

export const internalPatterns: Pattern[] = [
    {
        wrapper: EqualOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '=',
            },
        ],
    },
    {
        wrapper: EvaluatableSequencePiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'a',
            },
            {
                type: OperatorPiece,
                content: ',',
            },
            {
                type: EvaluatablePiece,
                as: 'b',
            },
        ],
    },
    {
        wrapper: ListPiece,
        units: [
            {
                type: ExpressionPiece,
                content: '[',
            },
            {
                type: EvaluatableSequencePiece,
                as: 'content',
            },
            {
                type: ExpressionPiece,
                content: ']',
            },
        ],
    },
    {
        wrapper: IndexingPiece,
        units: [
            {
                type: ExpressionPiece,
                content: '[',
            },
            {
                type: EvaluatablePiece,
                as: 'index',
            },
            {
                type: ExpressionPiece,
                content: ']',
            },
        ],
    },
    {
        wrapper: IndexFetchPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'target',
            },
            {
                type: IndexingPiece,
                as: 'index',
            },
        ],
    },
    {
        wrapper: SetToIndexPiece,
        units: [
            {
                type: IndexFetchPiece,
                as: 'target',
            },
            {
                type: ExpressionPiece,
                content: ':',
            },
            {
                type: EvaluatablePiece,
                as: 'value',
            },
        ],
    },
    {
        wrapper: ValueGroupPiece,
        units: [
            {
                type: OperatorPiece,
                content: '(',
            },
            {
                type: EvaluatablePiece,
                as: 'value',
            },
            {
                type: OperatorPiece,
                content: ')',
            },
        ],
    },
    {
        wrapper: GreaterThanOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '>',
            },
        ],
    },
    {
        wrapper: GreaterThanOrEqualOperatorPiece,
        units: [
            {
                type: GreaterThanOperatorPiece,
                content: '>',
            },
            {
                type: EqualOperatorPiece,
                content: '=',
            },
        ],
    },
    {
        wrapper: LessThanOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '<',
            },
        ],
    },
    {
        wrapper: LessThanOrEqualOperatorPiece,
        units: [
            {
                type: LessThanOperatorPiece,
                content: '<',
            },
            {
                type: EqualOperatorPiece,
                content: '=',
            },
        ],
    },

    {
        wrapper: DeclareVariablePiece,
        units: [
            {
                type: VariablePiece,
                as: 'name',
            },
            {
                type: ExpressionPiece,
                content: ':',
            },
            {
                type: EvaluatablePiece,
                as: 'content',
            },
            {
                type: EOLPiece,
            },
        ],
    },
    {
        wrapper: DivideOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '/',
            },
        ],
    },
    {
        wrapper: MultiplyOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '*',
            },
        ],
    },
    {
        wrapper: PlusOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '+',
            },
        ],
    },
    {
        wrapper: MinusOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                content: '-',
            },
        ],
    },
    {
        wrapper: AndOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '이고',
            },
        ],
    },
    {
        wrapper: BinaryCalculationPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'left',
            },
            {
                type: OperatorPiece,
                as: 'operator',
            },
            {
                type: EvaluatablePiece,
                as: 'right',
            },
        ],
    },
    {
        wrapper: ConditionPiece,
        units: [
            {
                type: KeywordPiece,
                content: '만약',
            },
            {
                type: EvaluatablePiece,
                as: 'condition',
            },
            {
                type: KeywordPiece,
                content: '이면',
            },
            {
                type: EOLPiece,
            },
            {
                type: BlockPiece,
                as: 'body',
            },
        ],
    },
    {
        wrapper: PrintPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'expression',
            },
            {
                type: KeywordPiece,
                content: '보여주기',
            },
        ],
    },
    {
        wrapper: RepeatPiece,
        units: [
            {
                type: KeywordPiece,
                content: '반복',
            },
            {
                type: EOLPiece,
            },
            {
                type: BlockPiece,
                as: 'body',
            },
        ],
    },
    {
        wrapper: BreakPiece,
        units: [
            {
                type: KeywordPiece,
                content: '반복',
            },
            {
                type: KeywordPiece,
                content: '그만',
            },
        ],
    },
]
