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
    SequencePiece,
    ListPiece,
    IndexingPiece,
    IndexFetchPiece,
    SetToIndexPiece,
    ExpressionPiece,
    RangeOperatorPiece,
} from '../piece/index.ts'

export interface Pattern {
    wrapper: {
        new (...args: any[]): Piece
    }
    units: {
        type: {
            new (...args: any[]): Piece
        }
        value?: Record<string, unknown> | string | number
        as?: string
    }[]
    config?: Record<string, unknown>
}

export const internalPatterns: Pattern[] = [
    {
        wrapper: EqualOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '=',
            },
        ],
    },
    {
        wrapper: SequencePiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'a',
            },
            {
                type: ExpressionPiece,
                value: ',',
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
                value: '[',
            },
            {
                type: SequencePiece,
                as: 'sequence',
            },
            {
                type: ExpressionPiece,
                value: ']',
            },
        ],
    },
    {
        wrapper: ListPiece,
        units: [
            {
                type: ExpressionPiece,
                value: '[',
            },
            {
                type: ExpressionPiece,
                value: ']',
            },
        ],
    },
    {
        wrapper: IndexingPiece,
        units: [
            {
                type: ExpressionPiece,
                value: '[',
            },
            {
                type: EvaluatablePiece,
                as: 'index',
            },
            {
                type: ExpressionPiece,
                value: ']',
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
                value: ':',
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
                type: ExpressionPiece,
                value: '(',
            },
            {
                type: EvaluatablePiece,
                as: 'value',
            },
            {
                type: ExpressionPiece,
                value: ')',
            },
        ],
    },
    {
        wrapper: GreaterThanOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '>',
            },
        ],
    },
    {
        wrapper: GreaterThanOrEqualOperatorPiece,
        units: [
            {
                type: GreaterThanOperatorPiece,
            },
            {
                type: EqualOperatorPiece,
            },
        ],
    },
    {
        wrapper: LessThanOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '<',
            },
        ],
    },
    {
        wrapper: LessThanOrEqualOperatorPiece,
        units: [
            {
                type: LessThanOperatorPiece,
            },
            {
                type: EqualOperatorPiece,
            },
        ],
    },
    {
        wrapper: VariablePiece,
        units: [
            {
                type: KeywordPiece,
                value: '이전',
            },
            {
                type: VariablePiece,
                as: 'name',
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
                value: ':',
            },
            {
                type: EvaluatablePiece,
                as: 'value',
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
                value: '/',
            },
        ],
    },
    {
        wrapper: MultiplyOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '*',
            },
        ],
    },
    {
        wrapper: PlusOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '+',
            },
        ],
    },
    {
        wrapper: MinusOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '-',
            },
        ],
    },
    {
        wrapper: AndOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                value: '이고',
            },
        ],
    },
    {
        wrapper: RangeOperatorPiece,
        units: [
            {
                type: OperatorPiece,
                value: '~',
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
                value: '만약',
            },
            {
                type: EvaluatablePiece,
                as: 'condition',
            },
            {
                type: KeywordPiece,
                value: '이면',
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
        wrapper: ConditionPiece,
        units: [
            {
                type: ConditionPiece,
                as: 'ifBody',
            },
            {
                type: KeywordPiece,
                value: '아니면',
            },
            {
                type: EOLPiece,
            },
            {
                type: BlockPiece,
                as: 'elseBody',
            },
        ],
    },
    {
        wrapper: PrintPiece,
        units: [
            {
                type: EvaluatablePiece,
                as: 'value',
            },
            {
                type: KeywordPiece,
                value: '보여주기',
            },
        ],
    },
    {
        wrapper: RepeatPiece,
        units: [
            {
                type: KeywordPiece,
                value: '반복',
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
                value: '반복',
            },
            {
                type: KeywordPiece,
                value: '그만',
            },
        ],
    },
]
