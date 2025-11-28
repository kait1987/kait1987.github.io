/**
 * Post Loader Module
 * 마크다운 게시글 로딩 및 렌더링
 */
(function () {
  "use strict";

  /**
   * URL에서 파일명 파라미터 가져오기
   */
  function getFileParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get("file");
  }

  /**
   * 파일명에서 의미있는 제목 생성
   */
  function generateTitleFromFilename(filename) {
    // .md 확장자 제거
    let title = filename.replace(/\.md$/, "");

    // 하이픈을 공백으로 변경
    title = title.replace(/-/g, " ");

    // 날짜 형식 변환 (YYYY-MM-DD → YYYY년 MM월 DD일)
    title = title.replace(
      /(\d{4})-(\d{1,2})-(\d{1,2})/g,
      (match, year, month, day) => {
        return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
      }
    );

    // 일반적인 약어/키워드를 한국어로 변환
    const translations = {
      ai: "AI",
      code: "코드",
      review: "리뷰",
      guide: "가이드",
      learning: "학습",
      effective: "효과적인",
      stock: "주식",
      crypto: "코인",
      news: "뉴스",
      market: "시장",
      latest: "최신",
      trends: "동향",
      example: "예시",
      welcome: "환영",
    };

    // 단어별로 변환
    const words = title.split(" ");
    const translatedWords = words.map((word) => {
      const lowerWord = word.toLowerCase();
      if (translations[lowerWord]) {
        return translations[lowerWord];
      }
      // 첫 글자 대문자 (한글이 아닌 경우)
      if (/^[a-z]/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });

    title = translatedWords.join(" ");

    // 공백 정리
    title = title.replace(/\s+/g, " ").trim();

    return title || "게시글";
  }

  /**
   * Front Matter 파싱
   */
  function parseFrontMatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!match) {
      return { metadata: {}, content: content };
    }

    const frontMatter = match[1];
    const postContent = match[2];
    const metadata = {};

    // Front Matter 라인 파싱
    const lines = frontMatter.split("\n");
    lines.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();

        // 따옴표 제거
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(",")
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""));
          }
        }

        metadata[key] = value;
      }
    });

    return { metadata, content: postContent };
  }

  /**
   * 날짜 포맷팅
   */
  function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}`;
  }

  /**
   * HTML 이스케이프
   */
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 마크다운을 HTML로 변환
   */
  function renderMarkdown(content) {
    if (typeof marked === "undefined") {
      console.error("marked.js not loaded");
      return content;
    }

    // marked 옵션 설정
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: true,
      mangle: false,
    });

    return marked.parse(content);
  }

  /**
   * 코드 하이라이팅 적용
   */
  function highlightCode() {
    if (typeof Prism !== "undefined") {
      Prism.highlightAll();
    }
  }

  /**
   * 게시글 메타데이터 렌더링
   */
  function renderMetadata(metadata) {
    // 제목
    const titleEl = document.getElementById("post-title");
    if (titleEl) {
      const title = metadata.title || "게시글";
      titleEl.textContent = title;
      document.title = `${title} - kait1987's Blog`;
    }

    // 날짜
    const dateEl = document.getElementById("post-date");
    if (dateEl && metadata.date) {
      dateEl.textContent = formatDate(metadata.date);
    }

    // 카테고리
    const categoryEl = document.getElementById("post-category");
    if (categoryEl && metadata.category) {
      categoryEl.textContent = metadata.category;
    }

    // 태그
    const tagsEl = document.getElementById("post-tags");
    if (tagsEl && metadata.tags && Array.isArray(metadata.tags)) {
      tagsEl.innerHTML = metadata.tags
        .map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`)
        .join("");
    }
  }

  /**
   * Giscus 댓글 로드
   */
  function loadGiscus() {
    const container = document.getElementById("giscus-container");
    if (!container) return;

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.setAttribute("data-repo", "kait1987/kait1987.github.io");
    script.setAttribute("data-repo-id", "R_kgDOQec19A"); // TODO: 실제 값으로 교체
    script.setAttribute("data-category", "General");
    script.setAttribute("data-category-id", "DIC_kwDOQec19M4CzIya"); // TODO: 실제 값으로 교체
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "1");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", "preferred_color_scheme");
    script.setAttribute("data-lang", "ko");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true;

    container.appendChild(script);
  }

  /**
   * 에러 표시
   */
  function showError(message) {
    const contentEl = document.getElementById("post-content");
    const titleEl = document.getElementById("post-title");

    if (titleEl) titleEl.textContent = "오류";
    if (contentEl) {
      contentEl.innerHTML = `<p style="color: var(--color-text-muted);">${escapeHtml(
        message
      )}</p>`;
    }
    document.title = "오류 - kait1987's Blog";
  }

  /**
   * 게시글 로드 및 렌더링
   */
  async function loadPost() {
    const filename = getFileParam();

    if (!filename) {
      showError("게시글 파일이 지정되지 않았습니다.");
      return;
    }

    try {
      // posts.json에서 제목 가져오기 시도
      let postsMetadata = {};
      try {
        const postsResponse = await fetch("posts.json");
        if (postsResponse.ok) {
          const posts = await postsResponse.json();
          const post = posts.find((p) => p.file === filename);
          if (post) {
            postsMetadata = post;
          }
        }
      } catch (e) {
        console.warn("Failed to load posts.json:", e);
      }

      const response = await fetch(`pages/${filename}`);

      if (!response.ok) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      const rawContent = await response.text();
      const { metadata, content } = parseFrontMatter(rawContent);

      // posts.json의 메타데이터와 Front Matter 메타데이터 병합 (Front Matter 우선)
      const mergedMetadata = {
        ...postsMetadata,
        ...metadata,
      };

      // 제목이 없거나 "Untitled"면 파일명에서 의미있는 제목 생성
      if (
        !mergedMetadata.title ||
        mergedMetadata.title === "Untitled" ||
        mergedMetadata.title.trim() === ""
      ) {
        mergedMetadata.title = generateTitleFromFilename(filename);
      }

      // 메타데이터 렌더링
      renderMetadata(mergedMetadata);

      // 마크다운 → HTML 변환
      const html = renderMarkdown(content);

      // 본문 렌더링
      const contentEl = document.getElementById("post-content");
      if (contentEl) {
        contentEl.innerHTML = html;
      }

      // 코드 하이라이팅
      highlightCode();

      // Giscus 댓글 로드
      loadGiscus();
    } catch (error) {
      console.error("Error loading post:", error);
      showError(error.message || "게시글을 불러오는데 실패했습니다.");
    }
  }

  // DOM 준비되면 게시글 로드
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPost);
  } else {
    loadPost();
  }
})();
