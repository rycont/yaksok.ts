import { assertEquals, assertIsError, unreachable } from "assert";
import { parse } from "../parser.ts";
import { preprocessor } from "../preprocessor.ts";
import { run } from "../runtime.ts";
import { tokenizer } from "../tokenizer.ts";
import { YaksokError } from "../errors.ts";

Deno.test("Broken Blocks", () => {
    const code = `
값1: (10 * 2) + 10
값1 멋지게 보여주기
`

    try {
        run(parse(tokenizer(preprocessor(code))))
        unreachable()
    } catch (e) {
        assertIsError(e, YaksokError)
        assertEquals(e.name, "CANNOT_PARSE")
    }
})