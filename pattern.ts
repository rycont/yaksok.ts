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
} from './piece/index.ts'

export interface Pattern {
    wrapper: typeof Piece<unknown>
    units: {
        type: typeof Piece<unknown>
        content?: Record<string, unknown> | string | number
        as?: string
    }[]
    config?: Record<string, unknown>
}

export const internalPatterns: Pattern[] = [
    {
        wrapper: DeclareVariablePiece,
        units: [
            {
                type: VariablePiece,
                as: 'name',
            },
            {
                type: KeywordPiece,
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
                type: KeywordPiece,
                content: '/',
            },
        ],
    },
    {
        wrapper: MultiplyOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '*',
            },
        ],
    },
    {
        wrapper: PlusOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '+',
            },
        ],
    },
    {
        wrapper: MinusOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '-',
            },
        ],
    },
    {
        wrapper: EqualOperatorPiece,
        units: [
            {
                type: KeywordPiece,
                content: '=',
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
        wrapper: ValueGroupPiece,
        units: [
            {
                type: KeywordPiece,
                content: '(',
            },
            {
                type: EvaluatablePiece,
                as: 'value',
            },
            {
                type: KeywordPiece,
                content: ')',
            },
        ],
    },
]
