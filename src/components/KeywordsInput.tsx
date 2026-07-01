// ============================================================
// 步骤 1: 关键词输入
// ============================================================

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ART_STYLES_CONFIG, PROVIDER_CONFIG } from '../services/api';
import type { ArtStyle, ApiProvider } from '../types';

export function KeywordsInput() {
  const { state, dispatch, doGenerateScripts } = useApp();
  const [localKeywords, setLocalKeywords] = useState(state.keywords);

  const canGenerate = localKeywords.trim().length > 0 && state.apiKey.trim().length > 0;

  const handleGenerate = () => {
    dispatch({ type: 'SET_KEYWORDS', payload: localKeywords });
    doGenerateScripts();
  };

  return (
    <div className="card">
      <h2 className="card-title">✏️ 告诉我你的故事想法</h2>
      <p className="card-description">
        输入几个关键词或一句话描述，AI 会为你创作 3 个不同风格的绘本剧本。
        比如："小兔子去月球冒险"、"森林里的魔法学校"、"猫咪和星星的故事"
      </p>

      {/* 关键词输入 */}
      <div className="input-group">
        <label>故事关键词 / 描述</label>
        <textarea
          className="text-input"
          placeholder="例如：勇敢的小猫、太空冒险、交到好朋友..."
          value={localKeywords}
          onChange={(e) => setLocalKeywords(e.target.value)}
          rows={3}
        />
        <p className="hint">越详细的描述，生成的故事越贴合你的想法</p>
      </div>

      {/* 模型选择 */}
      <div className="input-group">
        <label>文本模型</label>
        <div className="model-selector-row">
          <select
            className="provider-select-inline"
            value={state.textProvider}
            onChange={(e) => dispatch({ type: 'SET_TEXT_PROVIDER', payload: e.target.value as ApiProvider })}
          >
            {(Object.keys(PROVIDER_CONFIG) as ApiProvider[]).map((key) => (
              <option key={key} value={key}>
                {PROVIDER_CONFIG[key].name}
              </option>
            ))}
          </select>
          <select
            className="model-select-inline"
            value={state.textModel}
            onChange={(e) => dispatch({ type: 'SET_TEXT_MODEL', payload: e.target.value })}
          >
            {PROVIDER_CONFIG[state.textProvider].textModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}{m.free ? ' (免费)' : ''}
              </option>
            ))}
          </select>
        </div>
        <p className="hint">
          {PROVIDER_CONFIG[state.textProvider].description}
          {state.textProvider === 'dashscope' && ' — 推荐 Qwen Plus，免费额度充足'}
          {state.textProvider === 'deepseek' && ' — 超低价格，但不支持图片和配音生成'}
        </p>
      </div>

      {/* 页数选择 */}
      <div className="input-group">
        <label>绘本页数</label>
        <div className="page-count-selector">
          {[4, 8, 12, 16].map((count) => (
            <button
              key={count}
              className={`page-count-btn ${state.pageCount === count ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SET_PAGE_COUNT', payload: count })}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="hint">页数越多，故事越丰富，但生成时间也更长</p>
      </div>

      {/* 画风选择 */}
      <div className="input-group">
        <label>画风选择</label>
        <div className="option-grid">
          {ART_STYLES_CONFIG.map((style) => (
            <div
              key={style.id}
              className={`option-card ${state.artStyle === style.id ? 'selected' : ''}`}
              onClick={() => dispatch({ type: 'SET_ART_STYLE', payload: style.id as ArtStyle })}
            >
              <div className="option-icon">{style.preview}</div>
              <div className="option-name">{style.name}</div>
              <div className="option-desc">{style.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成按钮 */}
      <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
        <button
          className="btn btn-primary"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {state.apiKey ? '✨ 开始创作' : '请先输入 API Key'}
        </button>
      </div>
    </div>
  );
}
