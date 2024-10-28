import * as esbuild from 'npm:esbuild@0.20.2'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.11.0'

const result = await esbuild.build({
    entryPoints: ['./index.ts'],
    bundle: true,
    write: false,
    format: 'esm',
    treeShaking: true,
    keepNames: true,
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: true,

    plugins: [...denoPlugins()],
})

console.log(result.outputFiles[0].text)
esbuild.stop()
