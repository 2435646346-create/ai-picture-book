// ============================================================
// 全局状态管理 - React Context
// ============================================================

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { AppState, Step, ArtStyle, StoryScript, StoryboardPage, ApiProvider } from '../types';
import {
  generateScripts,
  generateAllIllustrations,
  generateAllVoices,
  PROVIDER_CONFIG,
} from '../services/api';

// ---- 步骤顺序 ----
const STEP_ORDER: Step[] = ['keywords', 'script', 'storyboard', 'voice', 'preview', 'export'];

// ---- 初始状态 ----
const initialState: AppState = {
  currentStep: 'keywords',
  completedSteps: [],
  keywords: '',
  pageCount: 8,
  artStyle: 'watercolor',
  generatedScripts: [],
  selectedScriptIndex: null,
  storyboard: [],
  selectedVoice: 'longxiaochun',
  audioPages: [],
  textProvider: (localStorage.getItem('ai-picture-book-text-provider') as ApiProvider) || 'dashscope',
  imageProvider: (localStorage.getItem('ai-picture-book-image-provider') as ApiProvider) || 'dashscope',
  ttsProvider: (localStorage.getItem('ai-picture-book-tts-provider') as ApiProvider) || 'dashscope',
  textModel: localStorage.getItem('ai-picture-book-text-model') || 'qwen-plus',
  isLoading: false,
  loadingMessage: '',
  error: null,
};

// ---- Action 类型 ----
type Action =
  | { type: 'SET_TEXT_PROVIDER'; payload: ApiProvider }
  | { type: 'SET_IMAGE_PROVIDER'; payload: ApiProvider }
  | { type: 'SET_TTS_PROVIDER'; payload: ApiProvider }
  | { type: 'SET_TEXT_MODEL'; payload: string }
  | { type: 'SET_KEYWORDS'; payload: string }
  | { type: 'SET_PAGE_COUNT'; payload: number }
  | { type: 'SET_ART_STYLE'; payload: ArtStyle }
  | { type: 'SET_SCRIPTS'; payload: StoryScript[] }
  | { type: 'SELECT_SCRIPT'; payload: number }
  | { type: 'SET_STORYBOARD'; payload: StoryboardPage[] }
  | { type: 'UPDATE_STORYBOARD_PAGE'; payload: { index: number; updates: Record<string, any> } }
  | { type: 'SET_VOICE'; payload: string }
  | { type: 'SET_AUDIO_PAGES'; payload: StoryboardPage[] }
  | { type: 'GO_TO_STEP'; payload: Step }
  | { type: 'COMPLETE_STEP'; payload: Step }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// ---- Reducer ----
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TEXT_PROVIDER': {
      localStorage.setItem('ai-picture-book-text-provider', action.payload);
      const firstModel = PROVIDER_CONFIG[action.payload].textModels[0]?.id ?? '';
      localStorage.setItem('ai-picture-book-text-model', firstModel);
      return { ...state, textProvider: action.payload, textModel: firstModel };
    }

    case 'SET_IMAGE_PROVIDER':
      localStorage.setItem('ai-picture-book-image-provider', action.payload);
      return { ...state, imageProvider: action.payload };

    case 'SET_TTS_PROVIDER':
      localStorage.setItem('ai-picture-book-tts-provider', action.payload);
      return { ...state, ttsProvider: action.payload };

    case 'SET_TEXT_MODEL':
      localStorage.setItem('ai-picture-book-text-model', action.payload);
      return { ...state, textModel: action.payload };

    case 'SET_KEYWORDS':
      return { ...state, keywords: action.payload };

    case 'SET_PAGE_COUNT':
      return { ...state, pageCount: action.payload };

    case 'SET_ART_STYLE':
      return { ...state, artStyle: action.payload };

    case 'SET_SCRIPTS':
      return { ...state, generatedScripts: action.payload };

    case 'SELECT_SCRIPT':
      return { ...state, selectedScriptIndex: action.payload };

    case 'SET_STORYBOARD':
      return { ...state, storyboard: action.payload };

    case 'UPDATE_STORYBOARD_PAGE': {
      const newStoryboard = [...state.storyboard];
      const { index, updates } = action.payload;
      const existing = newStoryboard[index];
      if (existing) {
        newStoryboard[index] = { ...existing, ...updates } as StoryboardPage;
      }
      return { ...state, storyboard: newStoryboard };
    }

    case 'SET_VOICE':
      return { ...state, selectedVoice: action.payload };

    case 'SET_AUDIO_PAGES':
      return { ...state, audioPages: action.payload };

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.payload };

    case 'COMPLETE_STEP': {
      const completed = state.completedSteps.includes(action.payload)
        ? state.completedSteps
        : [...state.completedSteps, action.payload];
      return { ...state, completedSteps: completed };
      }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload.isLoading, loadingMessage: action.payload.message || '' };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

