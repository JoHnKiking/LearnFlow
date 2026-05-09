export interface GameResult {
  success: boolean;
  rewards: {
    stamina: number;
    energy: number;
  };
  message: string;
  level: number;
  totalLevels: number;
}

export interface SokobanLevel {
  id: number;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  map: string[];
  answer: string[];
}

export const sokobanLevels: SokobanLevel[] = [
  {
    id: 1,
    name: '第一步',
    difficulty: 'easy',
    map: ['#####', '#@$.#', '#####'],
    answer: ['右'],
  },
  {
    id: 2,
    name: '小试牛刀',
    difficulty: 'easy',
    map: ['#######', '#     #', '#@$   #', '#  .  #', '#######'],
    answer: ['右', '右', '下'],
  },
  {
    id: 3,
    name: '简单推进',
    difficulty: 'easy',
    map: ['########', '#      #', '# @$   #', '#   .  #', '########'],
    answer: ['右', '右', '右', '下'],
  },
  {
    id: 4,
    name: '双箱入门',
    difficulty: 'easy',
    map: ['########', '#  .   #', '# $@$  #', '#  .   #', '########'],
    answer: ['右', '右', '下', '左', '左', '下'],
  },
  {
    id: 5,
    name: '双箱挑战',
    difficulty: 'easy',
    map: ['#########', '#       #', '# @$ $  #', '#   ..  #', '#########'],
    answer: ['右', '右', '下', '右', '下', '左', '左'],
  },
  {
    id: 6,
    name: '转角遇箱',
    difficulty: 'easy',
    map: ['########', '#  @   #', '# $    #', '#   $  #', '#  ..  #', '########'],
    answer: ['下', '左', '下', '右', '右', '上', '右', '下', '左'],
  },
  {
    id: 7,
    name: '之字形',
    difficulty: 'easy',
    map: ['#########', '#@      #', '# $     #', '#  $    #', '#   ... #', '#########'],
    answer: ['右', '右', '下', '右', '右', '下', '右', '下', '左', '左', '左'],
  },
  {
    id: 8,
    name: '迷宫初探',
    difficulty: 'easy',
    map: ['##########', '#@       #', '# $$$$$  #', '#        #', '# ...... #', '##########'],
    answer: ['右', '下', '右', '右', '右', '右', '上', '右', '下', '下', '左', '左', '左', '左', '左'],
  },
  {
    id: 9,
    name: '三箱齐推',
    difficulty: 'easy',
    map: ['#########', '#       #', '# @$$$  #', '#   ... #', '#########'],
    answer: ['右', '右', '右', '右', '下', '左', '左', '左', '左'],
  },
  {
    id: 10,
    name: '回字形',
    difficulty: 'easy',
    map: ['########', '#   .  #', '# $@$  #', '#   .  #', '########'],
    answer: ['右', '右', '下', '右', '上', '左', '左', '下', '右'],
  },
];

export const getLevelsByDifficulty = (difficulty: SokobanLevel['difficulty']): SokobanLevel[] => {
  return sokobanLevels.filter(level => level.difficulty === difficulty);
};

export const getTotalLevels = (): number => {
  return sokobanLevels.length;
};

export const getLevelById = (id: number): SokobanLevel | undefined => {
  return sokobanLevels.find(level => level.id === id);
};

export const getLevelByIndex = (index: number): SokobanLevel => {
  return sokobanLevels[index];
};

export const calculateRewards = (level: number, monsterType?: string): GameResult['rewards'] => {
  const baseStamina = 2 + Math.floor(level / 3);
  const baseEnergy = 1 + Math.floor(level / 5);
  
  if (monsterType === 'rebel') {
    return {
      stamina: baseStamina * 2,
      energy: baseEnergy * 2,
    };
  }
  
  return {
    stamina: baseStamina,
    energy: baseEnergy,
  };
};

export const mockSubmitGameResult = async (
  level: number,
  completed: boolean,
  monsterType?: string
): Promise<GameResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (completed) {
        const rewards = calculateRewards(level, monsterType);
        resolve({
          success: true,
          rewards,
          message: `恭喜完成第 ${level} 关！`,
          level,
          totalLevels: sokobanLevels.length,
        });
      } else {
        resolve({
          success: false,
          rewards: { stamina: 0, energy: 0 },
          message: '游戏未完成',
          level,
          totalLevels: sokobanLevels.length,
        });
      }
    }, 500);
  });
};

export const mockGetDailyPlays = async (): Promise<{ dailyPlays: number; maxPlays: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        dailyPlays: 0,
        maxPlays: 3,
      });
    }, 300);
  });
};