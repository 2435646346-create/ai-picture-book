// ============================================================
// AI 绘本工坊 - 主应用
// ============================================================

import { AppProvider, useApp } from './context/AppContext';
import type { Step, ApiProvider } from './types';
import { KeywordsInput } from './components/KeywordsInput';
import { ScriptSelection } from './components/ScriptSelection';
import { StoryboardView } from './components/StoryboardView';
import { VoiceSelection } from './components/VoiceSelection';
import { BookPreview } from './components/BookPreview';
import { ExportPanel } from './components/ExportPanel';
import { PROVIDER_CONFIG } from './services/api';

// ---- 步骤配置 ----
const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'keywords', label: '关键词', icon: '✏️' },
  { key: 'script', label: '选剧本', icon: '📖' },
  { key: 'storyboard', label: '画分镜', icon: '🎨' },
  { key: 'voice', label: '选配音', icon: '🎙️' },
  { key: 'preview', label: '预览', icon: '👀' },
  { key: 'export', label: '导出', icon: '📦' },
];

// ---- 加载遮罩 ----
function LoadingOverlay() {
  const { state } = useApp();
  if (!state.isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-spinner" />
      <div className="loading-message">
        {state.loadingMessage}
        <span className="loading-dots" />
      </div>
    </div>
  );
}

// ---- API Key 栏 ----
function ApiKeyBar() {
  const { state, dispatch } = useApp();
  const providerCfg = PROVIDER_CONFIG[state.textProvider];

  return (
    <div className="api-key-bar">
      <div className={`key-status ${state.apiKey ? 'set' : ''}`} />
      <select
        className="provider-select"
        value={state.textProvider}
        onChange={(e) => dispatch({ type: 'SET_TEXT_PROVIDER', payload: e.target.value as ApiProvider })}
        title="文本生成提供商"
      >
        {(Object.keys(PROVIDER_CONFIG) as ApiProvider[]).map((key) => (
          <option key={key} value={key}>
            {PROVIDER_CONFIG[key].name}
          </option>
        ))}
      </select>
      <input
        type="password"
        placeholder={providerCfg.keyPlaceholder}
        value={state.apiKey}
        onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
      />
      <a
        href={providerCfg.keyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="key-link"
        title="获取 API Key"
      >
        🔑
      </a>
    </div>
  );
}

// ---- 步骤导航 ----
function StepNav() {
  const { state, goToStep } = useApp();

  return (
    <nav className="step-nav">
      {STEPS.map((step, idx) => {
        const isActive = state.currentStep === step.key;
        const isCompleted = state.completedSteps.includes(step.key);

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {idx > 0 && (
              <div className={`step-connector ${isCompleted || isActive ? 'completed' : ''}`} />
            )}
            <div
              className={`step-indicator ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isCompleted && goToStep(step.key)}
              role={isCompleted ? 'button' : undefined}
            >
              <span className="step-num">{isCompleted ? '✓' : idx + 1}</span>
              <span className="step-label">{step.label}</span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ---- 步骤内容路由 ----
function StepContent() {
  const { state } = useApp();

  const content = () => {
    switch (state.currentStep) {
      case 'keywords':
        return <KeywordsInput />;
      case 'script':
        return <ScriptSelection />;
      case 'storyboard':
        return <StoryboardView />;
      case 'voice':
        return <VoiceSelection />;
      case 'preview':
        return <BookPreview />;
      case 'export':
        return <ExportPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="fade-in" key={state.currentStep}>
      {content()}
    </div>
  );
}

// ---- 主应用 ----
function AppContent() {
  const { state } = useApp();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI 绘本工坊</h1>
        <p className="subtitle">输入关键词，一键生成 Q 版绘本动画</p>
      </header>

      <ApiKeyBar />
      <StepNav />

      {state.error && (
        <div className="error-banner">
          <span>⚠️</span>
          <span>{state.error}</span>
        </div>
      )}

      <main>
        <StepContent />
      </main>

      <LoadingOverlay />

      <footer style={{
        textAlign: 'center',
        padding: '32px 0',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
      }}>
        AI 绘本工坊 · 支持通义千问 / DeepSeek / OpenAI
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
