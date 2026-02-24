import { SkillNode } from '../types/skill';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// 支持的大模型提供商
export enum LLMProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  DEEPSEEK = 'deepseek',
  VOLCANO = 'volcano',
  LOCAL = 'local'
}

interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

interface SkillTreeGenerationRequest {
  domain: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  maxDepth?: number;
  includeResources?: boolean;
}

// 技能树生成提示词模板（优化版，减少token消耗）
  const SKILL_TREE_PROMPT_TEMPLATE = (domain: string, level: string, language: string = '中文') => `
为"${domain}"领域生成${level}级别技能树，使用${language}。

要求：
1. 结构化技能树：根节点、子节点、子子节点
2. 每个节点：名称、描述、资源链接（3个高质量资源）
3. 资源类型：文档、视频、课程、文章
4. 树深度：3-4层，节点总数：15-25个
5. 学习路径：基础到高级
6. 严格JSON格式

返回格式：
{
  "id": "id",
  "name": "${domain}",
  "description": "${domain}技能学习路径",
  "children": [
    {
      "id": "stage1",
      "name": "基础入门",
      "description": "学习基础概念",
      "links": [
        {"title": "官方文档", "url": "https://example.com/docs", "type": "documentation"}
      ],
      "children": [
        {
          "id": "stage1-1",
          "name": "基础语法",
          "description": "掌握语法结构",
          "links": [
            {"title": "语法教程", "url": "https://example.com/syntax", "type": "documentation"}
          ]
        }
      ]
    }
  ]
}

重要：只返回JSON，不要额外文本。`;

