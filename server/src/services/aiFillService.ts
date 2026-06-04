// ================================================================
// AI Fill Service
// 调用 DeepSeek API 为自定义模块自动生成学习内容
// ================================================================

import fs from 'fs';
import path from 'path';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const REQUEST_TIMEOUT_MS = 15000;

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
}

function buildPrompt(moduleName: string, moduleDescription: string): string {
  return `你是一个学习内容规划专家。

用户已定义了一个学习模块，信息如下：
- 模块名称：${moduleName}
- 模块介绍：${moduleDescription}

请你严格基于以上模块名称和模块介绍，规划具体的学习内容。输出的 moduleDescription 必须紧扣用户的模块介绍进行扩写（50~120字），不得偏离。严格按照以下JSON结构返回，不要包含任何额外解释、markdown代码块标记或注释：

{
  "moduleDescription": "基于用户模块介绍扩写的完整介绍（50~120字）",
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
- 大结点和小结点的内容必须与"${moduleName}"和"${moduleDescription}"紧密相关
- 每个小结点需提供真实、有学习价值的URL链接
- 直接输出JSON对象，不要包装在数组中`;
}

<<<<<<< Updated upstream
export async function fillModule(moduleName: string): Promise<FillModuleResponse> {
=======
/** 返回降级响应（AI 不可用时） */
function buildFallbackResponse(): FillModuleResponse {
  return {
    moduleDescription: '',
    nodes: [],
    fallback: true,
    fallbackMessage: FALLBACK_MESSAGE,
  };
}

export async function fillModule(moduleName: string, moduleDescription: string): Promise<FillModuleResponse> {
>>>>>>> Stashed changes
  console.log(`[AIFillService] 开始为模块「${moduleName}」生成内容...`);

  if (!DEEPSEEK_API_KEY) {
    throw new Error('未找到 DeepSeek API Key，请检查 key.json 文件');
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
        messages: [{ role: 'user', content: buildPrompt(moduleName, moduleDescription) }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`[AIFillService] API 返回错误: ${response.status}`);
      throw new Error(`AI 服务返回错误 (${response.status})`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error('[AIFillService] API 返回空内容');
      throw new Error('AI 返回内容为空');
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

    const parsed: FillModuleResponse = JSON.parse(cleaned);

    // 校验数据结构
    if (!parsed.moduleDescription || !Array.isArray(parsed.nodes)) {
      throw new Error('AI 返回数据结构不完整：缺少 moduleDescription 或 nodes');
    }

    if (parsed.nodes.length < 3) {
      throw new Error(`AI 返回的大结点数量不足：期望 3 个，实际 ${parsed.nodes.length} 个`);
    }

    for (let i = 0; i < 3; i++) {
      const node = parsed.nodes[i];
      if (!node.nodeName || !Array.isArray(node.subNodes)) {
        throw new Error(`第 ${i + 1} 个大结点数据结构不完整`);
      }
      if (node.subNodes.length < 3) {
        throw new Error(`大结点「${node.nodeName}」的小结点数量不足：期望 3 个，实际 ${node.subNodes.length} 个`);
      }
      for (let j = 0; j < 3; j++) {
        const sub = node.subNodes[j];
        if (!sub.subName) {
          throw new Error(`大结点「${node.nodeName}」的第 ${j + 1} 个小结点缺少名称`);
        }
        if (!sub.link || (!sub.link.startsWith('http://') && !sub.link.startsWith('https://'))) {
          // 如果链接无效，给一个占位
          sub.link = `https://www.bilibili.com/search?keyword=${encodeURIComponent(sub.subName)}`;
        }
      }
    }

    console.log(`[AIFillService] 内容生成成功 - 模块「${moduleName}」`);
    return parsed;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('[AIFillService] 请求超时');
      throw new Error('AI 服务请求超时');
    }
    if (error instanceof SyntaxError) {
      console.error('[AIFillService] JSON 解析失败:', error.message);
      throw new Error('AI 返回数据格式异常');
    }
    console.error('[AIFillService] 生成失败:', error.message);
    throw error;
  }
}
