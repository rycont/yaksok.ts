import {
    assert,
    assertEquals,
    assertExists,
    assertIsError,
    unreachable,
} from 'assert'
import { Scope } from '../runtime/scope.ts'
import {
    BlockPiece,
    EvaluatablePiece,
    FunctionDeclarationPiece,
    FunctionInvokePiece,
    KeywordPiece,
    NumberPiece,
} from '../piece/index.ts'
import { YaksokError } from '../errors.ts'
import { DeclareVariablePiece, VariablePiece } from '../piece/variable.ts'
import { CallFrame } from '../runtime/callFrame.ts'

Deno.test('Create Scope', () => {
    const scope = new Scope()
    assertExists(scope)
    assert(scope instanceof Scope)
})

Deno.test('Set / Get Variable', async (context) => {
    const scope = new Scope()

    await context.step('Set Variable', () => {
        scope.setVariable('a', new NumberPiece(1))
        assert('a' in scope.variables)
    })

    await context.step('Get Variable', () => {
        assertEquals(scope.getVariable('a'), new NumberPiece(1))
    })
})

Deno.test('Create Scope from Parent', () => {
    const scope = new Scope()
    const childScope = new Scope(scope)
    const grandChildScope = new Scope(childScope)

    assert(scope.parent === undefined)
    assert(childScope.parent === scope)
    assert(grandChildScope.parent === childScope)

    assert(grandChildScope.parent.parent === scope)
    assert(grandChildScope.parent.parent.parent === undefined)
})

Deno.test('Set / Get Variable from Parent', async (context) => {
    const scope = new Scope()
    const childScope = new Scope(scope)

    await context.step('Create Variable of Parent', () => {
        scope.setVariable('a', new NumberPiece(1))
        assert('a' in scope.variables)
    })

    await context.step('Set Variable of Parent', () => {
        assertEquals(childScope.getVariable('a'), new NumberPiece(1))

        childScope.setVariable('a', new NumberPiece(2))

        assert(!('a' in childScope.variables))
        assertEquals(childScope.getVariable('a'), new NumberPiece(2))
        assertEquals(scope.getVariable('a'), new NumberPiece(2))
    })
})

Deno.test('Set / Get Variable from Grandparent', async (context) => {
    const scope = new Scope()
    const childScope = new Scope(scope)
    const grandChildScope = new Scope(childScope)

    await context.step('Create Variable of Parent', () => {
        scope.setVariable('a', new NumberPiece(1))
        assert('a' in scope.variables)
    })

    await context.step('Set Variable of Parent', () => {
        assertEquals(grandChildScope.getVariable('a'), new NumberPiece(1))

        grandChildScope.setVariable('a', new NumberPiece(2))

        assert(!('a' in grandChildScope.variables))
        assert(!('a' in childScope.variables))
        assert('a' in scope.variables)

        assertEquals(grandChildScope.getVariable('a'), new NumberPiece(2))
        assertEquals(childScope.getVariable('a'), new NumberPiece(2))
        assertEquals(scope.getVariable('a'), new NumberPiece(2))
    })

    await context.step('Set not defined variable', () => {
        grandChildScope.setVariable('b', new NumberPiece(3))

        assert('b' in grandChildScope.variables)
        assert(!('b' in childScope.variables))
        assert(!('b' in scope.variables))

        assertEquals(grandChildScope.getVariable('b'), new NumberPiece(3))
    })
})

Deno.test('Get not defined variable', () => {
    const scope = new Scope()

    try {
        scope.getVariable('a')
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'NOT_DEFINED_VARIABLE')
        assertEquals(e.resource.name, 'a')
    }
})

Deno.test('Set / Invoke Function', async (context) => {
    const testFunction = new FunctionDeclarationPiece({
        name: '주문하기',
        body: new BlockPiece([
            new DeclareVariablePiece({
                name: new VariablePiece({
                    name: new KeywordPiece('나이'),
                }),
                value: new NumberPiece(20),
            }),
            new DeclareVariablePiece({
                name: new VariablePiece({
                    name: new KeywordPiece('결과'),
                }),
                value: new NumberPiece(10),
            }),
        ]),
    })

    const functionInvokation = new FunctionInvokePiece({
        name: '주문하기',
    } as Record<string, EvaluatablePiece> & { name: string })

    const scope = new Scope()

    await context.step('Create Function', () => {
        testFunction.execute(scope)

        assert('주문하기' in scope.functions)
        assertEquals(scope.getFunction('주문하기'), testFunction)
    })

    await context.step('Invoke Function', () => {
        const returnValue = functionInvokation.execute(
            scope,
            new CallFrame(functionInvokation),
        )

        assert(!('나이' in scope.variables))
        assertEquals(returnValue, new NumberPiece(10))
    })

    const childScope = new Scope(scope)

    await context.step('Invoke Function from Child Scope', () => {
        const returnValue = functionInvokation.execute(
            childScope,
            new CallFrame(functionInvokation),
        )

        assert(!('나이' in childScope.variables))
        assertEquals(returnValue, new NumberPiece(10))
    })
})

Deno.test('Get Not Defined Function', () => {
    const scope = new Scope()

    try {
        scope.getFunction('주문하기')
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'NOT_DEFINED_FUNCTION')
    }
})

Deno.test('Invoke Not Defined Function', () => {
    const functionInvokation = new FunctionInvokePiece({
        name: '주문하기',
    } as Record<string, EvaluatablePiece> & { name: string })

    const scope = new Scope()

    try {
        functionInvokation.execute(scope, new CallFrame(functionInvokation))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'NOT_DEFINED_FUNCTION')
    }
})

Deno.test('Block Return Outside Of Function', async (context) => {
    const block = new BlockPiece([
        new DeclareVariablePiece({
            name: new VariablePiece({
                name: new KeywordPiece('결과'),
            }),
            value: new NumberPiece(1),
        }),
    ])

    const scope = new Scope()

    try {
        block.execute(scope, new CallFrame(block))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'CANNOT_RETURN_OUTSIDE_FUNCTION')
    }
})

Deno.test('Block Return Outside Of Function', async (context) => {
    const block = new BlockPiece([
        new DeclareVariablePiece({
            name: new VariablePiece({
                name: new KeywordPiece('결과'),
            }),
            value: new NumberPiece(1),
        }),
    ])

    const scope = new Scope()

    try {
        block.execute(scope, new CallFrame(block))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'CANNOT_RETURN_OUTSIDE_FUNCTION')
    }
})

Deno.test('Get Not Registered Event', async (context) => {
    const block = new BlockPiece([
        new DeclareVariablePiece({
            name: new VariablePiece({
                name: new KeywordPiece('결과'),
            }),
            value: new NumberPiece(1),
        }),
    ])

    const scope = new CallFrame(block)

    try {
        scope.invokeEvent('close')
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'EVENT_NOT_FOUND')
    }
})
