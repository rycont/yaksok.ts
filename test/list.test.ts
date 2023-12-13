import { assertEquals, assertIsError, unreachable } from 'assert'

import { tokenize } from '../tokenize.ts'
import {
    BinaryCalculationPiece,
    BlockPiece,
    DeclareVariablePiece,
    EOLPiece,
    ExpressionPiece,
    IndexFetchPiece,
    IndexingPiece,
    KeywordPiece,
    ListPiece,
    NumberPiece,
    Piece,
    PlusOperatorPiece,
    RangeOperatorPiece,
    SequencePiece,
    SetToIndexPiece,
    VariablePiece,
} from '../piece/index.ts'
import { parse } from '../parser/index.ts'
import { run } from '../runtime.ts'
import { YaksokError } from '../errors.ts'
import { CallFrame, Scope } from '../scope.ts'

Deno.test('Parse list', async (context) => {
    const code = `
목록: [1, 3, 5, 7, 9]
`
    let tokens: Piece[] = []

    await context.step('Tokenize', () => {
        tokens = tokenize(code)
        assertEquals(tokens, [
            new EOLPiece(),
            new KeywordPiece('목록'),
            new ExpressionPiece(':'),
            new ExpressionPiece('['),
            new NumberPiece(1),
            new ExpressionPiece(','),
            new NumberPiece(3),
            new ExpressionPiece(','),
            new NumberPiece(5),
            new ExpressionPiece(','),
            new NumberPiece(7),
            new ExpressionPiece(','),
            new NumberPiece(9),
            new ExpressionPiece(']'),
            new EOLPiece(),
        ])
    })

    let parsed: BlockPiece

    await context.step('Parse', () => {
        parsed = parse(tokens)

        assertEquals(
            parsed,
            new BlockPiece([
                new EOLPiece(),
                new DeclareVariablePiece({
                    name: new VariablePiece({
                        name: new KeywordPiece('목록'),
                    }),
                    value: new ListPiece({
                        sequence: new SequencePiece({
                            a: new SequencePiece({
                                a: new SequencePiece({
                                    a: new SequencePiece({
                                        a: new NumberPiece(1),
                                        b: new NumberPiece(3),
                                    }),
                                    b: new NumberPiece(5),
                                }),
                                b: new NumberPiece(7),
                            }),
                            b: new NumberPiece(9),
                        }),
                    }),
                }),
                new EOLPiece(),
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

    assertEquals(printed, '[ 1 3 5 7 9 ]')
    console.log = _consoleLog
})

Deno.test('Get list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
첫번째: 목록[1]
번째: 3
세번째: 목록[번째]
`

    const result = run(parse(tokenize(code)))

    assertEquals(result.getVariable('첫번째'), new NumberPiece(1))
    assertEquals(result.getVariable('세번째'), new NumberPiece(5))
})

Deno.test('Set list element', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
목록[1]: 2
`

    const tree = parse(tokenize(code))
    const result = run(tree)
    assertEquals(result.getVariable('목록').toPrint(), '[ 2 3 5 7 9 ]')
})

Deno.test('Get list element by indexes list', () => {
    const code = `
목록: [1, 3, 5, 7, 9]
값: 목록[1~3]
`

    const tree = parse(tokenize(code))
    const result = run(tree)
    assertEquals(result.getVariable('값').toPrint(), '[ 1 3 5 ]')
})

Deno.test('Create range but start is greater than end', () => {
    const code = `
목록: 30 ~ 10
`

    try {
        run(parse(tokenize(code)))
        unreachable()
    } catch (error) {
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'RANGE_START_MUST_BE_LESS_THAN_END')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'RANGE_START_MUST_BE_NUMBER')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'RANGE_START_MUST_BE_NUMBER')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'RANGE_END_MUST_BE_NUMBER')
        }
    })

    await context.step('number number', () => {
        const code = `
목록: 1 ~ 10
`

        const result = run(parse(tokenize(code)))
        assertEquals(
            result.getVariable('목록').toPrint(),
            '[ 1 2 3 4 5 6 7 8 9 10 ]',
        )
    })
})

Deno.test('Create range but operands are too many', () => {
    try {
        new RangeOperatorPiece().call(
            new NumberPiece(1),
            new NumberPiece(10),
            new NumberPiece(20),
        )
        unreachable()
    } catch (error) {
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'INVALID_NUMBER_OF_OPERANDS')
    }
})

Deno.test('Index target is not a sequence', () => {
    try {
        const scope = new Scope()

        const ast = new SetToIndexPiece({
            target: new IndexFetchPiece({
                target: new NumberPiece(1),
                index: new IndexingPiece({
                    index: new NumberPiece(1),
                }),
            }),
            value: new NumberPiece(2),
        })

        ast.execute(scope, new CallFrame(ast))
        unreachable()
    } catch (error) {
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'INVALID_SEQUENCE_TYPE_FOR_INDEX_FETCH')
    }
})

Deno.test('Index fetching target is not IndexedValue', () => {
    try {
        const scope = new Scope()

        const ast = new IndexFetchPiece({
            // 오류 생성을 위해서.. 어쩔 수 없었어요
            target: new NumberPiece(1) as unknown as ListPiece,
            index: new IndexingPiece({
                index: new NumberPiece(1),
            }),
        })

        ast.execute(scope, new CallFrame(ast))
        unreachable()
    } catch (error) {
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'INVALID_TYPE_FOR_INDEX_FETCH')
    }
})

Deno.test('Print list before evaluating', () => {
    try {
        const ast = new ListPiece({
            sequence: new SequencePiece({
                a: new BinaryCalculationPiece({
                    left: new NumberPiece(1),
                    operator: new PlusOperatorPiece(),
                    right: new NumberPiece(2),
                }),
                b: new NumberPiece(2),
            }),
        })

        ast.toPrint()
        unreachable()
    } catch (error) {
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'LIST_NOT_EVALUATED')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'LIST_INDEX_MUST_BE_GREATER_THAN_1')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'LIST_INDEX_OUT_OF_RANGE')
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
            assertIsError(error, YaksokError)
            assertEquals(error.name, 'LIST_INDEX_MUST_BE_GREATER_THAN_1')
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
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
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
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
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
        assertIsError(error, YaksokError)
        assertEquals(error.name, 'LIST_INDEX_TYPE_MUST_BE_NUMBER_OR_LIST')
    }
})

Deno.test('List with no data source', () => {
    const node = new ListPiece({})
    assertEquals(node.toPrint(), '[  ]')
})

Deno.test('Sequence toPrint', () => {
    const code = `[1, 3, 5, 7, 9]`
    const tree = parse(tokenize(code))
    assertEquals(
        (tree.content[1].sequence as SequencePiece).toPrint(),
        '( 1 3 5 7 9 )',
    )
})

Deno.test('Evaluate Sequence', () => {
    const code = `[1, 3, 5, 7, 9]`
    const tree = parse(tokenize(code))
    const sequence = tree.content[1].sequence as SequencePiece

    const result = sequence.execute(new Scope(), new CallFrame(sequence))
    assertEquals(result, new NumberPiece(9))
})
