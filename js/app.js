/**
 * Main Application Module
 * 게시글 목록 관리 및 렌더링
 */
(function() {
    'use strict';

    let allPosts = [];
    let currentTag = null;

    /**
     * 게시글 목록 fetch
     */
    async function fetchPosts() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('Failed to fetch posts');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
    }

    /**
     * 날짜 포맷팅
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}. ${month}. ${day}`;
    }

    /**
     * 게시글 카드 HTML 생성
     */
    function createPostCard(post) {
        const tagsHtml = (post.tags || [])
            .map(tag => `<span class="post-card-tag">${escapeHtml(tag)}</span>`)
            .join('');

        return `
            <article class="post-card">
                <a href="post.html?file=${encodeURIComponent(post.file)}" class="post-card-link">
                    <h2 class="post-card-title">${escapeHtml(post.title)}</h2>
                    <div class="post-card-meta">
                        <time class="post-card-date">${formatDate(post.date)}</time>
                        ${post.category ? `<span class="post-card-category">${escapeHtml(post.category)}</span>` : ''}
                    </div>
                    <p class="post-card-excerpt">${escapeHtml(post.excerpt || post.description || '')}</p>
                    ${tagsHtml ? `<div class="post-card-tags">${tagsHtml}</div>` : ''}
                </a>
            </article>
        `;
    }

    /**
     * HTML 이스케이프
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 게시글 목록 렌더링
     */
    function renderPosts(posts) {
        const container = document.getElementById('posts-list');
        const loading = document.getElementById('loading');
        const noPostsMsg = document.getElementById('no-posts');

        if (!container) return;

        // 로딩 숨기기
        if (loading) loading.style.display = 'none';

        if (!posts || posts.length === 0) {
            container.innerHTML = '';
            if (noPostsMsg) noPostsMsg.style.display = 'block';
            return;
        }

        if (noPostsMsg) noPostsMsg.style.display = 'none';

        // 현재 태그 필터 적용
        let filteredPosts = posts;
        if (currentTag) {
            filteredPosts = posts.filter(post => 
                post.tags && post.tags.includes(currentTag)
            );
        }

        if (filteredPosts.length === 0) {
            container.innerHTML = '';
            if (noPostsMsg) noPostsMsg.style.display = 'block';
            return;
        }

        container.innerHTML = filteredPosts.map(createPostCard).join('');
    }

    /**
     * 태그 필터 생성
     */
    function renderTags(posts) {
        const container = document.getElementById('tags-container');
        if (!container) return;

        // 모든 태그 수집 및 중복 제거
        const tagSet = new Set();
        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => tagSet.add(tag));
            }
        });

        if (tagSet.size === 0) {
            container.style.display = 'none';
            return;
        }

        const tags = Array.from(tagSet).sort();
        
        // "전체" 버튼 + 태그 버튼들
        const tagsHtml = `
            <button class="tag-filter active" data-tag="">전체</button>
            ${tags.map(tag => `<button class="tag-filter" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`).join('')}
        `;

        container.innerHTML = tagsHtml;

        // 태그 클릭 이벤트
        container.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                // 활성 상태 토글
                container.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 태그 필터 적용
                currentTag = btn.dataset.tag || null;
                renderPosts(allPosts);

                // 검색 초기화
                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';
            });
        });
    }

    /**
     * 앱 초기화
     */
    async function init() {
        allPosts = await fetchPosts();
        
        // 태그 필터 렌더링
        renderTags(allPosts);
        
        // 게시글 목록 렌더링
        renderPosts(allPosts);

        // 검색 모듈 초기화
        if (window.SearchManager) {
            window.SearchManager.init(allPosts);
        }
    }

    // DOM 준비되면 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 전역 객체로 노출
    window.BlogApp = {
        renderPosts: renderPosts,
        getAllPosts: () => allPosts
    };
})();

