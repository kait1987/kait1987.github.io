/**
 * Theme Toggle Module
 * 다크/라이트 모드 전환 기능
 */
(function() {
    'use strict';

    const THEME_KEY = 'blog-theme';
    const DARK = 'dark';
    const LIGHT = 'light';

    /**
     * 시스템 테마 설정 확인
     */
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK;
        }
        return LIGHT;
    }

    /**
     * 저장된 테마 또는 시스템 테마 가져오기
     */
    function getSavedTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        return saved || getSystemTheme();
    }

    /**
     * 테마 적용
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        updateThemeIcon(theme);
    }

    /**
     * 테마 아이콘 업데이트
     */
    function updateThemeIcon(theme) {
        const icon = document.querySelector('.theme-icon');
        if (icon) {
            icon.textContent = theme === DARK ? '☀️' : '🌙';
        }
    }

    /**
     * 테마 저장
     */
    function saveTheme(theme) {
        localStorage.setItem(THEME_KEY, theme);
    }

    /**
     * 테마 토글
     */
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || getSavedTheme();
        const newTheme = current === DARK ? LIGHT : DARK;
        applyTheme(newTheme);
        saveTheme(newTheme);
    }

    /**
     * 초기화
     */
    function init() {
        // 페이지 로드 시 테마 적용
        const theme = getSavedTheme();
        applyTheme(theme);

        // 테마 토글 버튼 이벤트 리스너
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }

        // 시스템 테마 변경 감지
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // 저장된 테마가 없을 경우에만 시스템 테마 따름
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK : LIGHT);
                }
            });
        }
    }

    // DOM 준비되면 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 전역 함수 노출 (필요시 사용)
    window.ThemeManager = {
        toggle: toggleTheme,
        set: applyTheme,
        get: getSavedTheme
    };
})();

