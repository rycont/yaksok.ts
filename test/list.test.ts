import { assertEquals, assertIsError, unreachable } from 'assert'

import { tokenize } from '../prepare/tokenize/index.ts'
import {
    Block,
    SetVariable,
    EOL,
    Expression,
    IndexFetch,
    Indexing,
    Keyword,
    List,
    NumberValue,
    PlusOperator,
    RangeOperator,
    Sequence,
    SetToIndex,
    Variable,
} from '../node/index.ts'
import { parse } from '../prepare/parse/index.ts'
import { run } from '../runtime/run.ts'
import {
    InvalidNumberOfOperandsError,
    ListIndexMustBeGreaterThan1Error,
    ListIndexOutOfRangeError,
    ListIndexTypeError,
    ListNotEvaluatedError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
    YaksokError,
} from '../errors.ts'
import { Scope } from '../runtime/scope.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Formula } from '../node/calculation.ts'

Deno.test('Parse list', async (context) => {
    const code = `
목록: [1, 3, 5, 7, 9]
`
    const result = tokenize(code, true)

    await context.step('Tokenize', () => {
        assertEquals(result.tokens, [
            new EOL(),
            new Keyword('목록'),
            new Expression(':'),
            new Expression('['),
            new NumberValue(1),
            new Expression(','),
            new NumberValue(3),
            new Expression(','),
            new NumberValue(5),
            new Expression(','),
            new NumberValue(7),
            new Expression(','),
            new NumberValue(9),
            new Expression(']'),
            new EOL(),
        ])
    })

    let parsed: Block

    await context.step('Parse', () => {
        parsed = parse(result)

        assertEquals(
            parsed,
            new Block([
                new EOL(),
                new SetVariable({
                    name: new Variable({
                        name: new Keyword('목록'),
                    }),
                    value: new List({
                        sequence: new Sequence({
                            a: new Sequence({
                                a: new Sequence({
                                    a: new Sequence({
                                        a: new NumberValue(1),
                                        b: new NumberValue(3),
                                    }),
                                    b: new NumberValue(5),
                                }),
                                b: new NumberValue(7),
                            }),
                            b: new NumberValue(9),
                        }),
                    }),
                }),
                new EOL(),
            ]),
        )
    })
})

Deno.test('Print list', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
목록 보여주기
`

    const _consoleLog = console.log
    let printed = ''

    console.log = (...items) => (printed += items.join(' '))

    run(parse(tokenize(code)))

    assertEquals(printed, '[1, 3, 5, 7, 9]')
    console.log = _consoleLog
})

Deno.test('Get list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
첫번째: 목록[1]
번째: 3
세번째: 목록[번째]
`

    const result = run(parse(tokenize(code, true)))

    assertEquals(result.getVariable('첫번째'), new NumberValue(1))
    assertEquals(result.getVariable('세번째'), new NumberValue(5))
})

Deno.test('Set list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
목록[1]: 2
`

    const tree = parse(tokenize(code))
    const result = run(tree)
    assertEquals(result.getVariable('목록').toPrint(), '[2, 3, 5, 7, 9]')
})

Deno.test('Get list element by indexes list', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
값: 목록[1~3]
`

    const tree = parse(tokenize(code))
    const result = run(tree)
    assertEquals(result.getVariable('값').toPrint(), '[1, 3, 5]')
})

Deno.test('Create range but start is greater than end', () => {
    const code = `
목록: 30 ~ 10
`

    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (error) {
        assertIsError(error, RangeStartMustBeLessThanEndError)
    }
})

Deno.test('Create range but operands are not number', async (context) => {
    await context.step('string string', () => {
        const code = `
목록: "a" ~ "b"
`
        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, RangeStartMustBeNumberError)
        }
    })

    await context.step('string number', () => {
        const code = `
목록: "a" ~ 1
`

        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, RangeStartMustBeNumberError)
        }
    })

    await context.step('number string', () => {
        const code = `
목록: 1 ~ "b"
`

        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, RangeEndMustBeNumberError)
        }
    })

    await context.step('number number', () => {
        const code = `
목록: 1 ~ 10
`

        const result = run(parse(tokenize(code)))
        assertEquals(
            result.getVariable('목록').toPrint(),
            '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]',
        )
    })
})

