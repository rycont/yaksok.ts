---
title: 'Home'
---

<script setup>
import CodeRunner from "../docs-component/code-runner.vue"

const DEFAULT_CODE = `약속, 키가 (키)cm이고 몸무게가 (몸무게)일 때 비만도
    결과: 몸무게 / (키 / 100 * 키 / 100)

비만도: 키가 (170)cm이고 몸무게가 (70)일 때 비만도

비만도 보여주기
비만도 보여줄까말까`

const codeFromUrl = (globalThis.location && new URL(globalThis.location.href).searchParams.get('code')) || DEFAULT_CODE
</script>

# yaksok.ts

교육용 프로그래밍 언어 yaksok의 타입스크립트 구현체입니다. [약속티에스]라고 읽습니다.

<CodeRunner :code="codeFromUrl" />

## 사용하기

::: warning
현재 yaksok.ts는 라이브러리로만 사용할 수 있습니다. CLI에서 약속 파일(.yak)을 직접 실행할 수는 없습니다.
:::

::: code-group

```Bash [Deno]
deno add jsr:@yaksok-ts/core
```

```Bash [Others]
# NPX
npx jsr add @yaksok-ts/core

# Yarn
yarn dlx jsr add @yaksok-ts/core

# Pnpm
pnpm dlx jsr add @yaksok-ts/core

# Bun
bunx jsr add @yaksok-ts/core
```

:::

```ts
import { yaksok } from '@yaksok-ts/core'
yaksok(`"안녕, 세상!" 보여주기`) // "안녕, 세상!"이 콘솔에 출력됩니다.
```
