---
title: 'Home'
layout: home
hero:
    name: 달빛약속
    text: 한글 프로그래밍 언어
    tagline: '약속 프로그래밍 언어의 포크, Formerly known as "Yaksok.ts"'
features:
    - title: 약속 문법 배우기
      icon: 📚
      link: /language/1. 시작하기
      details: 간단한 예제를 통해 약속 문법을 배워보세요
      linkText: 시작하기
    - title: 라이브러리로 사용하기
      icon: 📦
      link: /library/1. 시작하기
      details: 달빛약속을 앱에 통합하는 방법을 알아보세요
      linkText: 빠른 시작
    - title: GitHub에서 코드 보기
      icon: 💻
      details: 소스코드와 이슈를 공유합니다
      link: https://github.com/rycont/yaksok.ts
      linkText: rycont/yaksok.ts
    - title: JSR에서 패키지 설치하기
      icon: 📦
      link: https://jsr.dev/@dalbit-yaksok/core
      details: JSR에서 달빛약속을 설치하세요
      linkText: 'jsr: @dalbit-yaksok/core'
---

<script setup>

const DEFAULT_CODE = `메뉴판: ["떡볶이", "마늘", "쑥", "자린고비", "엉겅퀴", "국화"]
메뉴판[[2, 4, 6]] 보여주기
`

const codeFromUrl = (globalThis.location && new URL(globalThis.location.href).searchParams.get('code')) || DEFAULT_CODE
</script>

## 지금 달빛약속 코드 실행해보기

<code-runner id="demo-code-runner" :code="codeFromUrl" />
