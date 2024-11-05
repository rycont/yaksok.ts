---
order: 2
---

<script setup>
import CodeRunner from "../../docs-component/code-runner.vue"

const challenge = {
    output: "반가워, 세상!",
    answerCode: `"반가워, 세상!" 보여주기`
}
</script>

# 보여주기

"보여주기" 기능을 사용해서 사용자에게 값을 보여줄 수 있습니다:

```plaintext
"안녕, 세상!" 보여주기
```

## 직접 해보기

`"반가워, 세상!"`을 보여주는 코드를 작성해보세요.

<CodeRunner :challenge="challenge" />
