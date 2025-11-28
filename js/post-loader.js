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
      titleEl.textContent = metadata.title || "Untitled";
      document.title = `${metadata.title || "Post"} - kait1987's Blog`;
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
      const response = await fetch(`pages/${filename}`);

      if (!response.ok) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      const rawContent = await response.text();
      const { metadata, content } = parseFrontMatter(rawContent);

      // 메타데이터 렌더링
      renderMetadata(metadata);

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
