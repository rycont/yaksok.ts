import * as esbuild from 'https://deno.land/x/esbuild@v0.19.10/mod.js'

const ts = await Deno.readTextFile('./index.ts')
const result = await esbuild.build({
    stdin: {
        contents: ts,
        loader: 'ts',
        resolveDir: '.',
    },
    bundle: true,
    write: false,
    format: 'esm',
    minify: true,
    treeShaking: true,
    keepNames: false,
})

console.log(result.outputFiles[0].text)
esbuild.stop()
