// ============================================================
// 步骤 5: 绘本预览播放器
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export function BookPreview() {
  const { state, nextStep, prevStep } = useApp();
  const { storyboard } = state;

  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNarration, setShowNarration] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = storyboard.length;
  const page = storyboard[currentPage];

  // 播放当前页音频
  const playCurrentPageAudio = useCallback(() => {
    if (!page || !page.audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(page.audioUrl);
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      // 自动翻页
      if (isPlaying && currentPage < totalPages - 1) {
        playTimeoutRef.current = setTimeout(() => {
          setCurrentPage(prev => prev + 1);
        }, 800);
      } else if (currentPage >= totalPages - 1) {
        setIsPlaying(false);
      }
    });

    audio.play().catch(console.error);
  }, [page, currentPage, totalPages, isPlaying]);

  // 当页码变化时自动播放
  useEffect(() => {
    if (isPlaying && page?.audioUrl) {
      playCurrentPageAudio();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, [currentPage, isPlaying]);

  // 手动播放当前页音频
  const handlePlayAudio = () => {
    if (page?.audioUrl) {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(page.audioUrl);
      audioRef.current = audio;
      audio.play().catch(console.error);
    }
  };

  // 开始自动播放
  const handleAutoPlay = () => {
    setIsPlaying(true);
    setCurrentPage(0);
  };

  // 暂停
  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
    if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
  };

  // 翻页
  const goToPage = (idx: number) => {
    if (idx >= 0 && idx < totalPages) {
      if (audioRef.current) audioRef.current.pause();
      setCurrentPage(idx);
    }
  };

  if (totalPages === 0) {
    return (
      <div className="card">
        <p>还没有绘本数据，请先完成前面的步骤。</p>
        <button className="btn btn-secondary" onClick={prevStep}>← 返回</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">👀 绘本预览</h2>
      <p className="card-description">
        预览你的绘本效果，可以手动翻页或自动播放。满意后可以导出！
      </p>

      <div className="book-player">
        {/* 绘本页面展示 */}
        <div className="book-page-display">
          {page?.imageUrl && (
            <img className="page-image" src={page.imageUrl} alt={page.title} />
          )}
          {showNarration && page && (
            <div className="page-overlay">
              <div className="page-title">{page.title}</div>
              <div className="page-narration">{page.narration}</div>
            </div>
          )}
        </div>

        {/* 控制栏 */}
        <div className="book-controls">
          <button
            className="btn btn-secondary btn-small"
            disabled={currentPage === 0}
            onClick={() => goToPage(currentPage - 1)}
          >
            ← 上一页
          </button>

          <button
            className="btn btn-secondary btn-small"
            onClick={() => setShowNarration(!showNarration)}
          >
            {showNarration ? '📝 隐藏文字' : '📝 显示文字'}
          </button>

          {page?.audioUrl && (
            <button
              className="btn btn-secondary btn-small"
              onClick={handlePlayAudio}
            >
              🔊 播放本页
            </button>
          )}

          <span className="page-indicator">
            {currentPage + 1} / {totalPages}
          </span>

          {isPlaying ? (
            <button className="btn btn-secondary btn-small" onClick={handlePause}>
              ⏸ 暂停
            </button>
          ) : (
            <button className="btn btn-primary btn-small" onClick={handleAutoPlay}>
              ▶ 自动播放
            </button>
          )}

          <button
            className="btn btn-secondary btn-small"
            disabled={currentPage === totalPages - 1}
            onClick={() => goToPage(currentPage + 1)}
          >
            下一页 →
          </button>
        </div>

        {/* 页面缩略图 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: 'var(--space-md) 0',
        }}>
          {storyboard.map((p, idx) => (
            <div
              key={idx}
              onClick={() => goToPage(idx)}
              style={{
                flexShrink: 0,
                width: 80,
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: idx === currentPage
                  ? '2px solid var(--accent-coral)'
                  : '2px solid transparent',
                opacity: idx === currentPage ? 1 : 0.6,
                transition: 'all 0.2s ease',
              }}
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                }}>
                  P{p.pageNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>
          ← 重选配音
        </button>
        <button className="btn btn-primary" onClick={nextStep}>
          📦 去导出绘本
        </button>
      </div>
    </div>
  );
}
