---
title: '블로그에 오신 것을 환영합니다!'
date: 2025-01-26
tags: ['Welcome', 'Blog', 'GitHub Pages']
category: 'General'
description: '이 블로그의 첫 번째 게시글입니다. GitHub Pages와 마크다운으로 만들어진 정적 블로그를 소개합니다.'
---

# 안녕하세요! 👋

이 블로그에 오신 것을 환영합니다. 이 블로그는 **GitHub Pages**를 사용하여 호스팅되며, 순수 HTML, CSS, JavaScript로 구축되었습니다.

## 주요 기능

이 블로그는 다음과 같은 기능을 제공합니다:

- 🌙 **다크/라이트 모드**: 우측 상단의 버튼으로 테마를 전환할 수 있습니다
- 🔍 **검색 기능**: 게시글 제목, 내용, 태그로 검색 가능합니다
- 🏷️ **태그 필터링**: 태그를 클릭하여 관련 게시글만 볼 수 있습니다
- 💬 **댓글 시스템**: Giscus를 통한 GitHub Discussions 기반 댓글

## 마크다운 예시

### 코드 블록

JavaScript 코드 예시:

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to my blog, ${name}!`;
}

greet('Reader');
```

Python 코드 예시:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 첫 10개의 피보나치 수
for i in range(10):
    print(fibonacci(i), end=' ')
```

### 인용문

> 좋은 코드는 스스로를 설명한다.
> — Robert C. Martin

### 목록

1. 첫 번째 항목
2. 두 번째 항목
3. 세 번째 항목

- 순서 없는 목록 1
- 순서 없는 목록 2
- 순서 없는 목록 3

### 표

| 기능 | 설명 | 상태 |
|------|------|------|
| 마크다운 렌더링 | marked.js 사용 | ✅ |
| 코드 하이라이팅 | Prism.js 사용 | ✅ |
| 다크 모드 | CSS 변수 기반 | ✅ |
| 댓글 | Giscus | ✅ |

## 게시글 작성 방법

새 게시글을 작성하려면 `pages/` 폴더에 `.md` 파일을 생성하세요:

```markdown
---
title: '게시글 제목'
date: 2025-01-26
tags: ['Tag1', 'Tag2']
category: 'Category'
description: '게시글 설명'
---

# 본문 내용

여기에 마크다운 형식으로 내용을 작성합니다.
```

파일을 저장하고 `git push`하면 GitHub Actions가 자동으로 블로그를 빌드하고 배포합니다!

---

읽어주셔서 감사합니다. 앞으로도 좋은 글로 찾아뵙겠습니다! 🚀