export class LLMService {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  // 生成技能树
  async generateSkillTree(request: SkillTreeGenerationRequest): Promise<SkillNode> {
    const prompt = SKILL_TREE_PROMPT_TEMPLATE(
      request.domain,
      request.level,
      request.language
    );

    try {
      const response = await this.callLLM(prompt);
      const skillTree = this.parseLLMResponse(response);
      
      // 确保ID唯一性
      return this.ensureUniqueIds(skillTree);
    } catch (error) {
      console.error('LLM skill tree generation failed:', error);
      throw new Error(`Failed to generate skill tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 调用大模型API
  private async callLLM(prompt: string): Promise<string> {
    switch (this.config.provider) {
      case LLMProvider.OPENAI:
        return await this.callOpenAI(prompt);
      case LLMProvider.DEEPSEEK:
        return await this.callDeepSeek(prompt);
      case LLMProvider.ANTHROPIC:
        return await this.callAnthropic(prompt);
      case LLMProvider.VOLCANO:
        return await this.callVolcanoEngine(prompt);
      case LLMProvider.LOCAL:
        return await this.callLocalModel(prompt);
      default:
        throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
    }
  }

  // OpenAI API调用
  private async callOpenAI(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // DeepSeek API调用
  private async callDeepSeek(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL || 'https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Anthropic API调用
  private async callAnthropic(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // 火山引擎API调用
  private async callVolcanoEngine(prompt: string): Promise<string> {
    const response = await fetch(`${this.config.baseURL || 'https://ark.cn-beijing.volces.com/api/v3'}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'doubao-seed-1-8-251228',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: prompt
              }
            ]
          }
        ],
        max_output_tokens: 8000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Volcano Engine API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // 火山引擎返回格式解析
    if (data.output && data.output.length > 0) {
      // 查找包含实际回复的message对象
      const messageOutput = data.output.find((output: any) => output.type === 'message' && output.role === 'assistant');
      
      if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
        const content = messageOutput.content;
        // 查找text类型的回复
        const textContent = content.find((item: any) => item.type === 'output_text');
        if (textContent && textContent.text) {
          return textContent.text;
        }
      }
      
      // 如果message不存在或状态为incomplete，尝试从reasoning中提取
      const reasoningOutput = data.output.find((output: any) => output.type === 'reasoning');
      if (reasoningOutput && reasoningOutput.summary && reasoningOutput.summary.length > 0) {
        const summary = reasoningOutput.summary.find((item: any) => item.type === 'summary_text');
        if (summary && summary.text) {
          // 尝试从summary中提取JSON
          const jsonMatch = summary.text.match(/```json\n([\s\S]*?)\n```/) || 
                           summary.text.match(/```\n([\s\S]*?)\n```/) ||
                           summary.text.match(/```([\s\S]*?)```/) ||
                           summary.text.match(/\{["\s\w:,./\-\[\]{}]*\}/);
          
          if (jsonMatch) {
            return jsonMatch[0];
          }
          
          return summary.text;
        }
      }
    }
    
    throw new Error('Invalid response format from Volcano Engine');
  }

  // 本地模型调用（支持Ollama等）
  private async callLocalModel(prompt: string): Promise<string> {
    const response = await fetch(this.config.baseURL || 'http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local model API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  }

  // 解析LLM响应为SkillNode
  private parseLLMResponse(response: string): SkillNode {
    try {
      // 清理响应文本，移除可能的Markdown标记
      let cleanedResponse = response.trim();
      
      // 尝试从JSON代码块中提取
      const jsonMatch = cleanedResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       cleanedResponse.match(/```\n([\s\S]*?)\n```/) ||
                       cleanedResponse.match(/```([\s\S]*?)```/);
      
      let jsonString = jsonMatch ? jsonMatch[1] : cleanedResponse;
      
      // 进一步清理：移除可能的JSON前缀说明
      jsonString = jsonString.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      
      // 尝试解析JSON
      const skillTree = JSON.parse(jsonString);
      
      // 验证基本结构
      if (!skillTree.name || !skillTree.description) {
        throw new Error('Invalid skill tree structure from LLM');
      }
      
      // 验证链接格式（如果存在）
      this.validateSkillTreeStructure(skillTree);
      
      return skillTree as SkillNode;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      console.log('Raw response:', response);
      
      // 尝试创建基础技能树作为fallback
      return this.createFallbackSkillTree(response);
    }
  }

  // 验证技能树结构
  private validateSkillTreeStructure(skillTree: any): void {
    const validateNode = (node: any) => {
      if (!node.id || !node.name || !node.description) {
        throw new Error('Invalid node structure: missing required fields');
      }
      
      if (node.links) {
        if (!Array.isArray(node.links)) {
          throw new Error('Links must be an array');
        }
        
        for (const link of node.links) {
          if (!link.title || !link.url || !link.type) {
            throw new Error('Invalid link structure');
          }
          
          const validTypes = ['video', 'article', 'course', 'documentation'];
          if (!validTypes.includes(link.type)) {
            throw new Error(`Invalid link type: ${link.type}`);
          }
        }
      }
      
      if (node.children) {
        if (!Array.isArray(node.children)) {
          throw new Error('Children must be an array');
        }
        
        for (const child of node.children) {
          validateNode(child);
        }
      }
    };
    
    validateNode(skillTree);
  }

  // 创建fallback技能树
  private createFallbackSkillTree(domainHint: string): SkillNode {
    console.warn('Creating fallback skill tree due to parsing failure');
    
    // 从响应中提取领域名称
    const domainMatch = domainHint.match(/"([^"]+)"领域/) || 
                       domainHint.match(/为(.+?)生成/) ||
                       domainHint.match(/领域[:：]\s*(.+)/);
    
    const domain = domainMatch ? domainMatch[1] : '未知领域';
    
    return {
      id: generateId(),
      name: domain,
      description: `${domain}技能学习路径（自动生成）`,
      children: [
        {
          id: generateId(),
          name: '基础知识',
          description: '学习该领域的基础概念',
          links: [
            { title: '官方文档', url: 'https://example.com/docs', type: 'documentation' as const },
            { title: '入门教程', url: 'https://example.com/tutorial', type: 'course' as const }
          ]
        },
        {
          id: generateId(),
          name: '进阶学习',
          description: '深入掌握核心技能',
          links: [
            { title: '进阶指南', url: 'https://example.com/advanced', type: 'documentation' as const }
          ]
        }
      ]
    };
  }

  // 确保所有节点有唯一ID
  private ensureUniqueIds(skillTree: SkillNode): SkillNode {
    const traverseAndAssignIds = (node: SkillNode, parentId?: string): SkillNode => {
      const newId = parentId ? `${parentId}-${generateId()}` : generateId();
      
      return {
        ...node,
        id: newId,
        children: node.children?.map(child => traverseAndAssignIds(child, newId))
      };
    };
    
    return traverseAndAssignIds(skillTree);
  }
}