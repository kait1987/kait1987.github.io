const fs = require('fs');
const path = require('path');

const postsDir = 'pages';
const outputFile = 'posts.json';

if (!fs.existsSync(postsDir)) {
  console.log('pages 디렉토리가 없습니다. 빈 posts.json을 생성합니다.');
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith('.md'))
  .sort((a, b) => b.localeCompare(a));

const posts = files.map((filename) => {
  const filePath = path.join(postsDir, filename);
  const content = fs.readFileSync(filePath, 'utf8');

  // Front Matter 파싱
  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  let metadata = {};
  let postContent = content;

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1];
    postContent = frontMatterMatch[2];

    // Front Matter 라인 파싱
    const lines = frontMatter.split('\n');
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return; // 빈 줄이나 주석 건너뛰기
      
      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();

        // 따옴표 제거 (단일 또는 이중 따옴표)
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // 배열 파싱 (tags)
        if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
          try {
            value = JSON.parse(value);
          } catch {
            value = value
              .slice(1, -1)
              .split(',')
              .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ''));
          }
        }

        // 카테고리도 따옴표 제거 확인
        if (key === 'category' && value) {
          // 이미 따옴표가 제거되었지만, 혹시 모를 경우를 대비
          value = value.replace(/^['"]|['"]$/g, '').trim();
        }

        if (key && value !== undefined && value !== null) {
          metadata[key] = value;
        }
      }
    });
  }
  

  // 발췌문 생성 (첫 200자)
  const excerpt = postContent
    .replace(/#.*$/gm, '') // 헤더 제거
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/\[[\s\S]*?\]/g, '') // 링크 제거
    .replace(/\*\*.*\*\*/g, '') // 볼드 제거
    .replace(/\*.*\*/g, '') // 이탤릭 제거
    .replace(/\n+/g, ' ') // 줄바꿈을 공백으로
    .trim()
    .substring(0, 200)
    .trim();

  // 카테고리가 없으면 자동 생성
  let category = metadata.category || '';
  if (!category || category.trim() === '') {
    const title = metadata.title || filename.replace('.md', '');
    const titleLower = title.toLowerCase();
    const contentLower = postContent.toLowerCase().substring(0, 500); // 처음 500자만 확인

    // AI 관련
    if (
      titleLower.includes('ai') ||
      titleLower.includes('인공지능') ||
      titleLower.includes('머신러닝') ||
      titleLower.includes('딥러닝') ||
      titleLower.includes('machine learning') ||
      titleLower.includes('deep learning') ||
      contentLower.includes('ai') ||
      contentLower.includes('인공지능')
    ) {
      category = 'AI';
    }
    // 개발/코드 관련
    else if (
      titleLower.includes('코드') ||
      titleLower.includes('code') ||
      titleLower.includes('개발') ||
      titleLower.includes('development') ||
      titleLower.includes('프로그래밍') ||
      titleLower.includes('programming') ||
      titleLower.includes('리뷰') ||
      titleLower.includes('review')
    ) {
      category = 'Development';
    }
    // 교육/학습 관련
    else if (
      titleLower.includes('학습') ||
      titleLower.includes('learning') ||
      titleLower.includes('공부') ||
      titleLower.includes('study') ||
      titleLower.includes('교육') ||
      titleLower.includes('education') ||
      titleLower.includes('가이드') ||
      titleLower.includes('guide')
    ) {
      category = 'Education';
    }
    // 금융/주식/코인 관련
    else if (
      titleLower.includes('주식') ||
      titleLower.includes('stock') ||
      titleLower.includes('코인') ||
      titleLower.includes('crypto') ||
      titleLower.includes('비트코인') ||
      titleLower.includes('bitcoin') ||
      titleLower.includes('금융') ||
      titleLower.includes('finance') ||
      titleLower.includes('시장') ||
      titleLower.includes('market')
    ) {
      category = 'Finance';
    }
    // 기술/테크 관련
    else if (
      titleLower.includes('기술') ||
      titleLower.includes('tech') ||
      titleLower.includes('technology')
    ) {
      category = 'Technology';
    }
    // 기본값
    else {
      category = 'General';
    }
  }

  return {
    file: filename,
    title: metadata.title || filename.replace('.md', ''),
    date: metadata.date || new Date().toISOString().split('T')[0],
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    category: category,
    description: metadata.description || '',
    excerpt: excerpt + (excerpt.length === 200 ? '...' : ''),
  };
});

// 날짜순 정렬 (최신순)
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
console.log(`Generated posts.json with ${posts.length} posts`);

