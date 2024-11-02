import { build } from 'npm:esbuild@0.20.2'
import { denoPlugins } from 'jsr:@luca/esbuild-deno-loader@^0.11.0'

await build({
    entryPoints: ['./index.ts'],
    bundle: true,
    write: true,
    format: 'esm',
    treeShaking: true,
    keepNames: true,
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: true,
    plugins: [...denoPlugins()],
    outdir: 'dist',
})
