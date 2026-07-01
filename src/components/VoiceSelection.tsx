// ============================================================
// 步骤 4: 配音选择 — 全屏沉浸式
// ============================================================

import { useApp } from '../context/AppContext';
import { getVoiceOptions } from '../services/api';

export function VoiceSelection() {
  const { state, dispatch, prevStep, doGenerateVoices } = useApp();
  const voiceOptions = getVoiceOptions(state.ttsProvider);

  return (
    <div className="glass-panel">
      <div className="section-hero">
        <span className="section-icon">🎙️</span>
        <h2 className="section-title">选择配音声音</h2>
        <p className="section-subtitle">
          为你的绘本选择一个合适的朗读声音。AI 会为每一页自动配音。
        </p>
      </div>

      {/* 声音选择网格 */}
      <div className="voice-grid">
        {voiceOptions.map((voice) => (
          <div
            key={voice.id}
            className={`voice-card ${state.selectedVoice === voice.id ? 'selected' : ''}`}
            onClick={() => dispatch({ type: 'SET_VOICE', payload: voice.id })}
          >
            <div className="voice-icon">
              {voice.gender === 'female' ? '👩' : '👨'}
            </div>
            <div className="voice-name">{voice.name}</div>
            <div className="voice-desc">{voice.description}</div>
            <span className="voice-tag">{voice.style}</span>
          </div>
        ))}
      </div>

      {/* 提示 */}
      <div className="info-box" style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        💡 配音使用通义千问 CosyVoice 生成，语速稍慢适合绘本朗读风格。生成后可在预览环节试听。
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>
          ← 返回分镜
        </button>
        <button
          className="btn btn-primary"
          onClick={doGenerateVoices}
        >
          🎵 开始生成配音
        </button>
      </div>
    </div>
  );
}
