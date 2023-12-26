import { assertEquals } from 'assert'

import { tokenize } from '../prepare/tokenize/index.ts'
import { SetVariable } from '../node/variable.ts'
import { _LEGACY__parse } from '../prepare/parse/index.ts'
import { run } from '../runtime/run.ts'

function createRandomValue(depth = 0): number | (string | number)[] {
    if (depth > 3 || Math.random() < 0.5) {
        // Number
        return Math.floor(Math.random() * 200) + 1
    } else {
        // Formula
        return ['(', ...createRandomFormula(depth + 1), ')']
    }
}

function createRandomFormula(depth = 0): (string | number)[] {
    let len = Math.floor(Math.random() * 30) + 1

    if (len % 2 === 0) len++

    let formula: (string | number)[] = []

    for (let i = 0; i < len; i++) {
        if (i % 2 === 0) {
            formula = formula.concat(createRandomValue(depth))
        } else {
            formula.push(['+', '-', '*', '/'][Math.floor(Math.random() * 4)])
        }
    }

    return formula
}

Deno.test('Compute complex formula', () => {
    for (let i = 0; i < 20; i++) {
        const formula = createRandomFormula().join(' ')

        const code = `
나이: ${formula}
    `

        const ast = _LEGACY__parse(tokenize(code))
        const scope = run(ast)
        assertEquals(scope.getVariable('나이').value, eval(formula))
    }
})

Deno.test('Formula to string', () => {
    const code = `
나이: 10 + 20 / (30 - 40) * 50
`

    const ast = _LEGACY__parse(tokenize(code))
    assertEquals(
        (ast.children[1] as SetVariable).value.toPrint(),
        '10 + 20 / (30 - 40) * 50',
    )
})
