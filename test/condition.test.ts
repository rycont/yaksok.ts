import { assertEquals } from 'assert'
import { _LEGACY__parse } from '../prepare/parse/index.ts'

import { run } from '../runtime/run.ts'
import { tokenize } from '../prepare/tokenize/index.ts'

Deno.test('If statement', () => {
    const code = `
비교값: "다름"
만약 10 = 10이면
    비교값: "같음"
`

    const result = run(_LEGACY__parse(tokenize(code)))
    assertEquals(result.getVariable('비교값').value, '같음')
})

Deno.test('If-else statement', () => {
    const code = `
비교값: "다름"
만약 10 = 20이면
    비교값: "같음"
아니면
    비교값: "여전히 다름"
`

    const result = run(_LEGACY__parse(tokenize(code)))
    assertEquals(result.getVariable('비교값').value, '여전히 다름')
})
