// ============================================================
// 步骤 6: 导出 HTML5 动画绘本
// ============================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateExportHTML } from '../utils/exportHTML';

export function ExportPanel() {
  const { state, dispatch, prevStep } = useApp();
  const { storyboard } = state;
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const selectedScript = state.selectedScriptIndex !== null
    ? state.generatedScripts[state.selectedScriptIndex]
    : null;

  const handleExport = () => {
    setIsExporting(true);

    try {
      const html = generateExportHTML({
        title: selectedScript?.title || 'AI 绘本',
        artStyle: state.artStyle,
        voice: state.selectedVoice,
        pages: storyboard.map(p => ({
          pageNumber: p.pageNumber,
          title: p.title,
          narration: p.narration,
          imageUrl: p.imageUrl,
          audioUrl: p.audioUrl,
          audioDuration: p.audioDuration,
        })),
      });

      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedScript?.title || 'ai-picture-book'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);

      setExported(true);
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="card">
      <h2 className="card-title">📦 导出绘本</h2>
      <p className="card-description">
        将你的绘本导出为一个独立的 HTML5 动画页面。
        导出的文件可以在任何浏览器中打开，支持翻页动画和自动播放。
      </p>

      {/* 绘本信息概览 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
      }}>
        <InfoCard icon="📖" label="故事标题" value={selectedScript?.title || '未命名'} />
        <InfoCard icon="🖼️" label="插图数量" value={`${storyboard.length} 张`} />
        <InfoCard icon="🎨" label="画风" value={{
          'watercolor': '水彩',
          'cartoon': 'Q版卡通',
          '3d-pixar': '3D皮克斯',
          'flat': '扁平',
          'ink': '水墨',
        }[state.artStyle] || state.artStyle} />
        <InfoCard icon="🎙️" label="配音" value={state.selectedVoice} />
      </div>

      {/* 导出说明 */}
      <div style={{
        padding: 'var(--space-lg)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-xl)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.8,
      }}>
        <strong style={{ color: 'var(--text-primary)' }}>导出的 HTML 文件包含：</strong><br />
        ✅ 所有插图（内嵌 base64）· ✅ 所有配音<br />
        ✅ 翻页动画效果 · ✅ 自动播放 / 手动翻页<br />
        ✅ 文字显示切换 · ✅ 完全离线可用
      </div>

      {/* 导出按钮 */}
      <div style={{ textAlign: 'center' }}>
        {exported ? (
          <div className="pop-in">
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🎉</div>
            <p style={{ fontWeight: 700, marginBottom: 'var(--space-md)' }}>导出成功！检查你的下载文件夹吧</p>
            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={handleExport}>📥 再次下载</button>
              <button className="btn btn-primary" onClick={handleReset}>🔄 创建新绘本</button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            style={{ fontSize: '1.1rem', padding: 'var(--space-md) var(--space-2xl)' }}
            disabled={isExporting || storyboard.length === 0}
            onClick={handleExport}
          >
            {isExporting ? '⏳ 正在打包...' : '📥 导出 HTML 绘本'}
          </button>
        )}
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>← 返回预览</button>
        <div />
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{
      padding: 'var(--space-md)',
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{value}</div>
    </div>
  );
}
