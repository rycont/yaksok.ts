import { assert, assertEquals, assertIsError, unreachable } from 'assert'
import {
    isValidCharForKeyword,
    isValidFirstCharForKeyword,
    tokenizer,
} from '../tokenizer.ts'
import {
    ExpressionPiece,
    KeywordPiece,
    NumberPiece,
    OperatorPiece,
    StringPiece,
} from '../piece/index.ts'
import { EOLPiece, IndentPiece } from '../piece/misc.ts'
import { YaksokError } from '../errors.ts'

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
    const tokens = tokenizer('1')
    assertEquals(tokens, [new NumberPiece(1)])
})

Deno.test('Tokenize Binary Calculation', () => {
    const tokens = tokenizer('1 + 2')
    assertEquals(tokens, [
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(2),
    ])
})

Deno.test('Tokenize Complex Formula', () => {
    const tokens = tokenizer('1 + 2 * 3 / 4')
    assertEquals(tokens, [
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(2),
        new OperatorPiece('*'),
        new NumberPiece(3),
        new OperatorPiece('/'),
        new NumberPiece(4),
    ])
})

Deno.test('Tokenize Formula and Keyword', () => {
    const tokens = tokenizer('1 + 2 보여주기')
    assertEquals(tokens, [
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(2),
        new KeywordPiece('보여주기'),
    ])
})

Deno.test('Tokenize Formula and Keyword and EOL', () => {
    const tokens = tokenizer(`
1 + 2 보여주기
`)
    assertEquals(tokens, [
        new EOLPiece(),
        new NumberPiece(1),
        new OperatorPiece('+'),
        new NumberPiece(2),
        new KeywordPiece('보여주기'),
        new EOLPiece(),
    ])
})

Deno.test('Tokenize Variable Declaration with Constant', () => {
    const tokens = tokenizer('이름: "김철수"')

    assertEquals(tokens, [
        new KeywordPiece('이름'),
        new ExpressionPiece(':'),
        new StringPiece('김철수'),
    ])
})

Deno.test('Tokenize Variable Declaration with Wierd Name', async (context) => {
    await context.step('_이름', () => {
        const tokens = tokenizer('_이름: "김철수"')

        assertEquals(tokens, [
            new KeywordPiece('_이름'),
            new ExpressionPiece(':'),
            new StringPiece('김철수'),
        ])
    })

    await context.step('이_름', () => {
        const tokens = tokenizer('이_름: "김철수"')

        assertEquals(tokens, [
            new KeywordPiece('이_름'),
            new ExpressionPiece(':'),
            new StringPiece('김철수'),
        ])
    })

    await context.step('NiceName', () => {
        const tokens = tokenizer('NiceName: "김철수"')

        assertEquals(tokens, [
            new KeywordPiece('NiceName'),
            new ExpressionPiece(':'),
            new StringPiece('김철수'),
        ])
    })

    await context.step('what', () => {
        const tokens = tokenizer('what: "김철수"')

        assertEquals(tokens, [
            new KeywordPiece('what'),
            new ExpressionPiece(':'),
            new StringPiece('김철수'),
        ])
    })

    await context.step('실0패', () => {
        const tokens = tokenizer('실0패')
        assertEquals(tokens, [new KeywordPiece('실0패')])
    })

    await context.step('실패!', () => {
        try {
            tokenizer('실패!')
            unreachable()
        } catch (e) {
            assertIsError(e, YaksokError)
            assertEquals(e.resource.token, '!')
        }
    })
})

Deno.test('Tokenize Variable Declaration with Formula', () => {
    const tokens = tokenizer('이름: "김" + "철수"')

    assertEquals(tokens, [
        new KeywordPiece('이름'),
        new ExpressionPiece(':'),
        new StringPiece('김'),
        new OperatorPiece('+'),
        new StringPiece('철수'),
    ])
})

Deno.test('Tokenize Variable Declaration with Variable', () => {
    const code = `
나이: 10
내년_나이: 나이 + 1
`.trim()

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('나이'),
        new ExpressionPiece(':'),
        new NumberPiece(10),
        new EOLPiece(),
        new KeywordPiece('내년_나이'),
        new ExpressionPiece(':'),
        new KeywordPiece('나이'),
        new OperatorPiece('+'),
        new NumberPiece(1),
    ])
})

Deno.test('Tokenize Function Declaration with Multiple Parameter', () => {
    const code = `
약속 이름"에게" 메시지"라고" 인사하기
    메시지 + ", " + 이름 + "!" 보여주기
`.trim()

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('약속'),
        new KeywordPiece('이름'),
        new StringPiece('에게'),
        new KeywordPiece('메시지'),
        new StringPiece('라고'),
        new KeywordPiece('인사하기'),
        new EOLPiece(),
        new IndentPiece(1),
        new KeywordPiece('메시지'),
        new OperatorPiece('+'),
        new StringPiece(', '),
        new OperatorPiece('+'),
        new KeywordPiece('이름'),
        new OperatorPiece('+'),
        new StringPiece('!'),
        new KeywordPiece('보여주기'),
    ])
})

Deno.test('Tokenize Comment', () => {
    const code = `
이름: "김철수" # 이것은 주석입니다
# 이것도 주석입니다
`.trim()

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('이름'),
        new ExpressionPiece(':'),
        new StringPiece('김철수'),
        new EOLPiece(),
    ])
})

Deno.test('Tokenize Broken Indents', () => {
    const code = `
    약속 이름"에게" 메시지"라고" 인사하기
       메시지 + ", " + 이름 + "!" 보여주기
    `.trim()
    try {
        tokenizer(code)
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

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('이름'),
        new ExpressionPiece(':'),
        new StringPiece('김수연'),
        new EOLPiece(),
        new KeywordPiece('나이'),
        new ExpressionPiece(':'),
        new NumberPiece(10),
        new EOLPiece(),
        new KeywordPiece('내년_나이'),
        new ExpressionPiece(':'),
        new KeywordPiece('나이'),
        new OperatorPiece('+'),
        new NumberPiece(1),
    ])
})

Deno.test('Tokenize number include dot', () => {
    const code = `
나이: 10.5
`.trim()

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('나이'),
        new ExpressionPiece(':'),
        new NumberPiece(10.5),
    ])
})

Deno.test('Tokenize Negative Numbers', () => {
    const code = `
나이: -10.5
`.trim()

    const tokens = tokenizer(code)

    assertEquals(tokens, [
        new KeywordPiece('나이'),
        new ExpressionPiece(':'),
        new NumberPiece(-10.5),
    ])
})

Deno.test('Tokenize Uncomplete String', () => {
    const code = `이름: "홍`

    try {
        tokenizer(code)
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
