// ============================================================
// 步骤 2: 剧本选择
// ============================================================

import { useApp } from '../context/AppContext';

export function ScriptSelection() {
  const { state, dispatch, nextStep, prevStep, doGenerateIllustrations } = useApp();
  const { generatedScripts, selectedScriptIndex } = state;

  const handleSelectScript = (index: number) => {
    dispatch({ type: 'SELECT_SCRIPT', payload: index });
  };

  const handleConfirmAndGenerate = () => {
    if (selectedScriptIndex === null) return;
    doGenerateIllustrations();
  };

  if (generatedScripts.length === 0) {
    return (
      <div className="card">
        <p className="card-description">还没有生成剧本，请先返回上一步输入关键词。</p>
        <button className="btn btn-secondary" onClick={prevStep}>← 返回</button>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">📖 选择一个你喜欢的剧本</h2>
      <p className="card-description">
        AI 根据你的关键词创作了 {generatedScripts.length} 个不同风格的故事。
        点击选择一个，然后开始绘制分镜插图。
      </p>

      <div className="script-cards">
        {generatedScripts.map((script, idx) => (
          <div
            key={script.id}
            className={`script-card ${selectedScriptIndex === idx ? 'selected' : ''}`}
            onClick={() => handleSelectScript(idx)}
          >
            <div className="script-title">
              <span>{selectedScriptIndex === idx ? '✅' : '📚'}</span>
              <span>{script.title}</span>
            </div>
            <div className="script-summary">{script.summary}</div>
            <div className="script-preview">
              {script.pages.map((page) => (
                <div key={page.pageNumber} className="page-preview">
                  <div className="page-num">P{page.pageNumber}</div>
                  <div>{page.title}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 导航 */}
      <div className="step-navigation">
        <button className="btn btn-ghost" onClick={prevStep}>
          ← 修改关键词
        </button>
        <button
          className="btn btn-primary"
          disabled={selectedScriptIndex === null}
          onClick={handleConfirmAndGenerate}
        >
          🎨 开始绘制分镜
        </button>
      </div>
    </div>
  );
}
