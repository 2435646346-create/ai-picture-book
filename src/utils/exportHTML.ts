// ============================================================
// HTML5 绘本导出工具
// 生成一个完全自包含的 HTML 文件，含翻页动画 + 配音播放
// ============================================================

import type { PictureBookData } from '../types';

export function generateExportHTML(data: PictureBookData): string {
  const pagesJSON = JSON.stringify(data.pages);
  const title = escapeHTML(data.title);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - AI 绘本工坊</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-font-smoothing:antialiased}
body{
  font-family:'Nunito',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  background:#1a1a2e;
  color:#fff;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  user-select:none;
}

/* ---- 绘本容器 ---- */
.book-container{
  position:relative;
  width:100%;
  max-width:900px;
  margin:0 auto;
  padding:20px;
}

/* ---- 页面展示区 ---- */
.page-stage{
  position:relative;
  width:100%;
  aspect-ratio:16/9;
  border-radius:16px;
  overflow:hidden;
  background:#0f0f23;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
}

.page-slide{
  position:absolute;
  top:0;left:0;
  width:100%;height:100%;
  opacity:0;
  transition:opacity 0.6s ease, transform 0.6s ease;
  transform:scale(1.02);
  pointer-events:none;
}

.page-slide.active{
  opacity:1;
  transform:scale(1);
  pointer-events:auto;
}

.page-slide img{
  width:100%;height:100%;
  object-fit:cover;
  display:block;
}

/* ---- 文字叠加 ---- */
.page-text-overlay{
  position:absolute;
  bottom:0;left:0;right:0;
  padding:24px 32px;
  background:linear-gradient(transparent,rgba(0,0,0,0.7));
  transition:opacity 0.3s ease;
}

.page-text-overlay.hidden{opacity:0}

.page-text-overlay h2{
  font-size:1.3rem;
  font-weight:700;
  margin-bottom:8px;
  text-shadow:0 2px 8px rgba(0,0,0,0.5);
}

.page-text-overlay p{
  font-size:1rem;
  line-height:1.7;
  opacity:0.92;
  text-shadow:0 1px 4px rgba(0,0,0,0.5);
}

/* ---- 页码指示器 ---- */
.page-dots{
  display:flex;
  justify-content:center;
  gap:8px;
  padding:16px 0;
}

.page-dot{
  width:10px;height:10px;
  border-radius:50%;
  background:rgba(255,255,255,0.2);
  cursor:pointer;
  transition:all 0.3s ease;
}

.page-dot.active{
  background:#ff8c6b;
  transform:scale(1.3);
  box-shadow:0 0 8px rgba(255,140,107,0.5);
}

/* ---- 控制栏 ---- */
.controls{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  padding:8px 0;
}

.ctrl-btn{
  background:rgba(255,255,255,0.1);
  border:1px solid rgba(255,255,255,0.15);
  color:#fff;
  padding:8px 16px;
  border-radius:24px;
  font-size:0.85rem;
  font-weight:600;
  cursor:pointer;
  transition:all 0.2s ease;
  font-family:inherit;
}

.ctrl-btn:hover{
  background:rgba(255,255,255,0.2);
  transform:translateY(-1px);
}

