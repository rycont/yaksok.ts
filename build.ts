import { bundle } from 'https://deno.land/x/emit@0.32.0/mod.ts'
const result = await bundle(new URL('./index.ts', import.meta.url))

const { code } = result
console.log(code)
