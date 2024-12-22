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

const DEFAULT_CODE = `이름: "재현"
나이: 20
국적: '덴마크'

만약 이름 = "재현" 이고 국적 = "대한민국" 이면
    "언제나 애국하는 우리 재현이" 보여주기
아니면 만약 국적 = "덴마크" 이면
    "재현이는 덴마크 사람이에요" 보여주기

만약 이름 = "재현" 이고 나이 = 18 이면
    "건강하게 자라준 우리 재현이" 보여주기
아니면 만약 나이 = 19 이면
    "곧 성인이 되는 우리 재현이" 보여주기
아니면 만약 나이 = 21 이면
    "어엿한 어른이 된 우리 재현이" 보여주기
아니면
    "재현이는 몇살이에요?" 보여주기

만약 이름 = "정현" 이거나 (나이 = 20이고 국적 = '덴마크') 이면
    "정현이니? 건강하게 자라줘서 고마워" 보여주기
    
만약 이름 = "재희" 거나 (나이 = 20고 국적 = '덴마크') 이면
    "재희니? 건강하게 자라줘서 고마워" 보여주기

만약 이름 = "지민"이고 (나이 = 20이고 국적 = '덴마크') 이면
    "지민이구나? 건강하게 자라줘서 고마워" 보여주기
`

const codeFromUrl = (globalThis.location && new URL(globalThis.location.href).searchParams.get('code')) || DEFAULT_CODE
</script>

## 지금 달빛약속 코드 실행해보기

<code-runner id="demo-code-runner" :code="codeFromUrl" />