.ctrl-btn.primary{
  background:linear-gradient(135deg,#ff8c6b,#ff6b8a);
  border-color:transparent;
}

.ctrl-btn.primary:hover{
  box-shadow:0 4px 16px rgba(255,140,107,0.4);
}

.page-counter{
  font-size:0.85rem;
  font-weight:600;
  opacity:0.6;
  min-width:60px;
  text-align:center;
}

/* ---- 标题 ---- */
.book-title{
  text-align:center;
  padding:16px 0 8px;
  font-size:1.1rem;
  font-weight:700;
  opacity:0.8;
  letter-spacing:0.5px;
}

/* ---- 水印 ---- */
.watermark{
  text-align:center;
  padding:12px 0;
  font-size:0.7rem;
  opacity:0.3;
}

/* ---- 响应式 ---- */
@media(max-width:768px){
  .book-container{padding:12px}
  .page-text-overlay{padding:16px 20px}
  .page-text-overlay h2{font-size:1rem}
  .page-text-overlay p{font-size:0.85rem}
  .controls{gap:8px}
  .ctrl-btn{padding:6px 12px;font-size:0.8rem}
}

/* ---- 翻页动画增强 ---- */
.page-slide.slide-left{
  animation:slideLeft 0.6s ease forwards;
}

.page-slide.slide-right{
  animation:slideRight 0.6s ease forwards;
}

@keyframes slideLeft{
  from{opacity:0;transform:translateX(30px) scale(1.02)}
  to{opacity:1;transform:translateX(0) scale(1)}
}

@keyframes slideRight{
  from{opacity:0;transform:translateX(-30px) scale(1.02)}
  to{opacity:1;transform:translateX(0) scale(1)}
}
</style>
</head>
<body>

<div class="book-container">
  <div class="book-title" id="bookTitle"></div>

  <div class="page-stage" id="pageStage"></div>

  <div class="page-dots" id="pageDots"></div>

  <div class="controls">
    <button class="ctrl-btn" id="prevBtn" onclick="prevPage()">← 上一页</button>
    <button class="ctrl-btn" id="textToggle" onclick="toggleText()">📝 隐藏文字</button>
    <span class="page-counter" id="pageCounter"></span>
    <button class="ctrl-btn primary" id="playBtn" onclick="toggleAutoPlay()">▶ 自动播放</button>
    <button class="ctrl-btn" id="nextBtn" onclick="nextPage()">下一页 →</button>
  </div>

  <div class="watermark">AI 绘本工坊 · Made with love</div>
</div>

<script>
// ---- 绘本数据 ----
const TITLE = ${JSON.stringify(data.title)};
const PAGES = ${pagesJSON};

// ---- 状态 ----
let currentPage = 0;
let isPlaying = false;
let showText = true;
let currentAudio = null;
let autoPlayTimer = null;

// ---- 初始化 ----
function init() {
  document.getElementById('bookTitle').textContent = TITLE;

  const stage = document.getElementById('pageStage');
  const dots = document.getElementById('pageDots');

  PAGES.forEach((page, i) => {
    // 创建页面幻灯片
    const slide = document.createElement('div');
    slide.className = 'page-slide' + (i === 0 ? ' active' : '');
    slide.id = 'slide-' + i;
    slide.innerHTML =
      '<img src="' + page.imageUrl + '" alt="' + escHTML(page.title) + '">' +
      '<div class="page-text-overlay" id="overlay-' + i + '">' +
        '<h2>' + escHTML(page.title) + '</h2>' +
        '<p>' + escHTML(page.narration) + '</p>' +
      '</div>';
    stage.appendChild(slide);

    // 创建页码点
    const dot = document.createElement('div');
    dot.className = 'page-dot' + (i === 0 ? ' active' : '');
    dot.onclick = function() { goToPage(i); };
    dots.appendChild(dot);
  });

  updateCounter();

  // 键盘控制
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextPage(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevPage(); }
    if (e.key === 'p' || e.key === 'P') { toggleAutoPlay(); }
    if (e.key === 't' || e.key === 'T') { toggleText(); }
  });

  // 触摸滑动
  let touchStartX = 0;
  stage.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  });
  stage.addEventListener('touchend', function(e) {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextPage(); else prevPage();
    }
  });
}

// ---- 翻页 ----
function goToPage(idx, direction) {
  if (idx < 0 || idx >= PAGES.length || idx === currentPage) return;

  const dir = direction || (idx > currentPage ? 'left' : 'right');

  // 停止当前音频
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  // 切换幻灯片
  const oldSlide = document.getElementById('slide-' + currentPage);
  const newSlide = document.getElementById('slide-' + idx);

  oldSlide.classList.remove('active', 'slide-left', 'slide-right');
  newSlide.classList.remove('slide-left', 'slide-right');
  newSlide.classList.add('active', dir === 'left' ? 'slide-left' : 'slide-right');

  // 更新页码点
  const dots = document.getElementById('pageDots').children;
  dots[currentPage].classList.remove('active');
  dots[idx].classList.add('active');

  currentPage = idx;
  updateCounter();

  // 自动播放时播放音频
  if (isPlaying) {
    playPageAudio(idx);
  }
}

function nextPage() {
  if (currentPage < PAGES.length - 1) goToPage(currentPage + 1, 'left');
  else if (isPlaying) { stopAutoPlay(); }
}

function prevPage() {
  if (currentPage > 0) goToPage(currentPage - 1, 'right');
}

// ---- 音频 ----
function playPageAudio(idx) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  const page = PAGES[idx];
  if (!page.audioUrl) {
    // 没有音频，等待后自动翻页
    if (isPlaying) {
      autoPlayTimer = setTimeout(function() {
        if (currentPage < PAGES.length - 1) nextPage();
        else stopAutoPlay();
      }, 3000);
    }
    return;
  }

  const audio = new Audio(page.audioUrl);
  currentAudio = audio;

  audio.addEventListener('ended', function() {
    if (isPlaying) {
      autoPlayTimer = setTimeout(function() {
        if (currentPage < PAGES.length - 1) nextPage();
        else stopAutoPlay();
      }, 1000);
    }
  });

  audio.play().catch(function() {});
}

// ---- 自动播放 ----
function toggleAutoPlay() {
  if (isPlaying) stopAutoPlay();
  else startAutoPlay();
}

function startAutoPlay() {
  isPlaying = true;
  document.getElementById('playBtn').textContent = '⏸ 暂停';
  goToPage(0, 'left');
  setTimeout(function() { playPageAudio(0); }, 300);
}

function stopAutoPlay() {
  isPlaying = false;
  document.getElementById('playBtn').textContent = '▶ 自动播放';
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
}

// ---- 文字切换 ----
function toggleText() {
  showText = !showText;
  document.getElementById('textToggle').textContent = showText ? '📝 隐藏文字' : '📝 显示文字';
  PAGES.forEach(function(_, i) {
    var overlay = document.getElementById('overlay-' + i);
    if (overlay) overlay.classList.toggle('hidden', !showText);
  });
}

// ---- 工具 ----
function updateCounter() {
  document.getElementById('pageCounter').textContent = (currentPage + 1) + ' / ' + PAGES.length;
}

function escHTML(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// 启动
init();
</script>
</body>
</html>`;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
