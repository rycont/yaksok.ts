import { yaksok } from '@yaksok-ts/core'

const code = `
내_이름: "영희"
`

const result = await yaksok(code)
console.log(result.getFileRunner().scope.getVariable('내_이름').value)
