import { yaksok } from '../index.ts'

Deno.test('Mentioning', () => {
    yaksok({
        main: `
@아두이노 모델명 보여주기
`,
        아두이노: `
모델명: "Arduino Uno"
`,
    })
})
