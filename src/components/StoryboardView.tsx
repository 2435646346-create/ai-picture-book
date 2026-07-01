// ============================================================
// 步骤 3: 分镜插图展示
// ============================================================

import { useApp } from '../context/AppContext';

export function StoryboardView() {
  const { state, nextStep, prevStep } = useApp();
  const { storyboard } = state;

  const allDone = storyboard.length > 0 && storyboard.every(p => p.imageStatus === 'done');
  const completedCount = storyboard.filter(p => p.imageStatus === 'done').length;

  return (
    <div className="card">
      <h2 className="card-title">🎨 分镜插图</h2>
      <p className="card-description">
        AI 正在为你的绘本绘制插图，完成后可以进入配音环节。
      </p>

      {/* 进度条 */}
      {storyboard.length > 0 && (
        <>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedCount / storyboard.length) * 100}%` }}
            />
          </div>
          <p style={{
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-lg)',
          }}>
            已完成 {completedCount} / {storyboard.length} 张插图
          </p>
        </>
      )}

      {/* 分镜网格 */}
      <div className="storyboard-grid">
        {storyboard.map((page, idx) => (
          <div key={idx} className={`storyboard-item ${page.imageStatus === 'done' ? 'done' : ''}`}>
            <div className="image-container">
              {page.imageStatus === 'done' && page.imageUrl ? (
                <img src={page.imageUrl} alt={page.title} loading="lazy" />
              ) : page.imageStatus === 'generating' ? (
                <div className="image-placeholder">
                  <div className="loading-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
                  <span>绘制中...</span>
                </div>
              ) : page.imageStatus === 'error' ? (
                <div className="image-placeholder">
                  <span style={{ fontSize: '2rem' }}>❌</span>
                  <span>生成失败</span>
                </div>
              ) : (
                <div className="image-placeholder">
                  <span className="placeholder-icon">🖼️</span>
                  <span>等待绘制</span>
                </div>
              )}
            </div>
            <div className="page-info">
              <div className="page-title">P{page.pageNumber} · {page.title}</div>
              <div className="page-narration">{page.narration}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>
          ← 重选剧本
        </button>
        <button
          className="btn btn-primary"
          disabled={!allDone}
          onClick={nextStep}
        >
          🎙️ 去选配音
        </button>
      </div>
    </div>
  );
}
