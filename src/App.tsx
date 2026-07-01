// ============================================================
// AI 绘本工坊 - 全屏沉浸式布局
// ============================================================

import { AppProvider, useApp } from './context/AppContext';
import type { Step } from './types';
import { KeywordsInput } from './components/KeywordsInput';
import { ScriptSelection } from './components/ScriptSelection';
import { StoryboardView } from './components/StoryboardView';
import { VoiceSelection } from './components/VoiceSelection';
import { BookPreview } from './components/BookPreview';
import { ExportPanel } from './components/ExportPanel';

// ---- 步骤配置 ----
const STEPS: { key: Step; label: string; icon: string }[] = [
  { key: 'keywords', label: '关键词', icon: '✏️' },
  { key: 'script', label: '选剧本', icon: '📖' },
  { key: 'storyboard', label: '画分镜', icon: '🎨' },
  { key: 'voice', label: '选配音', icon: '🎙️' },
  { key: 'preview', label: '预览', icon: '👀' },
  { key: 'export', label: '导出', icon: '📦' },
];

// ---- 背景装饰 ----
function AppBackground() {
  return (
    <div className="app-bg">
      <div className="bg-orb" />
      <div className="bg-orb" />
      <div className="bg-orb" />
    </div>
  );
}

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

// ---- 步骤导航 ----
function StepNav() {
  const { state, goToStep } = useApp();

  return (
    <nav className="step-nav">
      {STEPS.map((step, idx) => {
        const isActive = state.currentStep === step.key;
        const isCompleted = state.completedSteps.includes(step.key);

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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

// ---- 顶部导航栏 ----
function TopNav() {
  return (
    <header className="top-nav">
      <div className="nav-brand">
        <span className="nav-brand-icon">📚</span>
        <span className="nav-brand-text">AI 绘本工坊</span>
      </div>
      <StepNav />
    </header>
  );
}

// ---- 步骤内容路由 ----
function StepContent() {
  const { state } = useApp();

  const content = () => {
    switch (state.currentStep) {
      case 'keywords': return <KeywordsInput />;
      case 'script': return <ScriptSelection />;
      case 'storyboard': return <StoryboardView />;
      case 'voice': return <VoiceSelection />;
      case 'preview': return <BookPreview />;
      case 'export': return <ExportPanel />;
      default: return null;
    }
  };

  return (
    <div className="step-section fade-in" data-step={state.currentStep}>
      {content()}
    </div>
  );
}

// ---- 主应用 ----
function AppContent() {
  const { state } = useApp();

  return (
    <>
      <AppBackground />
      <div className="app-container">
        <TopNav />

        {state.error && (
          <div className="error-banner">
            <span>⚠️</span>
            <span>{state.error}</span>
          </div>
        )}

        <main className="main-content">
          <StepContent />
        </main>

        <LoadingOverlay />

        <footer className="app-footer">
          AI 绘本工坊 · 由通义千问驱动
        </footer>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
