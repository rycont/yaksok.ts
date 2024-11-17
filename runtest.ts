import { yaksok } from '@yaksok-ts/core'

const code = `
내_이름: "영희"
`

const result = yaksok(code)
console.log(result.scope.getVariable('내_이름').value)
