// ============================================================
// AI 绘本工坊 - 类型定义
// ============================================================

/** 应用步骤 */
export type Step = 'keywords' | 'script' | 'storyboard' | 'voice' | 'preview' | 'export';

/** API 提供商 */
export type ApiProvider = 'dashscope' | 'openai' | 'deepseek';

/** 提供商配置 */
export interface ProviderConfig {
  id: ApiProvider;
  name: string;
  description: string;
  textModels: string[];
  supportsImage: boolean;
  supportsTTS: boolean;
  keyPlaceholder: string;
  keyUrl: string;
}

/** 画风预设 */
export type ArtStyle = 'watercolor' | 'cartoon' | '3d-pixar' | 'flat' | 'ink';

/** 画风配置 */
export interface ArtStyleConfig {
  id: ArtStyle;
  name: string;
  label: string;
  description: string;
  promptPrefix: string;
  preview: string; // emoji or icon
}

/** TTS 语音 */
export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female';
  style: string;
}

/** 单页故事内容 */
export interface StoryPage {
  pageNumber: number;
  title: string;
  narration: string;
  illustrationPrompt: string;
}

/** 完整剧本 */
export interface StoryScript {
  id: string;
  title: string;
  summary: string;
  pages: StoryPage[];
  style: string;
}

/** 分镜页面（含图片和音频） */
export interface StoryboardPage extends StoryPage {
  imageUrl: string;       // base64 data URL or remote URL
  imageStatus: 'pending' | 'generating' | 'done' | 'error';
  audioUrl: string;       // base64 data URL
  audioStatus: 'pending' | 'generating' | 'done' | 'error';
  audioDuration: number;  // seconds
}

/** 应用全局状态 */
export interface AppState {
  // 步骤导航
  currentStep: Step;
  completedSteps: Step[];

  // Step 1: 关键词
  keywords: string;
  pageCount: number;
  artStyle: ArtStyle;

  // Step 2: 剧本
  generatedScripts: StoryScript[];
  selectedScriptIndex: number | null;

  // Step 3: 分镜
  storyboard: StoryboardPage[];

  // Step 4: 配音
  selectedVoice: string;  // voice id
  audioPages: StoryboardPage[];

  // API 配置
  apiKey: string;
  textProvider: ApiProvider;    // 文本生成用哪家
  imageProvider: ApiProvider;   // 图片生成用哪家
  ttsProvider: ApiProvider;     // 语音合成用哪家
  textModel: string;            // 具体使用的文本模型

  // 全局加载状态
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
}

/** 导出用的绘本数据 */
export interface PictureBookData {
  title: string;
  artStyle: ArtStyle;
  voice: string;
  pages: {
    pageNumber: number;
    title: string;
    narration: string;
    imageUrl: string;
    audioUrl: string;
    audioDuration: number;
  }[];
}
