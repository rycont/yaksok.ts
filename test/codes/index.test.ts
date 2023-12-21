import { assertEquals } from 'assert'
import { yaksok } from '../../index.ts'

for (const file of Deno.readDirSync('./test/codes')) {
    if (file.isFile && file.name.endsWith('.yak')) {
        Deno.test(file.name, async () => {
            const _consoleLog = console.log
            let printed = ''

            console.log = (...items) => (printed += items.join(' ') + '\n')

            const code = await Deno.readTextFile(`./test/codes/${file.name}`)
            const expected = await Deno.readTextFile(
                `./test/codes/${file.name}.out`,
            )

            yaksok(code)

            assertEquals(printed, expected)

            console.log = _consoleLog
        })
    }
}
