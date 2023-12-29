import {
    Block,
    DeclareFFI,
    DeclareFunction,
    Expression,
    FFIBody,
    Keyword,
    StringValue,
    Variable,
} from '../../../../../node/index.ts'

export type FunctionHeaderNode = Variable | StringValue
export const functionRuleByType = {
    ffi: {
        prefix: [
            {
                type: Keyword,
                value: '번역',
            },
            {
                type: Expression,
                value: '(',
            },
            {
                type: Keyword,
                as: 'runtime',
            },
            {
                type: Expression,
                value: ')',
            },
        ],
        body: FFIBody,
        target: DeclareFFI,
    },
    yaksok: {
        prefix: [
            {
                type: Keyword,
                value: '약속',
            },
        ],
        body: Block,
        target: DeclareFunction,
    },
}
