import { assertEquals, unreachable } from 'assert'

import { tokenize } from '../prepare/tokenize/index.ts'
import { Expression, Keyword } from '../node/base.ts'
import { parse } from '../prepare/parse/index.ts'
import { Mention } from '../node/index.ts'
import { EOL } from '../node/misc.ts'
import { yaksok } from '../index.ts'
import { Formula } from '../node/calculation.ts'
import { MentionScope } from '../node/mention.ts'
import { IfStatement } from '../node/IfStatement.ts'

Deno.test('Parse Mentioning', async (context) => {
    const code = '@아두이노 모델명 보여주기'
    let tokens: ReturnType<typeof tokenize>

    await context.step('Tokenize', () => {
        tokens = tokenize(code, true)

        assertEquals(tokens.tokens, [
            new EOL(),
            new Expression('@'),
            new Keyword('아두이노'),
            new Keyword('모델명'),
            new Keyword('보여주기'),
            new EOL(),
        ])
    })

    await context.step('Parse Mentioning', () => {
        const { ast } = parse(tokens)

        assertEquals(ast.children, [
            new EOL(),
            new Mention({
                name: new Keyword('아두이노'),
            }),
            new Keyword('모델명'),
            new Keyword('보여주기'),
            new EOL(),
            new EOL(),
        ])
    })
})

Deno.test('Mentioning', () => {
    let stdout = ''
    const result = yaksok(
        {
            main: `
보드_시리얼: "1032"

만약 @아두이노 모델명 = "Arduino Uno" 이면
    "아두이노 모델명이 맞습니다." 보여주기
    @아두이노 보드_시리얼 버전 보여주기
    `,
            아두이노: `
약속 시리얼 "버전"
    만약 시리얼 = "1032" 이면
        결과: "1.0.0"
    아니면
        만약 시리얼 = "1033" 이면
            결과: "1.0.1"
        아니면
            결과: "UNKNOWN"

모델명: "Arduino Uno"
    `,
        },
        {
            stdout: (str) => (stdout += str + '\n'),
        },
    )

    assertEquals(
        stdout,
        `아두이노 모델명이 맞습니다.
1.0.0
`,
    )

    const toPrint = (
        (
            (result.getRunner().ast.children[2] as IfStatement).cases[0]
                .condition as Formula
        ).terms[0] as MentionScope
    ).toPrint()

    assertEquals(toPrint, '@아두이노 모델명')
})

Deno.test('Mentioning to string', () => {
    const code = parse(
        tokenize(
            `
@아두이노 모델명 보여주기
`,
            true,
        ),
    )

    const mentionNode = code.ast.children[1]
    assertEquals(mentionNode.toPrint(), '@아두이노')
})

Deno.test('Error in module', () => {
    let stderr = ''
    try {
        yaksok(
            {
                main: `
보드_시리얼: "1032"

만약 @아두이노 모델명 = "Arduino Uno" 이면
    "아두이노 모델명이 맞습니다." 보여주기
    @아두이노 보드_시리얼 버전 보여주기
`,
                아두이노: `
약속 시리얼 "버전"
    만약 시리얼 = "1032" 이면
        결과: "1.0.0"
    아니면 만약 시리얼 = "1033" 이면
        결과: "1.0.1"
    아니면
        결과: "UNKNOWN"

    "지민" / 2

모델명: "Arduino Uno"
`,
            },
            {
                stderr: (str) => (stderr += str + '\n'),
            },
        )
        unreachable()
    } catch (_error) {
        assertEquals(
            stderr,
            `─────

🚨  \u001b[1m문제가 발생했어요\u001b[0m  🚨
10번째 줄의 11번째 글자

> \u001b[1m\u001b[34m지민\u001b[0m\u001b[0m\u001b[2m(문자)\u001b[0m와 \u001b[1m\u001b[34m2\u001b[0m\u001b[0m\u001b[2m(숫자)\u001b[0m는 \u001b[34m\u001b[1m/\u001b[0m\u001b[0m\u001b[2m(나누기)\u001b[0m할 수 없어요.

┌─────
│  \u001b[2m9  \u001b[0m
│  10      "지민" / 2
│                  ^
│  \u001b[2m11  \u001b[0m
│  \u001b[2m12  모델명: "Arduino Uno"\u001b[0m
└─────

─────

🚨  \u001b[1m문제가 발생했어요\u001b[0m  🚨
6번째 줄의 11번째 글자

> 다른 약속 파일 \u001b[34m\u001b[1m아두이노\u001b[0m\u001b[0m에서 오류가 발생했어요.

┌─────
│  \u001b[2m5      "아두이노 모델명이 맞습니다." 보여주기\u001b[0m
│  6      @아두이노 보드_시리얼 버전 보여주기
│                  ^
│  \u001b[2m7  \u001b[0m
└─────

`,
        )
    }
})
