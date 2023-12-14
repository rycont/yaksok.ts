import { assertEquals, assertIsError, unreachable } from 'assert'
import { tokenize } from '../prepare/tokenize/index.ts'
import {
    Expression,
    Keyword,
    NumberValue,
    Operator,
    StringValue,
    Variable,
} from '../node/index.ts'
import { EOL, Indent } from '../node/misc.ts'
import { YaksokError } from '../errors.ts'
import {
    isValidFirstCharForKeyword,
    isValidCharForKeyword,
} from '../prepare/tokenize/isValidCharForKeyword.ts'

Deno.test('Determine validity as a keyword char of "a"', () => {
    assertEquals(
        [isValidFirstCharForKeyword('a'), isValidCharForKeyword('a')],
        [true, true],
    )
})

Deno.test('Determine validity as a keyword char of "ㅇ"', () => {
    assertEquals(
        [isValidFirstCharForKeyword('ㅇ'), isValidCharForKeyword('ㅇ')],
        [true, true],
    )
})

Deno.test('Determine validity as a keyword char of "가"', () => {
    assertEquals(
        [isValidFirstCharForKeyword('가'), isValidCharForKeyword('가')],
        [true, true],
    )
})

Deno.test('Determine validity as a keyword char of "0"', () => {
    assertEquals(
        [isValidFirstCharForKeyword('0'), isValidCharForKeyword('0')],
        [false, true],
    )
})

Deno.test('Determine validity as a keyword char of "_"', () => {
    assertEquals(
        [isValidFirstCharForKeyword('_'), isValidCharForKeyword('_')],
        [true, true],
    )
})

Deno.test('Tokenize Number', () => {
    const { tokens } = tokenize('1')
    assertEquals(tokens, [new EOL(), new NumberValue(1), new EOL()])
})

Deno.test('Tokenize Binary Operation', () => {
    const { tokens } = tokenize('1 + 2')
    assertEquals(tokens, [
        new EOL(),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(2),
        new EOL(),
    ])
})

Deno.test('Tokenize Complex Formula', () => {
    const { tokens } = tokenize('1 + 2 * 3 / 4')
    assertEquals(tokens, [
        new EOL(),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(2),
        new Operator('*'),
        new NumberValue(3),
        new Operator('/'),
        new NumberValue(4),
        new EOL(),
    ])
})

Deno.test('Tokenize Formula and Keyword', () => {
    const { tokens } = tokenize('1 + 2 보여주기')
    assertEquals(tokens, [
        new EOL(),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(2),
        new Keyword('보여주기'),
        new EOL(),
    ])
})

Deno.test('Tokenize Formula and Keyword and EOL', () => {
    const { tokens } = tokenize(`
1 + 2 보여주기
`)
    assertEquals(tokens, [
        new EOL(),
        new NumberValue(1),
        new Operator('+'),
        new NumberValue(2),
        new Keyword('보여주기'),
        new EOL(),
    ])
})

Deno.test('Tokenize Variable Declaration with Constant', () => {
    const { tokens } = tokenize('이름: "김철수"')

    assertEquals(tokens, [
        new EOL(),
        new Keyword('이름'),
        new Expression(':'),
        new StringValue('김철수'),
        new EOL(),
    ])
})

Deno.test('Tokenize Variable Declaration with Wierd Name', async (context) => {
    await context.step('_이름', () => {
        const { tokens } = tokenize('_이름: "김철수"')

        assertEquals(tokens, [
            new EOL(),
            new Keyword('_이름'),
            new Expression(':'),
            new StringValue('김철수'),
            new EOL(),
        ])
    })

    await context.step('이_름', () => {
        const { tokens } = tokenize('이_름: "김철수"')

        assertEquals(tokens, [
            new EOL(),
            new Keyword('이_름'),
            new Expression(':'),
            new StringValue('김철수'),
            new EOL(),
        ])
    })

    await context.step('NiceName', () => {
        const { tokens } = tokenize('NiceName: "김철수"')

        assertEquals(tokens, [
            new EOL(),
            new Keyword('NiceName'),
            new Expression(':'),
            new StringValue('김철수'),
            new EOL(),
        ])
    })

    await context.step('what', () => {
        const { tokens } = tokenize('what: "김철수"')

        assertEquals(tokens, [
            new EOL(),
            new Keyword('what'),
            new Expression(':'),
            new StringValue('김철수'),
            new EOL(),
        ])
    })

    await context.step('실0패', () => {
        const { tokens } = tokenize('실0패')
        assertEquals(tokens, [new EOL(), new Keyword('실0패'), new EOL()])
    })

    await context.step('실패!', () => {
        try {
            tokenize('실패!')
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.resource.token, '!')
        }
    })
})

