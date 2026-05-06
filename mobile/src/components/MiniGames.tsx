import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MONSTER_CONFIG } from '../utils/constants';

type GameType = 'sudoku' | 'sokoban';
type Screen = 'welcome' | 'tutorial' | 'game';

interface MiniGamesProps {
  onGameComplete: (rewards: { stamina: number; energy: number }) => void;
  onClose: () => void;
}

// 数独部分
const SudokuGame = ({ onWin }: { onWin: () => void }) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [given, setGiven] = useState<boolean[][]>([]);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);

  // 数独生成逻辑
  const isValid = (grid: number[][], row: number, col: number, num: number) => {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
      const boxRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
      const boxCol = Math.floor(col / 3) * 3 + (i % 3);
      if (grid[boxRow][boxCol] === num) return false;
    }
    return true;
  };

  const solveSudoku = (grid: number[][]) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (let num of nums) {
            if (isValid(grid, row, col, num)) {
              grid[row][col] = num;
              if (solveSudoku(grid)) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const initGame = () => {
    const newSolution = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(newSolution);
    
    const newBoard = newSolution.map(row => [...row]);
    const newGiven = Array(9).fill(0).map(() => Array(9).fill(false));
    
    const cellsToRemove = 40 + Math.floor(Math.random() * 6);
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== 0) {
        newBoard[row][col] = 0;
        removed++;
      } else {
        newGiven[row][col] = true;
      }
    }
    
    // 标记初始给定的数字
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        newGiven[row][col] = newSolution[row][col] === newBoard[row][col] && newBoard[row][col] !== 0;
      }
    }
    
    setSolution(newSolution);
    setBoard(newBoard);
    setGiven(newGiven);
    setSelected(null);
  };

  useEffect(() => {
    initGame();
  }, []);

  const checkWin = () => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) return false;
      }
    }
    return true;
  };

  const inputNumber = (num: number) => {
    if (!selected || given[selected.row][selected.col]) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = num;
    setBoard(newBoard);
    
    // 检查是否完成
    if (checkWin()) {
      setTimeout(() => onWin(), 300);
    }
  };

  const clearCell = () => {
    if (!selected || given[selected.row][selected.col]) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = 0;
    setBoard(newBoard);
  };

  return (
    <View style={styles.gameContainer}>
      <TouchableOpacity style={styles.newGameBtn} onPress={initGame}>
        <Ionicons name="refresh" size={16} color="#5D9BFA" />
        <Text style={styles.newGameText}>新游戏</Text>
      </TouchableOpacity>

      <View style={styles.sudokuGrid}>
        {board.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${colIndex}`}
                style={[
                  styles.sudokuCell,
                  selected?.row === rowIndex && selected?.col === colIndex && styles.sudokuCellSelected,
                  given[rowIndex][colIndex] && styles.sudokuCellGiven,
                  (colIndex === 2 || colIndex === 5) && { borderRightWidth: 2, borderRightColor: '#5D9BFA' },
                  (rowIndex === 2 || rowIndex === 5) && { borderBottomWidth: 2, borderBottomColor: '#5D9BFA' },
                ]}
                onPress={() => setSelected({ row: rowIndex, col: colIndex })}
              >
                {cell !== 0 && (
                  <Text style={[
                    styles.sudokuCellText,
                    given[rowIndex][colIndex] ? styles.sudokuCellTextGiven : styles.sudokuCellTextUser
                  ]}>
                    {cell}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </React.Fragment>
        ))}
      </View>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity key={num} style={styles.numberBtn} onPress={() => inputNumber(num)}>
            <Text style={styles.numberBtnText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.numberBtn, styles.clearBtn]} onPress={clearCell}>
          <Ionicons name="backspace-outline" size={18} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 推箱子部分
const SokobanGame = ({ onWin }: { onWin: () => void }) => {
  const levels = [
    {
      name: '关卡 1',
      map: [
        '########',
        '#  .   #',
        '# $@   #',
        '#  .   #',
        '########',
      ],
    },
    {
      name: '关卡 2',
      map: [
        '  ####',
        '  #  #',
        '###$ #',
        '#  .$ #',
        '#@ .  #',
        '#######',
      ],
    },
    {
      name: '关卡 3',
      map: [
        '  #####',
        '###  ##',
        '# $ $ #',
        '# .@. #',
        '### ##',
        ' #### ',
      ],
    },
    {
      name: '关卡 4',
      map: [
        '########',
        '#  .   #',
        '# $  $##',
        '#@ . . #',
        '########',
      ],
    },
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [gameMap, setGameMap] = useState<string[][]>([]);

  const initLevel = (levelIndex: number) => {
    const level = levels[levelIndex];
    const newMap = level.map.map(row => row.split(''));
    let pPos = { x: 0, y: 0 };
    
    for (let y = 0; y < newMap.length; y++) {
      for (let x = 0; x < newMap[y].length; x++) {
        if (newMap[y][x] === '@') {
          pPos = { x, y };
          newMap[y][x] = ' ';
        }
      }
    }
    
    setCurrentLevel(levelIndex);
    setGameMap(newMap);
    setPlayerPos(pPos);
  };

  useEffect(() => {
    initLevel(Math.floor(Math.random() * levels.length));
  }, []);

  const checkWin = () => {
    for (let row of gameMap) {
      if (row.includes('$') || row.includes('.')) return false;
    }
    return true;
  };

  const move = (dx: number, dy: number) => {
    if (dx === 0 && dy === 0) {
      initLevel(currentLevel);
      return;
    }

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    if (newY < 0 || newY >= gameMap.length || newX < 0 || newX >= gameMap[newY].length) return;
    
    const target = gameMap[newY][newX];
    if (target === '#') return;

    const newMap = gameMap.map(row => [...row]);

    if (target === '$' || target === '*') {
      const boxNewX = newX + dx;
      const boxNewY = newY + dy;
      
      if (boxNewY < 0 || boxNewY >= gameMap.length || boxNewX < 0 || boxNewX >= gameMap[boxNewY].length) return;
      
      const boxTarget = gameMap[boxNewY][boxNewX];
      if (boxTarget === ' ' || boxTarget === '.') {
        newMap[newY][newX] = target === '*' ? '.' : ' ';
        newMap[boxNewY][boxNewX] = boxTarget === '.' ? '*' : '$';
      } else {
        return;
      }
    }

    setGameMap(newMap);
    setPlayerPos({ x: newX, y: newY });

    if (checkWin()) {
      setTimeout(() => onWin(), 300);
    }
  };

  const getCellContent = (char: string, x: number, y: number) => {
    if (playerPos.x === x && playerPos.y === y) {
      return { type: 'player', content: '😊' };
    }
    switch (char) {
      case '#': return { type: 'wall', content: '🧱' };
      case '$': return { type: 'box', content: '📦' };
      case '*': return { type: 'box-on-target', content: '✅' };
      case '.': return { type: 'target', content: '🎯' };
      default: return { type: 'floor', content: '' };
    }
  };

  return (
    <View style={styles.gameContainer}>
      <View style={styles.sokobanHeader}>
        <Text style={styles.levelName}>{levels[currentLevel].name}</Text>
        <TouchableOpacity style={styles.newGameBtn} onPress={() => initLevel(Math.floor(Math.random() * levels.length))}>
          <Ionicons name="refresh" size={16} color="#5D9BFA" />
          <Text style={styles.newGameText}>换一关</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sokobanGrid}>
        {gameMap.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.sokobanRow}>
            {row.map((cell, colIndex) => {
              const { type, content } = getCellContent(cell, colIndex, rowIndex);
              const cellStyle = type === 'wall' ? styles.sokobanCellWall :
                               type === 'floor' ? styles.sokobanCellFloor :
                               type === 'target' ? styles.sokobanCellTarget :
                               type === 'player' ? styles.sokobanCellPlayer :
                               type === 'box' ? styles.sokobanCellBox :
                               styles.sokobanCellBoxOnTarget;
              return (
                <View key={colIndex} style={[styles.sokobanCell, cellStyle]}>
                  <Text style={styles.sokobanCellText}>{content}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.sokobanControls}>
        <TouchableOpacity style={styles.controlBtn} onPress={() => move(0, -1)}>
          <Ionicons name="chevron-up" size={28} color="#5D9BFA" />
        </TouchableOpacity>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.controlBtn} onPress={() => move(-1, 0)}>
            <Ionicons name="chevron-back" size={28} color="#5D9BFA" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlBtn, styles.resetBtn]} onPress={() => move(0, 0)}>
            <Ionicons name="refresh" size={20} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlBtn} onPress={() => move(1, 0)}>
            <Ionicons name="chevron-forward" size={28} color="#5D9BFA" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.controlBtn} onPress={() => move(0, 1)}>
          <Ionicons name="chevron-down" size={28} color="#5D9BFA" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const MiniGames = ({ onGameComplete, onClose }: MiniGamesProps) => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [currentGame, setCurrentGame] = useState<GameType>('sudoku');
  const [gameWon, setGameWon] = useState(false);

  const handleWin = () => {
    setGameWon(true);
  };

  const handleCollectReward = () => {
    onGameComplete({ stamina: 5, energy: 3 });
  };

  const showTutorial = (gameType: GameType) => {
    setCurrentGame(gameType);
    setCurrentScreen('tutorial');
  };

  const startGame = () => {
    setCurrentScreen('game');
    setGameWon(false);
  };

  const goBack = () => {
    if (currentScreen === 'game') {
      setCurrentScreen('tutorial');
    } else if (currentScreen === 'tutorial') {
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('welcome');
    }
    setGameWon(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color="#8888AA" />
        </TouchableOpacity>
        <Text style={styles.title}>游戏恢复</Text>
        <View style={styles.placeholder} />
      </View>

      {currentScreen === 'welcome' && (
        <ScrollView style={styles.welcomeContent} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>🎮 游戏恢复</Text>
            <Text style={styles.welcomeSubtitle}>完成小游戏，恢复体力和能量！</Text>
          </View>

          <View style={styles.rewardsSection}>
            <Text style={styles.sectionTitle}>🏆 游戏奖励</Text>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardBox}>
                <Text style={styles.rewardIcon}>💪</Text>
                <Text style={styles.rewardAmount}>+5</Text>
                <Text style={styles.rewardName}>体力</Text>
              </View>
              <View style={styles.rewardBox}>
                <Text style={styles.rewardIcon}>⚡</Text>
                <Text style={styles.rewardAmount}>+3</Text>
                <Text style={styles.rewardName}>能量</Text>
              </View>
            </View>
            <Text style={styles.rewardNote}>✨ 叛逆小怪可获得双倍奖励！</Text>
          </View>

          <View style={styles.gamesSection}>
            <Text style={styles.sectionTitle}>🎯 选择游戏</Text>
            
            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => showTutorial('sudoku')}
            >
              <View style={styles.gameCardIcon}>🧩</View>
              <View style={styles.gameCardInfo}>
                <Text style={styles.gameCardTitle}>数独</Text>
                <Text style={styles.gameCardDesc}>
                  填写9×9网格，使每行、每列、每个3×3宫格都包含1-9不重复的数字
                </Text>
                <Text style={styles.gameCardRules}>
                  • 点击空格选中，然后点击数字填入
                  {'\n'}• 完成所有格子即可过关
                </Text>
              </View>
              <Text style={styles.gameCardArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => showTutorial('sokoban')}
            >
              <View style={styles.gameCardIcon}>📦</View>
              <View style={styles.gameCardInfo}>
                <Text style={styles.gameCardTitle}>推箱子</Text>
                <Text style={styles.gameCardDesc}>
                  将所有箱子推到目标位置上即可过关
                </Text>
                <Text style={styles.gameCardRules}>
                  • 点击方向键移动角色
                  {'\n'}• 中间按钮重置当前关卡
                  {'\n'}• 箱子只能推，不能拉
                </Text>
              </View>
              <Text style={styles.gameCardArrow}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 小贴士</Text>
            <Text style={styles.tipsText}>
              • 每天可游玩4次，凌晨5点重置次数
              {'\n'}• 完成游戏后奖励会自动添加到你的账户
              {'\n'}• 游戏过程中可随时退出，不会消耗次数
            </Text>
          </View>
        </ScrollView>
      )}

      {currentScreen === 'tutorial' && (
        <ScrollView style={styles.tutorialContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={goBack} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#8888AA" />
            <Text style={styles.backBtnText}>返回</Text>
          </TouchableOpacity>

          {currentGame === 'sudoku' && (
            <>
              <View style={styles.tutorialHeader}>
                <Text style={styles.tutorialIcon}>🧩</Text>
                <Text style={styles.tutorialTitle}>数独教程</Text>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>🎯 游戏目标</Text>
                <Text style={styles.tutorialText}>
                  在9×9的网格中填入数字1-9，使每行、每列、每个3×3宫格内的数字都不重复。
                </Text>
                <View style={styles.exampleGrid}>
                  <Text style={styles.exampleTitle}>示例：</Text>
                  <View style={styles.smallGrid}>
                    {[
                      [5, 3, 0, 0, 7, 0, 0, 0, 0],
                      [6, 0, 0, 1, 9, 5, 0, 0, 0],
                      [0, 9, 8, 0, 0, 0, 0, 6, 0],
                    ].map((row, ri) => (
                      <View key={ri} style={styles.smallRow}>
                        {row.map((cell, ci) => (
                          <View 
                            key={ci} 
                            style={[styles.smallCell, ci === 2 && { borderRightWidth: 2, borderRightColor: '#5D9BFA' }]}
                          >
                            {cell !== 0 && <Text style={styles.smallCellText}>{cell}</Text>}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>🎮 玩法步骤</Text>
                <View style={styles.stepList}>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepNumber}>1</Text>
                    <Text style={styles.stepText}>点击空格选中它</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepNumber}>2</Text>
                    <Text style={styles.stepText}>点击底部数字键盘填入数字</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepNumber}>3</Text>
                    <Text style={styles.stepText}>如果填入错误会显示红色提示</Text>
                  </View>
                  <View style={styles.stepItem}>
                    <Text style={styles.stepNumber}>4</Text>
                    <Text style={styles.stepText}>填满所有格子即可过关！</Text>
                  </View>
                </View>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>💡 技巧提示</Text>
                <Text style={styles.tutorialText}>
                  • 先从数字多的行、列或宫格开始
                  {'\n'}• 每个数字在每行、每列、每个宫格只能出现一次
                  {'\n'}• 如果卡住了，可以点击"新游戏"重新开始
                </Text>
              </View>

              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                <Text style={styles.startBtnText}>开始游戏 🎯</Text>
              </TouchableOpacity>
            </>
          )}

          {currentGame === 'sokoban' && (
            <>
              <View style={styles.tutorialHeader}>
                <Text style={styles.tutorialIcon}>📦</Text>
                <Text style={styles.tutorialTitle}>推箱子教程</Text>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>🎯 游戏目标</Text>
                <Text style={styles.tutorialText}>
                  将所有箱子（📦）推到目标位置（🎯）上即可过关。
                </Text>
                <View style={styles.exampleGrid}>
                  <Text style={styles.exampleTitle}>图例：</Text>
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendIcon}>🧱</Text>
                      <Text style={styles.legendText}>墙壁（无法通过）</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendIcon}>😊</Text>
                      <Text style={styles.legendText}>玩家（你控制的角色）</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendIcon}>📦</Text>
                      <Text style={styles.legendText}>箱子（需要推动）</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendIcon}>🎯</Text>
                      <Text style={styles.legendText}>目标位置</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <Text style={styles.legendIcon}>✅</Text>
                      <Text style={styles.legendText}>箱子在目标上（成功！）</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>🎮 操作方式</Text>
                <View style={styles.controlsExample}>
                  <View style={styles.controlGrid}>
                    <View></View>
                    <TouchableOpacity style={styles.controlExampleBtn}>
                      <Text>⬆️</Text>
                    </TouchableOpacity>
                    <View></View>
                    <TouchableOpacity style={styles.controlExampleBtn}>
                      <Text>⬅️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlExampleBtnCenter}>
                      <Text>🔄</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.controlExampleBtn}>
                      <Text>➡️</Text>
                    </TouchableOpacity>
                    <View></View>
                    <TouchableOpacity style={styles.controlExampleBtn}>
                      <Text>⬇️</Text>
                    </TouchableOpacity>
                    <View></View>
                  </View>
                </View>
              </View>

              <View style={styles.tutorialSection}>
                <Text style={styles.tutorialSectionTitle}>💡 游戏规则</Text>
                <Text style={styles.tutorialText}>
                  • 玩家只能推动箱子，不能拉动
                  {'\n'}• 箱子只能推到空地或目标位置
                  {'\n'}• 不能推动箱子撞墙或推两个箱子
                  {'\n'}• 点击中间按钮可重置当前关卡
                </Text>
              </View>

              <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                <Text style={styles.startBtnText}>开始游戏 🎯</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}

      {currentScreen === 'game' && (
        !gameWon ? (
          <>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#8888AA" />
              <Text style={styles.backBtnText}>返回教程</Text>
            </TouchableOpacity>

            <View style={styles.gameSelector}>
              <TouchableOpacity
                style={[styles.gameTab, currentGame === 'sudoku' && styles.gameTabActive]}
                onPress={() => setCurrentGame('sudoku')}
              >
                <Text style={[styles.gameTabText, currentGame === 'sudoku' && styles.gameTabTextActive]}>🧩 数独</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.gameTab, currentGame === 'sokoban' && styles.gameTabActive]}
                onPress={() => setCurrentGame('sokoban')}
              >
                <Text style={[styles.gameTabText, currentGame === 'sokoban' && styles.gameTabTextActive]}>📦 推箱子</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {currentGame === 'sudoku' && <SudokuGame onWin={handleWin} />}
              {currentGame === 'sokoban' && <SokobanGame onWin={handleWin} />}
            </ScrollView>
          </>
        ) : (
          <View style={styles.winContainer}>
            <Text style={styles.winTitle}>🎉 胜利！</Text>
            <Text style={styles.winText}>恭喜你完成了游戏！</Text>
            <View style={styles.rewardsContainer}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>+5</Text>
                <Text style={styles.rewardLabel}>体力</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>+3</Text>
                <Text style={styles.rewardLabel}>能量</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.collectBtn} onPress={handleCollectReward}>
              <Text style={styles.collectBtnText}>太棒了！领取奖励</Text>
            </TouchableOpacity>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F1030',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93,155,250,0.2)',
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    color: '#E8E8F0',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  placeholder: {
    width: 36,
  },
  gameSelector: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  gameTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  gameTabActive: {
    backgroundColor: 'rgba(93,155,250,0.3)',
    borderColor: '#5D9BFA',
  },
  gameTabText: {
    color: '#8888AA',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  gameTabTextActive: {
    color: '#5D9BFA',
  },
  content: {
    flex: 1,
  },
  gameContainer: {
    padding: 20,
    alignItems: 'center',
  },
  newGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.1)',
    marginBottom: 20,
  },
  newGameText: {
    color: '#5D9BFA',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Courier',
  },
  // 数独样式
  sudokuGrid: {
    width: '100%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#0F1030',
    borderWidth: 2,
    borderColor: '#5D9BFA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sudokuCell: {
    width: '11.111%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A2E',
    borderWidth: 0.5,
    borderColor: 'rgba(93,155,250,0.3)',
  },
  sudokuCellSelected: {
    backgroundColor: 'rgba(93,155,250,0.2)',
  },
  sudokuCellGiven: {
    backgroundColor: 'rgba(93,155,250,0.1)',
  },
  sudokuCellText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  sudokuCellTextGiven: {
    color: '#5D9BFA',
  },
  sudokuCellTextUser: {
    color: '#FFD700',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  numberBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93,155,250,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.3)',
  },
  numberBtnText: {
    color: '#5D9BFA',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  clearBtn: {
    backgroundColor: 'rgba(255,107,107,0.15)',
    borderColor: 'rgba(255,107,107,0.3)',
  },
  // 推箱子样式
  sokobanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  levelName: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  sokobanGrid: {
    backgroundColor: '#0F1030',
    borderWidth: 2,
    borderColor: '#FF7D00',
    borderRadius: 12,
    padding: 8,
    marginBottom: 24,
  },
  sokobanRow: {
    flexDirection: 'row',
  },
  sokobanCell: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sokobanCellWall: {
    backgroundColor: '#3A3A5C',
  },
  sokobanCellFloor: {
    backgroundColor: '#1A1A2E',
  },
  sokobanCellTarget: {
    backgroundColor: 'rgba(255,215,0,0.2)',
  },
  sokobanCellPlayer: {
    backgroundColor: 'rgba(93,155,250,0.3)',
  },
  sokobanCellBox: {
    backgroundColor: 'rgba(255,125,0,0.4)',
  },
  sokobanCellBoxOnTarget: {
    backgroundColor: 'rgba(58,227,116,0.4)',
  },
  sokobanCellText: {
    fontSize: 20,
  },
  sokobanControls: {
    alignItems: 'center',
    gap: 8,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
  },
  controlBtn: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93,155,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.3)',
    borderRadius: 12,
  },
  resetBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderColor: 'rgba(255,215,0,0.3)',
  },
  // 胜利界面
  winContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  winTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 12,
    fontFamily: 'Courier',
  },
  winText: {
    fontSize: 18,
    color: '#E8E8F0',
    marginBottom: 32,
    fontFamily: 'Courier',
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 32,
  },
  rewardItem: {
    alignItems: 'center',
  },
  rewardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    fontFamily: 'Courier',
  },
  rewardLabel: {
    fontSize: 14,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  collectBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#5D9BFA',
    borderRadius: 16,
  },
  collectBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  // 欢迎页面样式
  welcomeContent: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 8,
    fontFamily: 'Courier',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  rewardsSection: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginBottom: 12,
  },
  rewardBox: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    fontFamily: 'Courier',
  },
  rewardName: {
    fontSize: 14,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  rewardNote: {
    fontSize: 12,
    color: '#5D9BFA',
    fontFamily: 'Courier',
    textAlign: 'center',
  },
  gamesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8F0',
    marginBottom: 12,
    fontFamily: 'Courier',
  },
  gameCard: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.15)',
  },
  gameCardIcon: {
    fontSize: 40,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(93,155,250,0.1)',
    borderRadius: 12,
  },
  gameCardInfo: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8E8F0',
    marginBottom: 6,
    fontFamily: 'Courier',
  },
  gameCardDesc: {
    fontSize: 13,
    color: '#8888AA',
    marginBottom: 8,
    fontFamily: 'Courier',
  },
  gameCardRules: {
    fontSize: 12,
    color: '#555577',
    fontFamily: 'Courier',
    lineHeight: 18,
  },
  tipsSection: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  tipsText: {
    fontSize: 13,
    color: '#E8E8F0',
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtnText: {
    color: '#8888AA',
    fontSize: 14,
    fontFamily: 'Courier',
  },
  gameCardArrow: {
    fontSize: 20,
    color: '#8888AA',
    alignSelf: 'center',
  },
  // 教程页面样式
  tutorialContent: {
    flex: 1,
    padding: 20,
  },
  tutorialHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tutorialIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  tutorialTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    fontFamily: 'Courier',
  },
  tutorialSection: {
    backgroundColor: '#16213E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.15)',
  },
  tutorialSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E8E8F0',
    marginBottom: 12,
    fontFamily: 'Courier',
  },
  tutorialText: {
    fontSize: 14,
    color: '#8888AA',
    fontFamily: 'Courier',
    lineHeight: 20,
  },
  exampleGrid: {
    marginTop: 12,
  },
  exampleTitle: {
    fontSize: 13,
    color: '#5D9BFA',
    fontFamily: 'Courier',
    marginBottom: 8,
  },
  smallGrid: {
    backgroundColor: '#0F1030',
    borderRadius: 8,
    padding: 4,
  },
  smallRow: {
    flexDirection: 'row',
  },
  smallCell: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(93,155,250,0.3)',
  },
  smallCellText: {
    fontSize: 12,
    color: '#5D9BFA',
    fontFamily: 'Courier',
  },
  stepList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(93,155,250,0.2)',
    color: '#5D9BFA',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Courier',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  stepText: {
    fontSize: 14,
    color: '#E8E8F0',
    fontFamily: 'Courier',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 20,
  },
  legendText: {
    fontSize: 13,
    color: '#8888AA',
    fontFamily: 'Courier',
  },
  controlsExample: {
    alignItems: 'center',
    marginTop: 8,
  },
  controlGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 170,
    gap: 8,
  },
  controlExampleBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(93,155,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlExampleBtnCenter: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#5D9BFA',
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Courier',
    textAlign: 'center',
  },
});

export default MiniGames;
