import { assertEquals, assertIsError, unreachable } from 'assert'

import {
    EvaluatablePiece,
    ExecutablePiece,
    NumberPiece,
    OperatorPiece,
} from '../piece/index.ts'
import { CallFrame, Scope } from '../scope.ts'

Deno.test('Basement Nodes are not executable', async (context) => {
    await context.step('ExecutablePiece', () => {
        try {
            const node = new ExecutablePiece()
            node.execute(new Scope(), new CallFrame(node))
            unreachable()
        } catch (error) {
            assertIsError(error)
            assertEquals(error.message, 'ExecutablePiece has no execute method')
        }
    })

    await context.step('EvaluatablePiece', () => {
        try {
            const node = new EvaluatablePiece()
            node.execute(new Scope(), new CallFrame(node))
            unreachable()
        } catch (error) {
            assertIsError(error)
            assertEquals(
                error.message,
                'EvaluatablePiece has no execute method',
            )
        }
    })
})

Deno.test('Basement Nodes are not printable', async (context) => {
    await context.step('ExecutablePiece', () => {
        try {
            const node = new ExecutablePiece()
            node.toPrint()
            unreachable()
        } catch (error) {
            assertIsError(error)
            assertEquals(error.message, 'ExecutablePiece has no toPrint method')
        }
    })

    await context.step('EvaluatablePiece', () => {
        try {
            const node = new EvaluatablePiece()
            node.toPrint()
            unreachable()
        } catch (error) {
            assertIsError(error)
            assertEquals(
                error.message,
                'EvaluatablePiece has no toPrint method',
            )
        }
    })
})

Deno.test('Operator base class has no implemented calc method', () => {
    try {
        const node = new OperatorPiece()
        node.call(new NumberPiece(1), new NumberPiece(2))
        unreachable()
    } catch (error) {
        assertIsError(error)
        assertEquals(error.message, 'OperatorPiece has no call method')
    }
})
