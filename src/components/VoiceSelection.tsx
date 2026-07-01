// ============================================================
// 步骤 4: 配音选择
// ============================================================

import { useApp } from '../context/AppContext';
import { getVoiceOptions } from '../services/api';

export function VoiceSelection() {
  const { state, dispatch, prevStep, doGenerateVoices } = useApp();
  const voiceOptions = getVoiceOptions(state.ttsProvider);

  const handleGenerateVoices = () => {
    doGenerateVoices();
  };

  return (
    <div className="card">
      <h2 className="card-title">🎙️ 选择配音声音</h2>
      <p className="card-description">
        为你的绘本选择一个合适的朗读声音。AI 会为每一页自动配音。
      </p>

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

      {/* 试听提示 */}
      <div style={{
        padding: 'var(--space-md)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-lg)',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        textAlign: 'center',
      }}>
        💡 配音使用通义千问 CosyVoice 生成，语速稍慢适合绘本朗读风格。生成后可在预览环节试听。
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>
          ← 返回分镜
        </button>
        <button
          className="btn btn-primary"
          onClick={handleGenerateVoices}
        >
          🎵 开始生成配音
        </button>
      </div>
    </div>
  );
}
