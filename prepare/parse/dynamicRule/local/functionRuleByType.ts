import { Identifier, Expression, Node } from '../../../../node/base.ts'
import { Block } from '../../../../node/block.ts'
import { FFIBody, DeclareFFI } from '../../../../node/ffi.ts'
import { DeclareFunction } from '../../../../node/function.ts'
import { isParentheses, BRACKET_TYPE } from '../../../../util/isBracket.ts'

export type FunctionHeaderNode = Identifier | Expression
export const functionRuleByType = {
    ffi: {
        prefix: [
            {
                type: Identifier,
                value: '번역',
            },
            {
                type: Expression,
                value: '(',
            },
            {
                type: Identifier,
            },
            {
                type: Expression,
                value: ')',
            },
            {
                type: Expression,
                value: ',',
            },
        ],
        body: FFIBody,
        createFactory(functionHeader: FunctionHeaderNode[], name: string) {
            return (tokens: Node[]) => {
                const params = functionHeader
                    .filter((node, index) => {
                        const previousNode = functionHeader[index - 1]
                        const isPreviousNodeOpeningParenthesis =
                            previousNode instanceof Expression &&
                            isParentheses(previousNode) === BRACKET_TYPE.OPENING

                        return (
                            isPreviousNodeOpeningParenthesis &&
                            node instanceof Identifier
                        )
                    })
                    .map((node) => (node as Identifier).value)

                return new DeclareFFI(
                    name,
                    (tokens[tokens.length - 1] as FFIBody).code,
                    (tokens[2] as Identifier).value,
                    params,
                )
            }
        },
    },
    yaksok: {
        prefix: [
            {
                type: Identifier,
                value: '약속',
            },
            {
                type: Expression,
                value: ',',
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
