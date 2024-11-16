import { FunctionTemplate } from '../../../../type/function-template.ts'
import { Expression, Identifier, Node } from '../../../../node/base.ts'
import { DeclareFunction } from '../../../../node/function.ts'
import { Block } from '../../../../node/block.ts'
import { EOL } from '../../../../node/misc.ts'
import { FunctionDeclareRulePreset } from './type.ts'
import { DeclareFFI, FFIBody } from '../../../../node/ffi.ts'

export const YAKSOK_PRESET: FunctionDeclareRulePreset = {
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
    postfix: [
        {
            type: EOL,
        },
        {
            type: Block,
        },
    ],
    createFactory(template: FunctionTemplate) {
        return (matchedNodes: Node[]) => {
            const body = matchedNodes[matchedNodes.length - 1] as Block

            const mergedNode = new DeclareFunction({
                name: template.name,
                body,
            })

            mergedNode.position = matchedNodes[0].position
            return mergedNode
        }
    },
}

export const FFI_PRESET: FunctionDeclareRulePreset = {
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
    postfix: [
        {
            type: EOL,
        },
        {
            type: FFIBody,
        },
    ],
    createFactory(template: FunctionTemplate) {
        return (matchedNodes: Node[]) => {
            const bodyNode = matchedNodes[matchedNodes.length - 1] as FFIBody
            const body = bodyNode.code

            const runtimeNode = matchedNodes[2] as Identifier
            const runtime = runtimeNode.value

            const paramNames = template.pieces
                .filter((piece) => piece.type === 'value')
                .map((piece) => piece.value[0])

            const mergedNode = new DeclareFFI({
                name: template.name,
                body,
                runtime,
                paramNames,
            })

            mergedNode.position = matchedNodes[0].position
            return mergedNode
        }
    },
}
