---
title: '빠른 시작'
---

# 빠른 시작

yaksok.ts는 JSR 패키지로 제공되며, Node, Deno, 브라우저에서 사용할 수 있습니다. 다음 명령어로 yaksok.ts를 설치합니다

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

자바스크립트 런타임에서 `@yaksok-ts/core`를 불러와 약속 코드를 실행합니다.

```ts
import { yaksok } from '@yaksok-ts/core'
yaksok(`"안녕, 세상!" 보여주기`) // "안녕, 세상!"이 콘솔에 출력됩니다.
```