Deno.test('Tokenize Variable Declaration with Formula', () => {
    const { tokens } = tokenize('이름: "김" + "철수"')

    assertEquals(tokens, [
        new EOL(),
        new Keyword('이름'),
        new Expression(':'),
        new StringValue('김'),
        new Operator('+'),
        new StringValue('철수'),
        new EOL(),
    ])
})

Deno.test('Tokenize Variable Declaration with Variable', () => {
    const code = `
나이: 10
내년_나이: 나이 + 1
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('나이'),
        new Expression(':'),
        new NumberValue(10),
        new EOL(),
        new Keyword('내년_나이'),
        new Expression(':'),
        new Keyword('나이'),
        new Operator('+'),
        new NumberValue(1),
        new EOL(),
    ])
})

Deno.test('Tokenize Function Declaration with Multiple Parameter', () => {
    const code = `
약속 이름"에게" 메시지"라고 인사하기"
    메시지 + ", " + 이름 + "!" 보여주기
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('약속'),
        new Variable('이름'),
        new StringValue('에게'),
        new Variable('메시지'),
        new StringValue('라고 인사하기'),
        new EOL(),
        new Indent(1),
        new Variable('메시지'),
        new Operator('+'),
        new StringValue(', '),
        new Operator('+'),
        new Variable('이름'),
        new Operator('+'),
        new StringValue('!'),
        new Keyword('보여주기'),
        new EOL(),
    ])
})

Deno.test('Tokenize Comment', () => {
    const code = `
이름: "김철수" # 이것은 주석입니다
# 이것도 주석입니다
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('이름'),
        new Expression(':'),
        new StringValue('김철수'),
        new EOL(),
    ])
})

Deno.test('Tokenize Broken Indents', () => {
    const code = `
    약속 이름"에게" 메시지"라고" 인사하기
       메시지 + ", " + 이름 + "!" 보여주기
    `.trim()
    try {
        tokenize(code)
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'INDENT_IS_NOT_MULTIPLE_OF_4')
    }
})

Deno.test('Tokenize Consecutive LineBreak', () => {
    const code = `
이름: "김수연"

나이: 10

내년_나이: 나이 + 1
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('이름'),
        new Expression(':'),
        new StringValue('김수연'),
        new EOL(),
        new Keyword('나이'),
        new Expression(':'),
        new NumberValue(10),
        new EOL(),
        new Keyword('내년_나이'),
        new Expression(':'),
        new Keyword('나이'),
        new Operator('+'),
        new NumberValue(1),
        new EOL(),
    ])
})

Deno.test('Tokenize number include dot', () => {
    const code = `
나이: 10.5
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('나이'),
        new Expression(':'),
        new NumberValue(10.5),
        new EOL(),
    ])
})

Deno.test('Tokenize Negative Numbers', () => {
    const code = `
나이: -10.5
`.trim()

    const { tokens } = tokenize(code)

    assertEquals(tokens, [
        new EOL(),
        new Keyword('나이'),
        new Expression(':'),
        new NumberValue(-10.5),
        new EOL(),
    ])
})

Deno.test('Tokenize Uncomplete String', () => {
    const code = `이름: "홍`

    try {
        tokenize(code)
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, 'UNEXPECTED_END_OF_CODE')
    }
})

// import { yaksok } from '../index.ts'

// const FIBONACCI = `
// 약속 "피보나치" 수
//     만약 수 < 3 이면
//         결과: 1
//     아니면
//         결과: (피보나치 (수 - 1)) + (피보나치 (수 - 2))

// 횟수: 1

// 반복
//     횟수 + "번째 피보나치 수는 " + (피보나치 횟수) + "입니다" 보여주기
//     횟수: 횟수 + 1

//     만약 횟수 > 10 이면
//         반복 그만
// `

// yaksok(FIBONACCI)

// yaksok(`
// 약속 과일"을/를 멋있는 " 사람 "와/과 먹기"
//     사람 + ": " + 과일 + " 먹음" 보여주기

// "사과"를 멋있는 "김철수"와 먹기
// `)
