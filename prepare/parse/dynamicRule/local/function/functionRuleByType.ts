import {
    Block,
    DeclareFFI,
    DeclareFunction,
    Expression,
    FFIBody,
    Keyword,
    Node,
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
            },
            {
                type: Expression,
                value: ')',
            },
        ],
        body: FFIBody,
        createFactory(functionHeader: FunctionHeaderNode[], name: string) {
            return (tokens: Node[]) => {
                const params = functionHeader
                    .filter((node) => node instanceof Variable)
                    .map((node) => (node as Variable).name)

                return new DeclareFFI(
                    name,
                    (tokens[tokens.length - 1] as FFIBody).code,
                    (tokens[2] as Keyword).value,
                    params,
                )
            }
        },
    },
    yaksok: {
        prefix: [
            {
                type: Keyword,
                value: '약속',
            },
        ],
        body: Block,
        createFactory:
            (_functionHeader: FunctionHeaderNode[], name: string) =>
            (tokens: Node[]) =>
                new DeclareFunction({
                    name,
                    body: tokens[tokens.length - 1] as Block,
                }),
    },
}
