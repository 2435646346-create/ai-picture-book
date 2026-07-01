// ============================================================
// AI 绘本工坊 - 多提供商 API 服务层
// 支持: DashScope(通义千问) / DeepSeek
// API Key 已内置，用户无需输入
// ============================================================

import OpenAI from 'openai';
import type { StoryScript, StoryPage, ArtStyle, ApiProvider } from '../types';

// ============================================================
// 硬编码 API Key（已内置，用户无需输入）
// ============================================================

const BUILTIN_KEYS: Record<ApiProvider, string> = {
  dashscope: 'sk-ws-H.RXIDYPP.bt9j.MEUCICYerY8EZS6zEmp76aSKuCCsEzLmZQX8_XVWOPIybN_zAiEAkSUoMaLV8ReCk3MXrnCCaehR0HxPJza5nlwmI7jGNrc',
  deepseek: 'sk-f5c64d5df938490abe94cc47f20fed54',
};

// ============================================================
// 提供商配置
// ============================================================

export const PROVIDER_CONFIG: Record<ApiProvider, {
  name: string;
  description: string;
  textModels: { id: string; label: string; free?: boolean }[];
  supportsImage: boolean;
  supportsTTS: boolean;
  baseURL: string;
}> = {
  dashscope: {
    name: '通义千问',
    description: '阿里云 DashScope，有免费额度',
    textModels: [
      { id: 'qwen-plus', label: 'Qwen Plus', free: true },
      { id: 'qwen-turbo', label: 'Qwen Turbo', free: true },
      { id: 'qwen-max', label: 'Qwen Max' },
    ],
    supportsImage: true,
    supportsTTS: true,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
  deepseek: {
    name: 'DeepSeek',
    description: '深度求索，超低价格',
    textModels: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
    ],
    supportsImage: false,
    supportsTTS: false,
    baseURL: 'https://api.deepseek.com',
  },
};

// ============================================================
// 画风提示词
// ============================================================

const STYLE_PROMPTS: Record<ArtStyle, string> = {
  'watercolor': 'Warm watercolor illustration, soft pastel colors, gentle brushstrokes, children\'s picture book style, cute chibi characters with big eyes, dreamy atmosphere, white background',
  'cartoon': 'Cute Japanese chibi cartoon style, bold outlines, bright vibrant colors, big expressive eyes, small body, kawaii aesthetic, clean vector-like illustration, white background',
  '3d-pixar': '3D rendered cute character in Pixar Disney style, soft lighting, round smooth shapes, big expressive eyes, warm colors, cinematic quality, adorable chibi proportions, white background',
  'flat': 'Flat design illustration, minimalist cute characters, geometric shapes, soft pastel palette, clean modern style, children\'s book aesthetic, white background',
  'ink': 'Cute Chinese ink wash painting style, sumi-e inspired, delicate brushwork, soft ink gradients, charming chibi characters, traditional meets modern, white background',
};

// ============================================================
// 语音选项（DashScope CosyVoice）
// ============================================================

const DASHSCOPE_VOICES = [
  { id: 'longxiaochun', name: '小春', description: '温柔甜美的女声，最适合儿童绘本', gender: 'female' as const, style: '温柔甜美' },
  { id: 'longxiaoxia', name: '小夏', description: '活泼可爱的女声，元气满满', gender: 'female' as const, style: '活泼可爱' },
  { id: 'longxiaobai', name: '小白', description: '清澈纯净的女声，像姐姐讲故事', gender: 'female' as const, style: '清澈纯净' },
  { id: 'longlaotie', name: '老铁', description: '东北味儿的男声，幽默风趣', gender: 'male' as const, style: '幽默风趣' },
  { id: 'longshu', name: '书声', description: '温润儒雅的男声，适合睡前故事', gender: 'male' as const, style: '温润儒雅' },
  { id: 'longjing', name: '静听', description: '知性沉稳的女声，适合科普类', gender: 'female' as const, style: '知性沉稳' },
];

export function getVoiceOptions(_provider: ApiProvider) {
  return DASHSCOPE_VOICES;
}

