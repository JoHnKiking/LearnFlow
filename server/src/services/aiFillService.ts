// ================================================================
// AI Fill Service
// 调用 DeepSeek API 为自定义模块自动生成学习内容
// 降级策略：DeepSeek 不可用时返回友好提示，而非 500 错误
// ================================================================

import fs from 'fs';
import path from 'path';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const REQUEST_TIMEOUT_MS = 15000;

// 降级提示文案
const FALLBACK_MESSAGE = '小怪兽繁忙，先学学已有领域吧~';

// 从 key.json 读取 API Key
let DEEPSEEK_API_KEY: string | null = null;
try {
  const keyPath = path.join(__dirname, '../../key.json');
  const keyFileContent = fs.readFileSync(keyPath, 'utf-8');
  const keyData = JSON.parse(keyFileContent);
  DEEPSEEK_API_KEY = keyData.DEEPSEEK_API_KEY;
} catch (error) {
  console.error('[AIFillService] 读取 key.json 失败:', error);
}

interface FillModuleResponse {
  moduleDescription: string;
  nodes: {
    nodeName: string;
    subNodes: {
      subName: string;
      link: string;
    }[];
  }[];
  /** 降级标记：AI 不可用时为 true，前端应展示 fallbackMessage */
  fallback?: boolean;
  fallbackMessage?: string;
}

function buildPrompt(moduleName: string): string {
  return `你是一个学习内容规划专家。
请为学习模块《${moduleName}》生成以下内容，严格按照JSON格式返回，不要包含任何额外解释、markdown代码块标记或注释：

{
  "moduleDescription": "模块介绍（50~120字）",
  "nodes": [
    {
      "nodeName": "大结点1名称",
      "subNodes": [
        { "subName": "小结点1名称", "link": "https://example.com/学习链接1" },
        { "subName": "小结点2名称", "link": "https://example.com/学习链接2" },
        { "subName": "小结点3名称", "link": "https://example.com/学习链接3" }
      ]
    },
    {
      "nodeName": "大结点2名称",
      "subNodes": [
        { "subName": "小结点1名称", "link": "https://example.com/学习链接1" },
        { "subName": "小结点2名称", "link": "https://example.com/学习链接2" },
        { "subName": "小结点3名称", "link": "https://example.com/学习链接3" }
      ]
    },
    {
      "nodeName": "大结点3名称",
      "subNodes": [
        { "subName": "小结点1名称", "link": "https://example.com/学习链接1" },
        { "subName": "小结点2名称", "link": "https://example.com/学习链接2" },
        { "subName": "小结点3名称", "link": "https://example.com/学习链接3" }
      ]
    }
  ]
}

要求：
- 共3个大结点，每个大结点下3个小结点
- 每个小结点需提供真实、有学习价值的URL链接
- 模块介绍与学习地图现有默认模块风格对齐
- 直接输出JSON对象，不要包装在数组中`;
}

/** 返回降级响应（AI 不可用时） */
function buildFallbackResponse(): FillModuleResponse {
  return {
    moduleDescription: '',
    nodes: [],
    fallback: true,
    fallbackMessage: FALLBACK_MESSAGE,
  };
}

export async function fillModule(moduleName: string): Promise<FillModuleResponse> {
  console.log(`[AIFillService] 开始为模块「${moduleName}」生成内容...`);

  // 降级检查 1：API Key 缺失
  if (!DEEPSEEK_API_KEY) {
    console.warn('[AIFillService] DeepSeek API Key 缺失，降级处理');
    return buildFallbackResponse();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: 'user', content: buildPrompt(moduleName) }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 降级检查 2：API 返回非 200
    if (!response.ok) {
      console.error(`[AIFillService] API 返回错误: ${response.status}，降级处理`);
      return buildFallbackResponse();
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    // 降级检查 3：返回内容为空
    if (!rawContent) {
      console.error('[AIFillService] API 返回空内容，降级处理');
      return buildFallbackResponse();
    }

    console.log(`[AIFillService] 原始响应 (前200字): ${rawContent.substring(0, 200)}`);

    // 清理响应：移除可能的 markdown 代码块标记
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
      cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    let parsed: FillModuleResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // 降级检查 4：JSON 解析失败
      console.error('[AIFillService] JSON 解析失败，降级处理');
      return buildFallbackResponse();
    }

    // 校验数据结构
    if (!parsed.moduleDescription || !Array.isArray(parsed.nodes)) {
      console.error('[AIFillService] 数据结构不完整，降级处理');
      return buildFallbackResponse();
    }

    if (parsed.nodes.length < 3) {
      console.error(`[AIFillService] 大结点数量不足 (${parsed.nodes.length}/3)，降级处理`);
      return buildFallbackResponse();
    }

    for (let i = 0; i < 3; i++) {
      const node = parsed.nodes[i];
      if (!node.nodeName || !Array.isArray(node.subNodes)) {
        console.error(`[AIFillService] 第 ${i + 1} 个大结点数据不完整，降级处理`);
        return buildFallbackResponse();
      }
      if (node.subNodes.length < 3) {
        console.error(`[AIFillService] 大结点「${node.nodeName}」小结点不足，降级处理`);
        return buildFallbackResponse();
      }
      for (let j = 0; j < 3; j++) {
        const sub = node.subNodes[j];
        if (!sub.subName) {
          console.error('[AIFillService] 小结点缺名称，降级处理');
          return buildFallbackResponse();
        }
        if (!sub.link || (!sub.link.startsWith('http://') && !sub.link.startsWith('https://'))) {
          sub.link = `https://www.bilibili.com/search?keyword=${encodeURIComponent(sub.subName)}`;
        }
      }
    }

    console.log(`[AIFillService] 内容生成成功 - 模块「${moduleName}」`);
    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    // 降级检查 5：超时或网络错误
    if (error.name === 'AbortError') {
      console.error('[AIFillService] 请求超时，降级处理');
      return buildFallbackResponse();
    }
    console.error('[AIFillService] 生成失败，降级处理:', error.message);
    return buildFallbackResponse();
  }
}