// ---- Context 类型 ----
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // 便捷方法
  goToStep: (step: Step) => void;
  nextStep: () => void;
  prevStep: () => void;
  // 业务方法
  doGenerateScripts: () => Promise<void>;
  doGenerateIllustrations: () => Promise<void>;
  doGenerateVoices: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// ---- Provider ----
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const goToStep = useCallback((step: Step) => {
    dispatch({ type: 'GO_TO_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.currentStep);
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
      const next = STEP_ORDER[idx + 1];
      if (next) dispatch({ type: 'GO_TO_STEP', payload: next });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const idx = STEP_ORDER.indexOf(state.currentStep);
    if (idx > 0) {
      const prev = STEP_ORDER[idx - 1];
      if (prev) dispatch({ type: 'GO_TO_STEP', payload: prev });
    }
  }, [state.currentStep]);

  // 生成剧本
  const doGenerateScripts = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: 'AI 正在创作故事...' } });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const scripts = await generateScripts(
        state.textProvider,
        state.textModel,
        state.keywords,
        state.pageCount,
        state.artStyle,
      );
      dispatch({ type: 'SET_SCRIPTS', payload: scripts });
      dispatch({ type: 'COMPLETE_STEP', payload: 'keywords' });
      dispatch({ type: 'GO_TO_STEP', payload: 'script' });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: `剧本生成失败：${err.message || '未知错误'}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [state.textProvider, state.textModel, state.keywords, state.pageCount, state.artStyle]);

  // 生成插图
  const doGenerateIllustrations = useCallback(async () => {
    if (state.selectedScriptIndex === null) return;
    const script = state.generatedScripts[state.selectedScriptIndex];
    if (!script) return;

    // 初始化分镜
    const initialStoryboard: StoryboardPage[] = script.pages.map(page => ({
      ...page,
      imageUrl: '',
      imageStatus: 'pending' as const,
      audioUrl: '',
      audioStatus: 'pending' as const,
      audioDuration: 0,
    }));
    dispatch({ type: 'SET_STORYBOARD', payload: initialStoryboard });
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: '正在绘制插图... 0/' + script.pages.length } });

    try {
      await generateAllIllustrations(
        script.pages,
        state.artStyle,
        (index, status, imageUrl) => {
          dispatch({
            type: 'UPDATE_STORYBOARD_PAGE',
            payload: {
              index,
              updates: {
                imageStatus: status,
                imageUrl: imageUrl || '',
              },
            },
          });
          const doneCount = initialStoryboard.filter((_, i) =>
            i < index || (i === index && status === 'done')
          ).length;
          dispatch({
            type: 'SET_LOADING',
            payload: { isLoading: true, message: `正在绘制插图... ${status === 'done' ? doneCount : doneCount}/${script.pages.length}` },
          });
        },
      );
      dispatch({ type: 'COMPLETE_STEP', payload: 'script' });
      dispatch({ type: 'GO_TO_STEP', payload: 'storyboard' });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: `插图生成失败：${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [state.imageProvider, state.selectedScriptIndex, state.generatedScripts, state.artStyle]);

  // 生成配音
  const doGenerateVoices = useCallback(async () => {
    const script = state.selectedScriptIndex !== null ? state.generatedScripts[state.selectedScriptIndex] : null;
    if (!script) return;

    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message: '正在录制配音... 0/' + script.pages.length } });

    try {
      await generateAllVoices(
        script.pages,
        state.selectedVoice,
        (index, status, audioUrl, duration) => {
          dispatch({
            type: 'UPDATE_STORYBOARD_PAGE',
            payload: {
              index,
              updates: {
                audioStatus: status,
                audioUrl: audioUrl || '',
                audioDuration: duration || 0,
              },
            },
          });
          dispatch({
            type: 'SET_LOADING',
            payload: { isLoading: true, message: `正在录制配音... ${status === 'done' ? index + 1 : index}/${script.pages.length}` },
          });
        },
      );
      dispatch({ type: 'COMPLETE_STEP', payload: 'storyboard' });
      dispatch({ type: 'GO_TO_STEP', payload: 'voice' });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: `配音生成失败：${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
    }
  }, [state.ttsProvider, state.selectedScriptIndex, state.generatedScripts, state.selectedVoice]);

  const value: AppContextType = {
    state,
    dispatch,
    goToStep,
    nextStep,
    prevStep,
    doGenerateScripts,
    doGenerateIllustrations,
    doGenerateVoices,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ---- Hook ----
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
