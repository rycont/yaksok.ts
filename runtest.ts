import { Runtime } from './src/runtime/index.ts'

const code = `
약속, 회전설정 (회전)
    결과: "rotate:" + 회전

약속, 시간설정 (시간)
    결과: "time:" + 시간

약속, (A) 합 (B)
    결과: A + "<join>" + B

약속, (각도)도 회전하기
    회전설정 각도 보여주기

약속, (시간)초 동안 (각도)도 회전하기
    (시간설정 시간) 합 (회전설정 각도) 보여주기

각도: 45
시간: 30

3초 동안 (90)도 회전하기
`

const runtime = new Runtime(
    {
        main: code,
    },
    {},
)

runtime.run()
