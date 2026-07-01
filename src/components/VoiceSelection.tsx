// ============================================================
// 步骤 4: 配音选择
// ============================================================

import { useApp } from '../context/AppContext';
import { getVoiceOptions, PROVIDER_CONFIG } from '../services/api';
import type { ApiProvider } from '../types';

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

      {/* TTS 提供商选择 */}
      <div className="input-group">
        <label>语音合成服务</label>
        <div className="model-selector-row">
          {(['dashscope', 'openai'] as ApiProvider[]).map((key) => (
            <button
              key={key}
              className={`page-count-btn ${state.ttsProvider === key ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SET_TTS_PROVIDER', payload: key })}
            >
              {PROVIDER_CONFIG[key].name}
            </button>
          ))}
        </div>
        <p className="hint">
          {state.ttsProvider === 'dashscope'
            ? '通义千问 CosyVoice — 中文效果好，有免费额度'
            : 'OpenAI TTS — 英文效果优秀，中文也可用'}
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
        💡 配音使用 AI 语音合成生成，语速稍慢适合绘本朗读风格。生成后可在预览环节试听。
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