Deno.test('Create range but operands are too many', () => {
    try {
        new RangeOperator().call(
            new NumberValue(1),
            new NumberValue(10),
            new NumberValue(20),
        )
        unreachable()
    } catch (error) {
        assertIsError(error, InvalidNumberOfOperandsError)
    }
})

Deno.test('Index target is not a sequence', () => {
    try {
        const scope = new Scope()

        const node = new SetToIndex({
            target: new IndexFetch({
                target: new NumberValue(1),
                index: new Indexing({
                    index: new NumberValue(1),
                }),
            }),
            value: new NumberValue(2),
        })

        node.execute(scope, new CallFrame(node))
        unreachable()
    } catch (error) {
        assertIsError(error, TargetIsNotIndexedValueError)
    }
})

Deno.test('Index fetching target is not IndexedValue', () => {
    try {
        const scope = new Scope()

        const node = new IndexFetch({
            // 오류 생성을 위해서.. 어쩔 수 없었어요
            target: new NumberValue(1) as unknown as List,
            index: new Indexing({
                index: new NumberValue(1),
            }),
        })

        node.execute(scope, new CallFrame(node))
        unreachable()
    } catch (error) {
        assertIsError(error, TargetIsNotIndexedValueError)
    }
})

Deno.test('Print list before evaluating', () => {
    try {
        const node = new List({
            sequence: new Sequence({
                a: new Formula({
                    left: new NumberValue(1),
                    operator: new PlusOperator(),
                    right: new NumberValue(2),
                }),
                b: new NumberValue(2),
            }),
        })

        node.toPrint()
        unreachable()
    } catch (error) {
        assertIsError(error, ListNotEvaluatedError)
    }
})

Deno.test('List out of range', async (context) => {
    await context.step('Setting index is under 1', () => {
        const code = `
목록: [1, 3, 5, 7, 9]
목록[0]: 2
`
        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, ListIndexMustBeGreaterThan1Error)
        }
    })

    await context.step('Getting index is out of range', () => {
        const code = `
목록: [1, 3, 5, 7, 9]
목록[6] + 7
`
        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, ListIndexOutOfRangeError)
        }
    })

    await context.step('Getting index is under 1', () => {
        const code = `
목록: [1, 3, 5, 7, 9]
목록[0] + 7
`
        try {
            run(parse(tokenize(code)))
            unreachable()
        } catch (error) {
            assertIsError(error, ListIndexMustBeGreaterThan1Error)
        }
    })
})

Deno.test('List setting index is not number', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
목록["a"]: 2
`
    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (error) {
        assertIsError(error, ListIndexTypeError)
    }
})

Deno.test('List getting indexes list is not number', () => {
    const code = `
인덱스: ["a", "b", "c"]
목록: [1, 3, 5, 7, 9]

목록[인덱스] 보여주기
`
    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (error) {
        assertIsError(error, ListIndexTypeError)
    }
})

Deno.test('List getting index is not number', () => {
    const code = `
인덱스: 1 = 1
목록: [1, 3, 5, 7, 9]

목록[인덱스] 보여주기
`
    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (error) {
        assertIsError(error, ListIndexTypeError)
    }
})

Deno.test('List with no data source', () => {
    const node = new List({})
    assertEquals(node.toPrint(), '[]')
})

Deno.test('Sequence toPrint', () => {
    const code = `1, 3, 5, 7, 9`
    const tree = parse(tokenize(code))

    assertEquals((tree.children[1] as Sequence).toPrint(), '( 1 3 5 7 9 )')
})

Deno.test('Evaluate Sequence', () => {
    const code = `1, 3, 5, 7, 9`
    const tree = parse(tokenize(code, true))
    const sequence = tree.children[1] as Sequence

    const result = sequence.execute(new Scope(), new CallFrame(sequence))
    assertEquals(result, new NumberValue(9))
})
