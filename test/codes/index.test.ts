import { assertEquals } from 'assert'
import { yaksok } from '../../src/mod.ts'

for (const file of Deno.readDirSync('./test/codes')) {
    if (file.isFile && file.name.endsWith('.yak')) {
        Deno.test(file.name, async () => {
            let printed = ''

            const code = await Deno.readTextFile(`./test/codes/${file.name}`)
            const expected = await Deno.readTextFile(
                `./test/codes/${file.name}.out`,
            )

            yaksok(code, {
                stdout: (message) => (printed += message + '\n'),
            })

            assertEquals(printed, expected)
        })
    }
}
