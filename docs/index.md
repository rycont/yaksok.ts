---
title: 'Home'
layout: home
hero:
    name: Yaksok.ts
    tagline: 교육용 프로그래밍 언어 "약속"의 타입스크립트 구현체
features:
    - title: 약속 문법 배우기
      icon: 📚
      link: /language/1. 시작하기
      details: 간단한 예제를 통해 약속 문법을 배워보세요
      linkText: 시작하기
    - title: 라이브러리로 사용하기
      icon: 📦
      link: /library/1. 시작하기
      details: yaksok.ts를 앱에 통합하는 방법을 알아보세요
      linkText: 빠른 시작
    - title: GitHub에서 코드 보기
      icon: 💻
      details: 소스코드와 이슈를 공유합니다
      link: https://github.com/rycont/yaksok.ts
      linkText: rycont/yaksok.ts
    - title: JSR에서 패키지 설치하기
      icon: 📦
      link: https://jsr.dev/@yaksok-ts/core
      details: JSR에서 yaksok.ts를 설치하세요
      linkText: 'jsr: @yaksok-ts/core'
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

## 지금 약속 코드 실행해보기

<CodeRunner id="demo-code-runner" :code="codeFromUrl" />