// ============================================================
// OpenAI 兼容客户端（使用内置 Key）
// ============================================================

function getClient(provider: ApiProvider): OpenAI {
  const config = PROVIDER_CONFIG[provider];
  return new OpenAI({
    apiKey: BUILTIN_KEYS[provider],
    baseURL: config.baseURL,
    dangerouslyAllowBrowser: true,
  });
}

// ============================================================
// 1. 剧本生成（文本 LLM）
// ============================================================

export async function generateScripts(
  provider: ApiProvider,
  model: string,
  keywords: string,
  pageCount: number,
  artStyle: ArtStyle,
): Promise<StoryScript[]> {
  const client = getClient(provider);

  const styleName: Record<string, string> = {
    'watercolor': '温暖水彩', 'cartoon': '日系Q版卡通',
    '3d-pixar': '3D皮克斯', 'flat': '扁平简约', 'ink': '水墨国风',
  };

  const systemPrompt = `你是一个专业的儿童绘本作家。根据用户提供的关键词，创作3个不同风格的绘本剧本。
每个剧本必须有${pageCount}页。每页包含：标题、旁白文字（适合朗读，每页2-3句话）、插图描述。
插图描述要详细，适合AI绘画生成，必须体现"${styleName[artStyle]}"画风，角色要Q版可爱。

请严格按以下JSON格式输出，不要添加任何其他文字：
{
  "scripts": [
    {
      "title": "绘本标题",
      "summary": "一句话简介",
      "pages": [
        {
          "pageNumber": 1,
          "title": "页面标题",
          "narration": "旁白文字，适合儿童朗读",
          "illustrationPrompt": "Detailed English illustration prompt, describing the scene with cute chibi characters in ${styleName[artStyle]} style"
        }
      ]
    }
  ]
}`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `关键词：${keywords}\n页数：${pageCount}页\n画风：${styleName[artStyle]}` },
    ],
    temperature: 0.9,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content ?? '';
  if (!content) throw new Error('AI 未返回有效内容');

  let jsonStr = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) jsonStr = jsonMatch[1];

  const parsed = JSON.parse(jsonStr.trim());

  return parsed.scripts.map((script: any, idx: number) => ({
    id: `script-${idx}-${Date.now()}`,
    title: script.title,
    summary: script.summary,
    style: artStyle,
    pages: script.pages.map((page: any) => ({
      pageNumber: page.pageNumber,
      title: page.title,
      narration: page.narration,
      illustrationPrompt: page.illustrationPrompt,
    })),
  }));
}

// ============================================================
// 2. 插图生成（DashScope 通义万相）
// ============================================================

export async function generateIllustration(
  prompt: string,
  artStyle: ArtStyle,
): Promise<string> {
  return generateIllustrationDashScope(prompt, artStyle);
}

async function generateIllustrationDashScope(
  prompt: string,
  artStyle: ArtStyle,
): Promise<string> {
  const apiKey = BUILTIN_KEYS.dashscope;
  const stylePrefix = STYLE_PROMPTS[artStyle];
  const fullPrompt = `${stylePrefix}. Scene: ${prompt}. Maintain consistent cute chibi character design throughout.`;

  // 提交异步任务
  const submitRes = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx-v1',
      input: { prompt: fullPrompt },
      parameters: { size: '1280*720', n: 1 },
    }),
  });

  const submitData = await submitRes.json();
  if (!submitData.output?.task_id) {
    throw new Error(`DashScope 图片任务提交失败: ${submitData.message || JSON.stringify(submitData)}`);
  }

  // 轮询任务状态
  const taskId = submitData.output.task_id as string;
  const maxWait = 120_000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    await new Promise(r => setTimeout(r, 3000));

    const statusRes = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const statusData = await statusRes.json();

    if (statusData.output?.task_status === 'SUCCEEDED') {
      const imageUrl = statusData.output.results?.[0]?.url;
      if (!imageUrl) throw new Error('DashScope 未返回图片 URL');
      return imageUrl;
    }

    if (statusData.output?.task_status === 'FAILED') {
      throw new Error(`DashScope 图片生成失败: ${statusData.output.message || '未知错误'}`);
    }
  }

  throw new Error('DashScope 图片生成超时');
}

