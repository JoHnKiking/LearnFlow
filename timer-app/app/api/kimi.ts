// Kimi API 集成服务

const KIMI_API_KEY = 'sk-u4FUU0Xt2pqjLIv5iA7jdPYEC9aAvMEhtJ86jP1GHFbDuv8I';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const KIMI_IMAGE_API_URL = 'https://api.moonshot.cn/v1/images/generations';

// 生成怪物形象
export async function generateMonsterImage(prompt: string): Promise<string> {
  try {
    const response = await fetch(KIMI_IMAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-image-1.0',
        prompt: `pixel art style monster, ${prompt}, cute but with personality, 8-bit graphics, vibrant colors, simple background`,
        n: 1,
        size: '512x512',
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].url;
  } catch (error) {
    console.error('Error generating monster image:', error);
    // 返回默认怪物图片
    return 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pixel%20style%20friendly%20monster%20with%20big%20eyes&image_size=square';
  }
}

// 生成怪物对话
export async function generateMonsterDialogue(personality: string, context: string): Promise<string> {
  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-003',
        messages: [
          {
            role: 'system',
            content: `你是一个有个性的怪物，性格特点：${personality}。你喜欢和人类交流，但有时候会调皮捣蛋。你不一定总是赞成人类学习，你也需要休息。请用简短、口语化的语言回复，不要太长。`
          },
          {
            role: 'user',
            content: `当前场景：${context}。请生成一句符合你性格的对话。`
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating monster dialogue:', error);
    // 返回默认对话
    return '嘿！你看起来很有精神嘛！';
  }
}

// 生成探险地图描述
export async function generateAdventureMap(domain: string): Promise<any> {
  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-003',
        messages: [
          {
            role: 'system',
            content: '你是一个游戏地图生成器，专门为学习探险游戏生成地图。请为指定领域生成一个包含5-7个节点的探险地图，每个节点有独特的学习内容和挑战。'
          },
          {
            role: 'user',
            content: `请为「${domain}」领域生成一个探险地图，包含：\n1. 地图名称\n2. 5-7个节点，每个节点包含：\n   - 节点类型（start/resource/monster/treasure/boss）\n   - 节点标题\n   - 节点描述\n   - 节点奖励（如果有）\n3. 节点之间的连接关系\n请以JSON格式返回，不要有其他说明文字。`
          }
        ],
        temperature: 0.6,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const mapData = JSON.parse(data.choices[0].message.content);
    return mapData;
  } catch (error) {
    console.error('Error generating adventure map:', error);
    // 返回默认地图
    return {
      name: `${domain}探险地图`,
      nodes: [
        {
          id: 'start',
          type: 'start',
          title: '起点',
          description: '你的学习探险开始了！',
          reward: '开始你的旅程',
        },
        {
          id: 'node1',
          type: 'resource',
          title: `${domain}基础`,
          description: '学习${domain}的基本概念',
          reward: '基础知识',
        },
        {
          id: 'node2',
          type: 'monster',
          title: '挑战怪物',
          description: '测试你的${domain}知识',
          reward: '经验值',
        },
        {
          id: 'node3',
          type: 'treasure',
          title: '知识宝藏',
          description: '发现${domain}的秘密',
          reward: '高级知识',
        },
      ],
      edges: [
        { from: 'start', to: 'node1' },
        { from: 'node1', to: 'node2' },
        { from: 'node2', to: 'node3' },
      ],
    };
  }
}

// 生成领域知识图谱
export async function generateKnowledgeGraph(domain: string): Promise<any> {
  try {
    const response = await fetch(KIMI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2-003',
        messages: [
          {
            role: 'system',
            content: '你是一个知识图谱生成器，专门为学习领域生成结构化的知识图谱。请为指定领域生成一个包含核心概念和它们之间关系的知识图谱。'
          },
          {
            role: 'user',
            content: `请为「${domain}」领域生成一个知识图谱，包含：\n1. 10-15个核心概念\n2. 概念之间的层级和依赖关系\n3. 每个概念的简要说明\n4. 推荐的学习顺序\n请以JSON格式返回，不要有其他说明文字。`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const graphData = JSON.parse(data.choices[0].message.content);
    return graphData;
  } catch (error) {
    console.error('Error generating knowledge graph:', error);
    // 返回默认知识图谱
    return {
      concepts: [
        {
          id: '1',
          name: `${domain}基础`,
          description: '${domain}的基本概念和原理',
          level: 1,
        },
        {
          id: '2',
          name: `${domain}进阶`,
          description: '${domain}的中级知识',
          level: 2,
          prerequisites: ['1'],
        },
        {
          id: '3',
          name: `${domain}高级`,
          description: '${domain}的高级应用',
          level: 3,
          prerequisites: ['2'],
        },
      ],
      learningOrder: ['1', '2', '3'],
    };
  }
}
