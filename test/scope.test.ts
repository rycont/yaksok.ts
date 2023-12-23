import {
    assert,
    assertEquals,
    assertExists,
    assertIsError,
    unreachable,
} from 'assert'
import { Scope } from '../runtime/scope.ts'
import {
    Block,
    Evaluable,
    DeclareFunction,
    FunctionInvoke,
    Keyword,
    NumberValue,
} from '../node/index.ts'
import {
    NotDefinedFunctionError,
    NotDefinedVariableError,
} from '../errors/index.ts'
import { SetVariable, Variable } from '../node/variable.ts'
import { CallFrame } from '../runtime/callFrame.ts'

Deno.test('Create Scope', () => {
    const scope = new Scope()
    assertExists(scope)
    assert(scope instanceof Scope)
})

Deno.test('Set / Get Variable', async (context) => {
    const scope = new Scope()

    await context.step('Set Variable', () => {
        scope.setVariable('a', new NumberValue(1))
        assert('a' in scope.variables)
    })

    await context.step('Get Variable', () => {
        assertEquals(scope.getVariable('a'), new NumberValue(1))
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
        scope.setVariable('a', new NumberValue(1))
        assert('a' in scope.variables)
    })

    await context.step('Set Variable of Parent', () => {
        assertEquals(childScope.getVariable('a'), new NumberValue(1))

        childScope.setVariable('a', new NumberValue(2))

        assert(!('a' in childScope.variables))
        assertEquals(childScope.getVariable('a'), new NumberValue(2))
        assertEquals(scope.getVariable('a'), new NumberValue(2))
    })
})

Deno.test('Set / Get Variable from Grandparent', async (context) => {
    const scope = new Scope()
    const childScope = new Scope(scope)
    const grandChildScope = new Scope(childScope)

    await context.step('Create Variable of Parent', () => {
        scope.setVariable('a', new NumberValue(1))
        assert('a' in scope.variables)
    })

    await context.step('Set Variable of Parent', () => {
        assertEquals(grandChildScope.getVariable('a'), new NumberValue(1))

        grandChildScope.setVariable('a', new NumberValue(2))

        assert(!('a' in grandChildScope.variables))
        assert(!('a' in childScope.variables))
        assert('a' in scope.variables)

        assertEquals(grandChildScope.getVariable('a'), new NumberValue(2))
        assertEquals(childScope.getVariable('a'), new NumberValue(2))
        assertEquals(scope.getVariable('a'), new NumberValue(2))
    })

    await context.step('Set not defined variable', () => {
        grandChildScope.setVariable('b', new NumberValue(3))

        assert('b' in grandChildScope.variables)
        assert(!('b' in childScope.variables))
        assert(!('b' in scope.variables))

        assertEquals(grandChildScope.getVariable('b'), new NumberValue(3))
    })
})

Deno.test('Get not defined variable', () => {
    const scope = new Scope()

    try {
        scope.getVariable('a')
        unreachable()
    } catch (e) {
        assertIsError(e, NotDefinedVariableError)
        assertEquals(e.resource?.name, 'a')
    }
})

Deno.test('Set / Invoke Function', async (context) => {
    const testFunction = new DeclareFunction({
        name: '주문하기',
        body: new Block([
            new SetVariable({
                name: new Variable({
                    name: new Keyword('나이'),
                }),
                value: new NumberValue(20),
            }),
            new SetVariable({
                name: new Variable({
                    name: new Keyword('결과'),
                }),
                value: new NumberValue(10),
            }),
        ]),
    })

    const functionInvokation = new FunctionInvoke({
        name: '주문하기',
    } as Record<string, Evaluable> & { name: string })

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
        assertEquals(returnValue, new NumberValue(10))
    })

    const childScope = new Scope(scope)

    await context.step('Invoke Function from Child Scope', () => {
        const returnValue = functionInvokation.execute(
            childScope,
            new CallFrame(functionInvokation),
        )

        assert(!('나이' in childScope.variables))
        assertEquals(returnValue, new NumberValue(10))
    })
})

Deno.test('Get Not Defined Function', () => {
    const scope = new Scope()

    try {
        scope.getFunction('주문하기')
        unreachable()
    } catch (e) {
        assertIsError(e, NotDefinedFunctionError)
    }
})

Deno.test('Invoke Not Defined Function', () => {
    const functionInvokation = new FunctionInvoke({
        name: '주문하기',
    } as Record<string, Evaluable> & { name: string })

    const scope = new Scope()

    try {
        functionInvokation.execute(scope, new CallFrame(functionInvokation))
        unreachable()
    } catch (e) {
        assertIsError(e, NotDefinedFunctionError)
    }
})

Deno.test('Block Return Outside Of Function', () => {
    const block = new Block([
        new SetVariable({
            name: new Variable({
                name: new Keyword('결과'),
            }),
            value: new NumberValue(1),
        }),
    ])

    const scope = new Scope()

    block.execute(scope, new CallFrame(block))
    assertEquals(scope.getVariable('결과'), new NumberValue(1))
})
