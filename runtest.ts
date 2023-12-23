import { yaksok } from './index.ts'

yaksok(
    `
약속 "피보나치" 수
    만약 수 < 3 이면
        결과: 1
    아니면
        결과: (피보나치 (수 - 1)) + (피보나치 (수 - 2))

횟수: 1

반복
    횟수 + "번째 피보나치 수는 " + (피보나치 횟수) + "입니다" 보여주기
    횟수: 횟수 + 1

    만약 횟수 > 10 이면
        반복 그만
`,
    {
        stdout: (message) => {
            console.log('>>', message)
        },
        stderr: (message) => {
            console.error('ERR|>', message)
        },
    },
)
