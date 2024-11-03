import typedoc from 'npm:typedoc@0.26.11'

const app = await typedoc.Application.bootstrapWithPlugins({
    entryPoints: ['./index.ts'],
    name: 'yaksok.ts',
})

Deno.watchFs('./*', {
    recursive: true,
})

const project = await app.convert()
const outputDir = 'docs'

if (project) {
    await app.generateDocs(project, outputDir)
}