// ============================================================
// 3. 配音生成（DashScope CosyVoice TTS）
// ============================================================

export async function generateVoice(
  text: string,
  voiceId: string,
): Promise<{ audioUrl: string; duration: number }> {
  const client = getClient('dashscope');

  const response = await client.audio.speech.create({
    model: 'cosyvoice-v1',
    voice: voiceId as any,
    input: text,
    response_format: 'mp3',
    speed: 0.9,
  });

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]!);
  }
  const base64 = btoa(binary);
  const audioUrl = `data:audio/mp3;base64,${base64}`;

  const byteLength = arrayBuffer?.byteLength ?? 0;
  const duration = Math.max(2, (byteLength * 8) / (128 * 1000));

  return { audioUrl, duration };
}

// ============================================================
// 4. 批量生成插图（带进度回调）
// ============================================================

export async function generateAllIllustrations(
  pages: StoryPage[],
  artStyle: ArtStyle,
  onProgress: (index: number, status: 'generating' | 'done' | 'error', imageUrl?: string) => void,
): Promise<string[]> {
  const results: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    onProgress(i, 'generating');
    try {
      if (i > 0) await new Promise(r => setTimeout(r, 1500));
      const imageUrl = await generateIllustration(pages[i]!.illustrationPrompt, artStyle);
      results.push(imageUrl);
      onProgress(i, 'done', imageUrl);
    } catch (err) {
      console.error(`插图 ${i + 1} 生成失败:`, err);
      results.push('');
      onProgress(i, 'error');
    }
  }

  return results;
}

// ============================================================
// 5. 批量生成配音（带进度回调）
// ============================================================

export async function generateAllVoices(
  pages: StoryPage[],
  voiceId: string,
  onProgress: (index: number, status: 'generating' | 'done' | 'error', audioUrl?: string, duration?: number) => void,
): Promise<{ audioUrl: string; duration: number }[]> {
  const results: { audioUrl: string; duration: number }[] = [];

  for (let i = 0; i < pages.length; i++) {
    onProgress(i, 'generating');
    try {
      if (i > 0) await new Promise(r => setTimeout(r, 500));
      const { audioUrl, duration } = await generateVoice(pages[i]!.narration, voiceId);
      results.push({ audioUrl, duration });
      onProgress(i, 'done', audioUrl, duration);
    } catch (err) {
      console.error(`配音 ${i + 1} 生成失败:`, err);
      results.push({ audioUrl: '', duration: 0 });
      onProgress(i, 'error');
    }
  }

  return results;
}

// ============================================================
// 画风配置
// ============================================================

export const ART_STYLES_CONFIG = [
  { id: 'watercolor' as ArtStyle, name: '温暖水彩', label: '🎨 温暖水彩', description: '柔和水彩笔触，梦幻温暖的儿童绘本风格', promptPrefix: STYLE_PROMPTS['watercolor'], preview: '🎨' },
  { id: 'cartoon' as ArtStyle, name: '日系Q版', label: '✨ 日系Q版', description: '明亮可爱的日系卡通风格，大眼睛小身体', promptPrefix: STYLE_PROMPTS['cartoon'], preview: '✨' },
  { id: '3d-pixar' as ArtStyle, name: '3D皮克斯', label: ' 3D皮克斯', description: '皮克斯/迪士尼风格3D渲染，精致可爱', promptPrefix: STYLE_PROMPTS['3d-pixar'], preview: '🎬' },
  { id: 'flat' as ArtStyle, name: '扁平简约', label: '🔷 扁平简约', description: '现代扁平设计，几何形状，柔和配色', promptPrefix: STYLE_PROMPTS['flat'], preview: '🔷' },
  { id: 'ink' as ArtStyle, name: '水墨国风', label: '🖌️ 水墨国风', description: '中国水墨画风格，传统与可爱的结合', promptPrefix: STYLE_PROMPTS['ink'], preview: '️' },
];
