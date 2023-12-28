import { assertEquals } from 'assert'

import { yaksok } from '../index.ts'

Deno.test('If statement', () => {
    const code = `
비교값: "다름"
만약 10 = 10이면
    비교값: "같음"
`

    const result = yaksok(code).getRunner().scope
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

    const result = yaksok(code).getRunner().scope
    assertEquals(result.getVariable('비교값').value, '여전히 다름')
})
