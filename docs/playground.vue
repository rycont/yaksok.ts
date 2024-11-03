<template>
    <div>
        <textarea v-model="code"> </textarea>
        <pre
            v-for="(output, index) in stdout"
            :key="index"
            v-html="output"
        ></pre>
        <button @click="runCode">실행</button>
        <button @click="share">코드 공유</button>
    </div>
</template>

<script>
import { yaksok } from '../src/index.ts'
import AnsiCode from 'ansi-to-html'

const codeFromUrl = globalThis.location
    ? new URL(globalThis.location.href).searchParams.get('code')
    : ''
const ansiCode = new AnsiCode()

function ansiToHtml(content) {
    const text = ansiCode.toHtml(content)
    return text
}

export default {
    data() {
        return {
            code:
                codeFromUrl ||
                `약속, 키가 (키)cm이고 몸무게가 (몸무게)일 때 비만도
    결과: 몸무게 / (키 / 100 * 키 / 100)

비만도: 키가 (170)cm이고 몸무게가 (70)일 때 비만도

비만도 보여주기
비만도 보여줄까말까`,
            stdout: [],
        }
    },
    methods: {
        runCode() {
            this.stdout = []

            yaksok(this.code, {
                stdout: (content) => {
                    this.stdout = [...this.stdout, content]
                },
                stderr: (content) => {
                    this.stdout = [...this.stdout, ansiToHtml(content)]
                },
            })
        },
        share() {
            const url = new URL(globalThis.location.href)
            url.searchParams.set('code', this.code)
            navigator.clipboard.writeText(url.toString())
            alert('공유 링크가 클립보드에 복사되었습니다.')
        },
    },
    computed: {
        stdoutText() {
            return this.stdout.join('\n')
        },
    },
    mounted() {
        this.runCode()
    },
}
</script>

<style scoped>
textarea {
    background-color: var(--vp-c-bg-alt);
    border-radius: 8px;
    padding: 12px;
    width: 100%;
    height: 200px;
    font-family: var(--vp-font-family-mono);
    line-height: 1.5;
    box-sizing: border-box;
    transition: box-shadow 0.2s;
    font-size: 14px;
}

textarea:focus {
    box-shadow: inset 0 0 0 1px var(--vp-c-brand-1);
}

textarea:read-only {
    border-color: var(--vp-c-border);
    border-width: 1px;
    border-style: solid;
    background-color: transparent;
}

button {
    background-color: var(--vp-c-brand-1);
    color: var(--vp-c-bg);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 12px;
    box-sizing: border-box;
    transition: background-color 0.2s;
}

button + button {
    margin-left: 6px;
}

pre {
    border-radius: 8px;
    padding: 12px;
    margin-top: 12px;
    font-family: var(--vp-font-family-mono);
    box-sizing: border-box;
    overflow-x: auto;
    border: 1px solid var(--vp-c-border);
    font-size: 14px;
    line-height: 1.3;
}
</style>
