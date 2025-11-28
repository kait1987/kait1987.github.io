/**
 * Search Module
 * 클라이언트 사이드 검색 기능
 */
(function() {
    'use strict';

    let allPosts = [];
    let searchTimeout = null;

    /**
     * 검색어로 게시글 필터링
     */
    function filterPosts(query, posts) {
        if (!query || query.trim() === '') {
            return posts;
        }

        const searchTerms = query.toLowerCase().trim().split(/\s+/);
        
        return posts.filter(post => {
            const title = (post.title || '').toLowerCase();
            const excerpt = (post.excerpt || '').toLowerCase();
            const description = (post.description || '').toLowerCase();
            const category = (post.category || '').toLowerCase();
            const tags = (post.tags || []).map(t => t.toLowerCase());

            return searchTerms.every(term => {
                return title.includes(term) ||
                       excerpt.includes(term) ||
                       description.includes(term) ||
                       category.includes(term) ||
                       tags.some(tag => tag.includes(term));
            });
        });
    }

    /**
     * 검색 결과 렌더링 (app.js의 renderPosts 호출)
     */
    function performSearch(query) {
        const filtered = filterPosts(query, allPosts);
        
        if (window.BlogApp && typeof window.BlogApp.renderPosts === 'function') {
            window.BlogApp.renderPosts(filtered);
        }
    }

    /**
     * 디바운스된 검색 실행
     */
    function debounceSearch(query, delay = 300) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(query);
        }, delay);
    }

    /**
     * 검색 입력 이벤트 핸들러
     */
    function handleSearchInput(e) {
        const query = e.target.value;
        debounceSearch(query);
    }

    /**
     * 검색 초기화
     */
    function init(posts) {
        allPosts = posts || [];
        
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearchInput);
            
            // ESC 키로 검색 초기화
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    searchInput.value = '';
                    performSearch('');
                }
            });
        }
    }

    /**
     * 게시글 데이터 업데이트
     */
    function updatePosts(posts) {
        allPosts = posts || [];
    }

    // 전역 객체로 노출
    window.SearchManager = {
        init: init,
        updatePosts: updatePosts,
        filter: filterPosts,
        search: performSearch
    };
})();

