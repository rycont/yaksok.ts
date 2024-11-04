<template>
    <div class="wrapper">
        <div class="header">
            <p>약속실행기</p>
            <button @click="share">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M18.3638 15.5355L16.9496 14.1213L18.3638 12.7071C20.3164 10.7545 20.3164 7.58866 18.3638 5.63604C16.4112 3.68341 13.2453 3.68341 11.2927 5.63604L9.87849 7.05025L8.46428 5.63604L9.87849 4.22182C12.6122 1.48815 17.0443 1.48815 19.778 4.22182C22.5117 6.95549 22.5117 11.3876 19.778 14.1213L18.3638 15.5355ZM15.5353 18.364L14.1211 19.7782C11.3875 22.5118 6.95531 22.5118 4.22164 19.7782C1.48797 17.0445 1.48797 12.6123 4.22164 9.87868L5.63585 8.46446L7.05007 9.87868L5.63585 11.2929C3.68323 13.2455 3.68323 16.4113 5.63585 18.364C7.58847 20.3166 10.7543 20.3166 12.7069 18.364L14.1211 16.9497L15.5353 18.364ZM14.8282 7.75736L16.2425 9.17157L9.17139 16.2426L7.75717 14.8284L14.8282 7.75736Z"
                    ></path>
                </svg>
                코드 공유
            </button>
            <button @click="runCode">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M19.376 12.4161L8.77735 19.4818C8.54759 19.635 8.23715 19.5729 8.08397 19.3432C8.02922 19.261 8 19.1645 8 19.0658V4.93433C8 4.65818 8.22386 4.43433 8.5 4.43433C8.59871 4.43433 8.69522 4.46355 8.77735 4.5183L19.376 11.584C19.6057 11.7372 19.6678 12.0477 19.5146 12.2774C19.478 12.3323 19.4309 12.3795 19.376 12.4161Z"
                    ></path>
                </svg>
                실행 (Ctrl + Enter)
            </button>
        </div>
        <textarea v-model="code" @keydown.ctrl.enter="runCode"> </textarea>
        <pre><div
                v-for="(output, index) in stdout"
                :key="index"
                v-html="output"
            ></div></pre>
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

            try {
                yaksok(this.code, {
                    stdout: (content) => {
                        this.stdout = [...this.stdout, content]
                    },
                    stderr: (content) => {
                        this.stdout = [...this.stdout, ansiToHtml(content)]
                    },
                })
            } catch (e) {
                console.error(e)
            }
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
.wrapper {
    display: flex;
    flex-direction: column;
    background-color: var(--vp-c-bg-alt);
    border-radius: 8px;
    border: 1px solid var(--vp-c-border);
}

.header {
    display: flex;
    background-color: var(--vp-c-bg-alt);
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    align-items: center;
    border-bottom: 1px solid var(--vp-c-border);
}

.header p {
    color: var(--vp-c-text-2);
    margin: 0px;
    flex: 1;
    padding: 6px 12px;
}

button {
    align-self: stretch;
    color: var(--vp-c-text-1);
    border: none;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
    box-sizing: border-box;
    transition: background-color 0.2s;
    border-left: 1px solid var(--vp-c-border);
    display: flex;
    align-items: center;
    gap: 6px;
}

button:hover {
    background-color: var(--vp-c-gray-1);
}

button svg {
    width: 16px;
    height: 16px;
}

textarea {
    padding: 12px;
    width: 100%;
    height: 200px;
    font-family: var(--vp-font-family-mono);
    line-height: 1.5;
    box-sizing: border-box;
    transition: box-shadow 0.2s;
    font-size: 14px;
    background: var(--vp-c-bg);
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

pre {
    padding: 12px;
    margin: 0px;
    font-family: var(--vp-font-family-mono);
    box-sizing: border-box;
    overflow-x: auto;
    border-top: 1px solid var(--vp-c-border);
    font-size: 14px;
    line-height: 1.3;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
}
</style>
