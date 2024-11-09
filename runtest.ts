import { yaksok } from './src/index.ts'

const code = `
내_이름: "영희"
`

const result = yaksok(code)
console.log(result.getRunner().scope.getVariable('내_이름').value)
