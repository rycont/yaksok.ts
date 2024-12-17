import { assertEquals } from 'assert'
import { yaksok } from '../../core/mod.ts'

for (const file of Deno.readDirSync(new URL('./', import.meta.url).pathname)) {
    if (file.isFile && file.name.endsWith('.yak')) {
        Deno.test(file.name, async () => {
            let printed = ''

            const code = await Deno.readTextFile(
                new URL(`./${file.name}`, import.meta.url).pathname,
            )
            const expected = await Deno.readTextFile(
                new URL(`./${file.name}.out`, import.meta.url).pathname,
            )

            await yaksok(code, {
                stdout: (message) => (printed += message + '\n'),
            })

            assertEquals(printed, expected)
        })
    }
}
