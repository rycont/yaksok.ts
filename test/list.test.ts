import { assert, assertEquals, assertIsError, unreachable } from 'assert'

import {
    InvalidNumberOfOperandsError,
    ListIndexMustBeGreaterThan1Error,
    ListIndexOutOfRangeError,
    ListIndexTypeError,
    RangeEndMustBeNumberError,
    RangeStartMustBeLessThanEndError,
    RangeStartMustBeNumberError,
    TargetIsNotIndexedValueError,
} from '../error/index.ts'
import { yaksok } from '../index.ts'
import { Formula } from '../node/calculation.ts'
import {
    Block,
    EOL,
    Expression,
    IndexFetch,
    Keyword,
    List,
    NumberValue,
    PlusOperator,
    RangeOperator,
    Sequence,
    SetToIndex,
    SetVariable,
} from '../node/index.ts'
import { parse } from '../prepare/parse/index.ts'
import { tokenize } from '../prepare/tokenize/index.ts'
import { CallFrame } from '../runtime/callFrame.ts'
import { Scope } from '../runtime/scope.ts'

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
        parsed = parse(result).ast

        assertEquals(
            parsed,
            new Block([
                new EOL(),
                new SetVariable(
                    '목록',
                    new List([
                        new NumberValue(1),
                        new NumberValue(3),
                        new NumberValue(5),
                        new NumberValue(7),
                        new NumberValue(9),
                    ]),
                ),
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

    let printed = ''

    yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })

    assertEquals(printed, '[1, 3, 5, 7, 9]\n')
})

Deno.test('Empty list', () => {
    const code = `
[] 보여주기
`

    let printed = ''

    yaksok(code, {
        stdout: (message) => (printed += message + '\n'),
    })

    assertEquals(printed, '[]\n')
})

Deno.test('Get list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
첫번째: 목록[1]
번째: 3
세번째: 목록[번째]
`

    const { scope } = yaksok(code).getRunner()

    assertEquals(scope.getVariable('첫번째').value, 1)
    assertEquals(scope.getVariable('세번째').value, 5)
})

Deno.test('Set list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
목록[1]: 2
`

    const { scope } = yaksok(code).getRunner()
    assertEquals(scope.getVariable('목록').toPrint(), '[2, 3, 5, 7, 9]')
})

Deno.test('Get list element by indexes list', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
값: 목록[1~3]
`

    const { scope } = yaksok(code).getRunner()
    assertEquals(scope.getVariable('값').toPrint(), '[1, 3, 5]')
})

Deno.test('Create range but start is greater than end', () => {
    const code = `
목록: 30 ~ 10
`

    try {
        yaksok(code)
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
            yaksok(code)
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
            yaksok(code)
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
            yaksok(code)
            unreachable()
        } catch (error) {
            assertIsError(error, RangeEndMustBeNumberError)
        }
    })

    await context.step('number number', () => {
        const code = `
목록: 1 ~ 10
`

        const { scope } = yaksok(code).getRunner()
        assertEquals(
            scope.getVariable('목록').toPrint(),
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

        const node = new SetToIndex(
            new IndexFetch(new NumberValue(1), new NumberValue(1)),
            new NumberValue(2),
        )

        node.execute(scope, new CallFrame(node))
        unreachable()
    } catch (error) {
        assertIsError(error, TargetIsNotIndexedValueError)
    }
})

Deno.test('Index fetching target is not IndexedValue', () => {
    try {
        const scope = new Scope()

        const node = new IndexFetch( // 오류 생성을 위해서.. 어쩔 수 없었어요
            new NumberValue(1) as unknown as List,
            new NumberValue(1),
        )

        node.execute(scope, new CallFrame(node))
        unreachable()
    } catch (error) {
        assertIsError(error, TargetIsNotIndexedValueError)
    }
})

Deno.test('Print list before evaluating', () => {
    const node = new List([
        new Formula([
            new NumberValue(1),
            new PlusOperator(),
            new NumberValue(2),
        ]),
        new NumberValue(2),
    ])

    assertEquals(node.toPrint(), '[1 + 2, 2]')
})

Deno.test('List out of range', async (context) => {
    await context.step('Setting index is under 1', () => {
        const code = `
목록: [1, 3, 5, 7, 9]
목록[0]: 2
`
        try {
            yaksok(code)
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
            yaksok(code)
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
            yaksok(code)
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
        yaksok(code)
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
        yaksok(code)
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
        yaksok(code)
        unreachable()
    } catch (error) {
        assertIsError(error, ListIndexTypeError)
    }
})

Deno.test('List with no data source', () => {
    const node = new List([])
    assertEquals(node.toPrint(), '[]')
})

Deno.test('Sequence toPrint', () => {
    const code = `1, 3, 5, 7, 9`
    const tree = parse(tokenize(code)).ast

    assertEquals((tree.children[1] as Sequence).toPrint(), '( 1 3 5 7 9 )')
})

Deno.test('Evaluate Sequence', () => {
    const code = `1, 3, 5, 7, 9`
    const tree = parse(tokenize(code, true)).ast
    const sequence = tree.children[1] as Sequence

    const result = sequence.execute(new Scope(), new CallFrame(sequence))
    assertEquals(result, new NumberValue(9))
})
