import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  sokobanLevels,
  getLevelByIndex,
  calculateRewards,
  mockSubmitGameResult,
  type GameResult,
} from '../services/gameService';

// ==================== 类型定义 ====================

/**
 * 游戏弹窗组件属性
 */
interface GameModalProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 游戏完成回调，返回奖励 */
  onGameComplete: (rewards: { stamina: number; energy: number }) => void;
  /** 怪兽类型，影响奖励计算 */
  monsterType?: string;
}

/**
 * 当前显示屏幕类型
 */
type Screen = 'welcome' | 'tutorial' | 'game';

/**
 * 游戏类型
 */
type GameType = 'sudoku' | 'sokoban';

// ==================== 数独游戏组件 ====================

/**
 * 数独游戏组件
 */
const SudokuGame = ({ onWin }: { onWin: () => void }) => {
  /** 游戏面板，0表示空 */
  const [board, setBoard] = useState<number[][]>([]);
  /** 答案面板 */
  const [solution, setSolution] = useState<number[][]>([]);
  /** 哪些位置是初始给定的（不可修改） */
  const [given, setGiven] = useState<boolean[][]>([]);
  /** 当前选中的格子位置 */
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  /** 是否显示答案（放弃奖励） */
  const [showSolution, setShowSolution] = useState(false);

  /**
   * 检查数字在当前位置是否有效
   */
  const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
    // 检查行
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    // 检查3x3宫格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[boxRow + i][boxCol + j] === num) return false;
      }
    }
    return true;
  };

  /**
   * 使用回溯法生成数独答案
   */
  const solveSudoku = (grid: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          // 随机打乱数字1-9
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
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

  /**
   * 初始化游戏
   */
  const initGame = () => {
    // 生成答案
    const newSolution = Array(9).fill(0).map(() => Array(9).fill(0));
    solveSudoku(newSolution);
    
    // 复制答案到面板，然后挖空一些格子
    const newBoard = newSolution.map(row => [...row]);
    const newGiven = Array(9).fill(0).map(() => Array(9).fill(false));
    
    // 随机挖空35个格子
    const cellsToRemove = 35;
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      if (newBoard[row][col] !== 0) {
        newBoard[row][col] = 0;
        removed++;
      }
    }
    
    // 标记哪些是给定的
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        newGiven[row][col] = newSolution[row][col] === newBoard[row][col] && newBoard[row][col] !== 0;
      }
    }
    
    setSolution(newSolution);
    setBoard(newBoard);
    setGiven(newGiven);
    setSelected(null);
    setShowSolution(false);
  };

  // 组件挂载时初始化游戏
  useEffect(() => {
    initGame();
  }, []);

  /**
   * 检查游戏是否胜利
   */
  const checkWin = (): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] !== solution[row][col]) return false;
      }
    }
    return true;
  };

  /**
   * 输入数字处理
   */
  const handleInput = (num: number) => {
    if (!selected || given[selected.row][selected.col]) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = num;
    setBoard(newBoard);
    
    // 检查胜利
    if (checkWin()) {
      setTimeout(() => onWin(), 300);
    }
  };

  /**
   * 清除数字
   */
  const handleClear = () => {
    if (!selected || given[selected.row][selected.col]) return;
    
    const newBoard = board.map(row => [...row]);
    newBoard[selected.row][selected.col] = 0;
    setBoard(newBoard);
  };

  /**
   * 显示答案（放弃奖励）
   */
  const handleShowSolution = () => {
    Alert.alert('确认', '确定要放弃奖励查看答案吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => {
        setBoard(solution.map(row => [...row]));
        setShowSolution(true);
      }}
    ]);
  };

  /**
   * 获取格子背景色
   */
  const getCellColor = (row: number, col: number): string => {
    if (!selected) return '#1A1A2E';
    if (selected.row === row && selected.col === col) return 'rgba(93,155,250,0.3)';
    if (selected.row === row || selected.col === col) return 'rgba(93,155,250,0.1)';
    const boxRow = Math.floor(selected.row / 3) * 3;
    const boxCol = Math.floor(selected.col / 3) * 3;
    if (row >= boxRow && row < boxRow + 3 && col >= boxCol && col < boxCol + 3) {
      return 'rgba(93,155,250,0.1)';
    }
    return '#1A1A2E';
  };

  return (
    <View style={styles.gameContainer}>
      {/* 头部 */}
      <View style={styles.sudokuHeader}>
        <Text style={styles.sudokuTitle}>🧩 数独</Text>
        <TouchableOpacity style={styles.newGameBtn} onPress={initGame}>
          <Ionicons name="refresh" size={16} color="#5D9BFA" />
          <Text style={styles.newGameText}>新游戏</Text>
        </TouchableOpacity>
      </View>

      {/* 游戏面板 */}
      <View style={styles.sudokuGrid}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.sudokuRow}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[styles.sudokuCell, { backgroundColor: getCellColor(rowIndex, colIndex) }]}
                onPress={() => !given[rowIndex][colIndex] && setSelected({ row: rowIndex, col: colIndex })}
                disabled={given[rowIndex][colIndex]}
              >
                {cell !== 0 && (
                  <Text style={[
                    styles.sudokuCellText,
                    given[rowIndex][colIndex] ? styles.sudokuGiven : styles.sudokuInput,
                    showSolution ? styles.sudokuSolution : {}
                  ]}>
                    {cell}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* 数字键盘 */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <TouchableOpacity
            key={num}
            style={styles.numberBtn}
            onPress={() => handleInput(num)}
          >
            <Text style={styles.numberBtnText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>清除</Text>
        </TouchableOpacity>
      </View>

      {/* 显示答案按钮 */}
      <TouchableOpacity style={styles.hintBtn} onPress={handleShowSolution}>
        <Text style={styles.hintBtnText}>💡 放弃奖励查看答案</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================== 推箱子游戏组件 ====================

/**
 * 推箱子游戏组件
 */
const SokobanGame = ({ onWin, monsterType }: { onWin: (level: number) => void; monsterType?: string }) => {
  /** 当前关卡索引 */
  const [currentLevel, setCurrentLevel] = useState(0);
  /** 玩家位置 */
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  /** 游戏地图 */
  const [gameMap, setGameMap] = useState<string[][]>([]);
  /** 是否显示答案 */
  const [showAnswer, setShowAnswer] = useState(false);
  /** 答案步骤 */
  const [solutionSteps, setSolutionSteps] = useState<string[]>([]);
  /** 当前答案步骤索引 */
  const [currentStep, setCurrentStep] = useState(0);
  /** 是否正在播放答案 */
  const [isPlayingSolution, setIsPlayingSolution] = useState(false);

  /**
   * 初始化指定关卡
   */
  const initLevel = (levelIndex: number) => {
    const level = getLevelByIndex(levelIndex);
    const newMap = level.map.map(row => row.split(''));
    let pPos = { x: 0, y: 0 };
    
    // 找到玩家位置并将其从地图中移除
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
    setShowAnswer(false);
    setSolutionSteps([]);
    setCurrentStep(0);
  };

  // 组件挂载时初始化第一关
  useEffect(() => {
    initLevel(0);
  }, []);

  /**
   * 检查当前地图是否胜利
   */
  const checkWin = (map: string[][]): boolean => {
    for (const row of map) {
      if (row.includes('$') || row.includes('.')) return false;
    }
    return true;
  };

  /**
   * 移动玩家
   */
  const move = (dx: number, dy: number) => {
    if (isPlayingSolution) return;

    // 重置当前关卡
    if (dx === 0 && dy === 0) {
      initLevel(currentLevel);
      return;
    }

    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    
    // 检查边界
    if (newY < 0 || newY >= gameMap.length || newX < 0 || newX >= gameMap[newY].length) return;
    
    const target = gameMap[newY][newX];
    if (target === '#') return; // 撞墙

    const newMap = gameMap.map(row => [...row]);

    // 推箱子
    if (target === '$' || target === '*') {
      const boxNewX = newX + dx;
      const boxNewY = newY + dy;
      
      // 检查箱子移动位置
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

    // 检查胜利
    const currentLevelCopy = currentLevel;
    if (checkWin(newMap)) {
      setTimeout(() => {
        if (currentLevelCopy < 2) {
          initLevel(currentLevelCopy + 1);
        } else {
          onWin(currentLevelCopy + 1);
        }
      }, 500);
    }
  };

  /**
   * 显示答案（放弃奖励）
   */
  const handleShowAnswer = () => {
    Alert.alert('确认', '确定要放弃奖励查看答案吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: () => {
        const level = getLevelByIndex(currentLevel);
        setSolutionSteps(level.answer);
        setShowAnswer(true);
        setCurrentStep(0);
      }}
    ]);
  };

  /**
   * 执行下一步答案
   */
  const handleNextStep = () => {
    if (currentStep >= solutionSteps.length) return;
    
    const step = solutionSteps[currentStep];
    let dx = 0, dy = 0;
    switch (step) {
      case '上': dy = -1; break;
      case '下': dy = 1; break;
      case '左': dx = -1; break;
      case '右': dx = 1; break;
    }
    
    setIsPlayingSolution(true);
    setTimeout(() => {
      move(dx, dy);
      setCurrentStep(prev => prev + 1);
      setIsPlayingSolution(false);
    }, 300);
  };

  /**
   * 播放全部答案
   */
  const handlePlayAll = () => {
    if (solutionSteps.length === 0) return;
    
    setIsPlayingSolution(true);
    let stepIndex = 0;
    
    const playStep = () => {
      if (stepIndex >= solutionSteps.length) {
        setIsPlayingSolution(false);
        return;
      }
      
      const step = solutionSteps[stepIndex];
      let dx = 0, dy = 0;
      switch (step) {
        case '上': dy = -1; break;
        case '下': dy = 1; break;
        case '左': dx = -1; break;
        case '右': dx = 1; break;
      }
      
      const newMap = gameMap.map(row => [...row]);
      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;
      
      if (newY >= 0 && newY < gameMap.length && newX >= 0 && newX < gameMap[newY].length) {
        const target = gameMap[newY][newX];
        if (target !== '#') {
          if (target === '$' || target === '*') {
            const boxNewX = newX + dx;
            const boxNewY = newY + dy;
            if (boxNewY >= 0 && boxNewY < gameMap.length && boxNewX >= 0 && boxNewX < gameMap[boxNewY].length) {
              const boxTarget = gameMap[boxNewY][boxNewX];
              if (boxTarget === ' ' || boxTarget === '.') {
                newMap[newY][newX] = target === '*' ? '.' : ' ';
                newMap[boxNewY][boxNewX] = boxTarget === '.' ? '*' : '$';
              }
            }
          }
          setGameMap(newMap);
          setPlayerPos({ x: newX, y: newY });
        }
      }
      
      stepIndex++;
      setCurrentStep(stepIndex);
      
      setTimeout(playStep, 400);
    };
    
    setTimeout(playStep, 300);
  };

  /**
   * 获取格子内容和样式
   */
  const getCellContent = (char: string, x: number, y: number): { type: string; content: string } => {
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

  const level = getLevelByIndex(currentLevel);

  return (
    <View style={styles.gameContainer}>
      {/* 头部 */}
      <View style={styles.sokobanHeader}>
        <Text style={styles.levelName}>{level.name} / {sokobanLevels.length}</Text>
        <TouchableOpacity style={styles.newGameBtn} onPress={() => initLevel(0)}>
          <Ionicons name="refresh" size={16} color="#5D9BFA" />
          <Text style={styles.newGameText}>重新开始</Text>
        </TouchableOpacity>
      </View>

      {/* 答案显示区 */}
      {showAnswer && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerTitle}>📝 解题步骤 ({solutionSteps.length}步)</Text>
          <View style={styles.answerSteps}>
            {solutionSteps.map((step, i) => (
              <Text key={i} style={currentStep > i ? styles.stepDone : styles.stepPending}>
                {i + 1}. {step === '上' ? '⬆️' : step === '下' ? '⬇️' : step === '左' ? '⬅️' : '➡️'}
              </Text>
            ))}
          </View>
          <View style={styles.answerButtons}>
            <TouchableOpacity 
              style={styles.smallBtn} 
              onPress={handleNextStep} 
              disabled={isPlayingSolution || currentStep >= solutionSteps.length}
            >
              <Text style={styles.smallBtnText}>▶️ 下一步</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.smallBtn} 
              onPress={handlePlayAll} 
              disabled={isPlayingSolution}
            >
              <Text style={styles.smallBtnText}>⏩ 全部执行</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 游戏地图 */}
      <View style={styles.sokobanGrid}>
        {gameMap.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.sokobanRow}>
            {row.map((char, colIndex) => {
              const { type, content } = getCellContent(char, colIndex, rowIndex);
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

      {/* 方向控制 */}
      <View style={styles.sokobanControls}>
        <TouchableOpacity style={styles.sokobanBtn} onPress={() => move(0, -1)}>
          <Text style={styles.sokobanBtnText}>⬆️</Text>
        </TouchableOpacity>
        <View style={styles.sokobanBtnRow}>
          <TouchableOpacity style={styles.sokobanBtn} onPress={() => move(-1, 0)}>
            <Text style={styles.sokobanBtnText}>⬅️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sokobanBtn} onPress={() => move(0, 0)}>
            <Text style={styles.sokobanBtnText}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sokobanBtn} onPress={() => move(1, 0)}>
            <Text style={styles.sokobanBtnText}>➡️</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sokobanBtn} onPress={() => move(0, 1)}>
          <Text style={styles.sokobanBtnText}>⬇️</Text>
        </TouchableOpacity>
      </View>

      {/* 显示答案按钮 */}
      <TouchableOpacity style={styles.hintBtn} onPress={handleShowAnswer}>
        <Text style={styles.hintBtnText}>💡 放弃奖励查看答案</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================== 主游戏弹窗组件 ====================

/**
 * 游戏弹窗主组件
 * 包含游戏选择、教程和游戏界面
 */
const GameModal = ({ visible, onClose, onGameComplete, monsterType }: GameModalProps) => {
  /** 当前显示的屏幕 */
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  /** 当前选中的游戏类型 */
  const [currentGame, setCurrentGame] = useState<GameType>('sudoku');
  /** 是否游戏胜利 */
  const [gameWon, setGameWon] = useState(false);
  /** 是否正在提交结果 */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * 处理游戏胜利
   */
  const handleWin = async (level?: number) => {
    setGameWon(true);
    setIsSubmitting(true);
    
    try {
      // 提交游戏结果
      const result: GameResult = await mockSubmitGameResult(
        level || 1,
        true,
        monsterType
      );
      
      if (result.success) {
        setTimeout(() => {
          // 先恢复状态，然后把奖励传出去，让外面处理关闭和提示
          setGameWon(false);
          setIsSubmitting(false);
          onGameComplete(result.rewards);
        }, 500);
      } else {
        throw new Error(result.message || '游戏提交失败');
      }
    } catch (error) {
      console.error('游戏提交失败:', error);
      setIsSubmitting(false);
      setGameWon(false);
      Alert.alert('❌ 提交失败', '游戏结果提交失败，请重试', [
        { text: '重试', onPress: () => handleWin(level) },
        { text: '取消', style: 'cancel' }
      ]);
    }
  };

  /**
   * 显示游戏教程
   */
  const showTutorial = (gameType: GameType) => {
    setCurrentGame(gameType);
    setCurrentScreen('tutorial');
  };

  /**
   * 开始游戏
   */
  const startGame = () => {
    setCurrentScreen('game');
    setGameWon(false);
  };

  /**
   * 返回上一步
   */
  const goBack = () => {
    if (currentScreen === 'game') {
      Alert.alert('⚠️ 确认退出', '退出后当前游戏进度将丢失，确定退出吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => {
          setCurrentScreen('tutorial');
          setGameWon(false);
        }}
      ]);
    } else {
      setCurrentScreen('welcome');
      setGameWon(false);
    }
  };

  /**
   * 关闭弹窗
   */
  const handleClose = () => {
    if (currentScreen === 'game') {
      Alert.alert('⚠️ 确认退出', '退出后当前游戏进度将丢失，确定退出吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => {
          setCurrentScreen('welcome');
          setGameWon(false);
          onClose();
        }}
      ]);
    } else {
      setCurrentScreen('welcome');
      setGameWon(false);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 头部栏 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#8888AA" />
          </TouchableOpacity>
          <Text style={styles.title}>游戏恢复</Text>
          <View style={styles.placeholder} />
        </View>

        {/* 欢迎页面 */}
        {currentScreen === 'welcome' && (
          <ScrollView style={styles.welcomeContent} showsVerticalScrollIndicator={false}>
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>🎮 游戏恢复</Text>
              <Text style={styles.welcomeSubtitle}>完成小游戏，恢复体力和能量！</Text>
            </View>

            {/* 奖励说明 */}
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

            {/* 游戏选择 */}
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
                    填写9×9网格，使每行、每列、每个3×3宫格都包含1-9不重复的数字。完成一局即可获得奖励！
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
                    将所有箱子推到目标位置上即可过关。完成3关即可获得奖励！
                  </Text>
                </View>
                <Text style={styles.gameCardArrow}>→</Text>
              </TouchableOpacity>
            </View>

            {/* 游戏规则 */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>💡 游戏规则</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• 数独：完成一局即可获得奖励</Text>
                <Text style={styles.tipItem}>• 推箱子：完成3关即可获得奖励</Text>
                <Text style={styles.tipItem}>• 每天可游玩3次，凌晨5点重置次数</Text>
                <Text style={styles.tipItem}>• 完成游戏后奖励会自动添加到你的账户</Text>
                <Text style={styles.tipItem}>• 游戏过程中可随时退出，不会消耗次数</Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* 教程页面 */}
        {currentScreen === 'tutorial' && (
          <ScrollView style={styles.tutorialContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#8888AA" />
              <Text style={styles.backBtnText}>返回</Text>
            </TouchableOpacity>

            {/* 数独教程 */}
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
                </View>

                <View style={styles.tutorialSection}>
                  <Text style={styles.tutorialSectionTitle}>🎮 操作方式</Text>
                  <View style={styles.tutorialSteps}>
                    <Text style={styles.tutorialStep}>1. 点击空格选中它</Text>
                    <Text style={styles.tutorialStep}>2. 点击下方数字填入</Text>
                    <Text style={styles.tutorialStep}>3. 完成所有格子即可过关</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                  <Text style={styles.startBtnText}>开始游戏</Text>
                </TouchableOpacity>
              </>
            )}

            {/* 推箱子教程 */}
            {currentGame === 'sokoban' && (
              <>
                <View style={styles.tutorialHeader}>
                  <Text style={styles.tutorialIcon}>📦</Text>
                  <Text style={styles.tutorialTitle}>推箱子教程</Text>
                </View>

                <View style={styles.tutorialSection}>
                  <Text style={styles.tutorialSectionTitle}>🎯 游戏目标</Text>
                  <Text style={styles.tutorialText}>
                    将所有箱子推到目标位置（🎯）上即可过关。箱子只能推，不能拉。完成3关即可获得奖励！
                  </Text>
                </View>

                <View style={styles.tutorialSection}>
                  <Text style={styles.tutorialSectionTitle}>🎮 操作方式</Text>
                  <View style={styles.tutorialSteps}>
                    <Text style={styles.tutorialStep}>1. 点击方向键移动角色（😊）</Text>
                    <Text style={styles.tutorialStep}>2. 中间按钮重置当前关卡</Text>
                    <Text style={styles.tutorialStep}>3. 完成当前关卡自动进入下一关</Text>
                    <Text style={styles.tutorialStep}>4. 完成3关后自动获得奖励</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.startBtn} onPress={startGame}>
                  <Text style={styles.startBtnText}>开始游戏</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        {/* 游戏界面 */}
        {currentScreen === 'game' && (
          <View style={styles.gameScreen}>
            <TouchableOpacity onPress={goBack} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={20} color="#8888AA" />
              <Text style={styles.backBtnText}>返回</Text>
            </TouchableOpacity>

            {/* 游戏内容容器 */}
            <View style={styles.gameContent}>
              {/* 胜利遮罩 */}
              {gameWon && (
                <View style={styles.winOverlay}>
                  <Text style={styles.winText}>🎉 恭喜过关！</Text>
                  {isSubmitting && (
                    <Text style={styles.submittingText}>正在提交奖励...</Text>
                  )}
                </View>
              )}

              {/* 根据游戏类型显示对应游戏 */}
              {currentGame === 'sudoku' && <SudokuGame onWin={() => handleWin(1)} />}
              {currentGame === 'sokoban' && <SokobanGame onWin={handleWin} monsterType={monsterType} />}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ==================== 样式 ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93,155,250,0.2)',
  },
  closeBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E8E8F0',
  },
  placeholder: {
    width: 44,
  },
  welcomeContent: {
    flex: 1,
    padding: 16,
  },
  welcomeSection: {
    textAlign: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5D9BFA',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8888AA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 12,
  },
  rewardsSection: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  rewardBox: {
    alignItems: 'center',
  },
  rewardIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  rewardAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rewardName: {
    fontSize: 12,
    color: '#8888AA',
  },
  rewardNote: {
    fontSize: 12,
    color: '#8888AA',
    textAlign: 'center',
    marginTop: 12,
  },
  gamesSection: {
    marginBottom: 16,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  gameCardIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  gameCardInfo: {
    flex: 1,
  },
  gameCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E8E8F0',
    marginBottom: 4,
  },
  gameCardDesc: {
    fontSize: 12,
    color: '#8888AA',
  },
  gameCardArrow: {
    fontSize: 20,
    color: '#5D9BFA',
  },
  tipsSection: {
    backgroundColor: 'rgba(93,155,250,0.08)',
    borderRadius: 12,
    padding: 16,
  },
  tipsText: {
    fontSize: 12,
    color: '#8888AA',
    lineHeight: 1.6,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 12,
    color: '#8888AA',
    lineHeight: 1.6,
  },
  tutorialContent: {
    flex: 1,
    padding: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
    zIndex: 200,
    position: 'relative',
  },
  backBtnText: {
    color: '#8888AA',
    fontSize: 14,
  },
  tutorialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  tutorialIcon: {
    fontSize: 40,
  },
  tutorialTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E8E8F0',
  },
  tutorialSection: {
    marginBottom: 24,
    paddingBottom: 8,
  },
  tutorialSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  tutorialText: {
    fontSize: 14,
    color: '#8888AA',
    lineHeight: 1.6,
  },
  tutorialSteps: {
    gap: 6,
  },
  tutorialStep: {
    fontSize: 14,
    color: '#8888AA',
    lineHeight: 1.6,
  },
  startBtn: {
    backgroundColor: '#5D9BFA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gameScreen: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
  },
  gameContent: {
    flex: 1,
  },
  gameContainer: {
    flex: 1,
  },
  // 数独样式
  sudokuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sudokuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E8E8F0',
  },
  newGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    backgroundColor: 'rgba(93,155,250,0.15)',
    borderRadius: 8,
  },
  newGameText: {
    fontSize: 12,
    color: '#5D9BFA',
  },
  sudokuGrid: {
    backgroundColor: '#0F103E',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#5D9BFA',
  },
  sudokuRow: {
    flexDirection: 'row',
  },
  sudokuCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.2)',
  },
  sudokuCellText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sudokuGiven: {
    color: '#5D9BFA',
  },
  sudokuInput: {
    color: '#FFD700',
  },
  sudokuSolution: {
    color: '#3AE374',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  numberBtn: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: 'rgba(93,155,250,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5D9BFA',
  },
  clearBtn: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: 'rgba(255,107,107,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B6B',
  },
  hintBtn: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.4)',
  },
  hintBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  // 推箱子样式
  sokobanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  sokobanGrid: {
    backgroundColor: '#0F103E',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF7D00',
  },
  sokobanRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  sokobanCell: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    margin: 1,
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
    gap: 4,
    marginBottom: 16,
  },
  sokobanBtnRow: {
    flexDirection: 'row',
    gap: 4,
  },
  sokobanBtn: {
    width: 55,
    height: 55,
    backgroundColor: 'rgba(93,155,250,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(93,155,250,0.3)',
  },
  sokobanBtnText: {
    fontSize: 22,
  },
  answerContainer: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
  },
  answerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  answerSteps: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  stepPending: {
    fontSize: 14,
    color: '#8888AA',
  },
  stepDone: {
    fontSize: 14,
    color: '#3AE374',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    flex: 1,
    padding: 8,
    backgroundColor: 'rgba(93,155,250,0.2)',
    borderRadius: 6,
    alignItems: 'center',
  },
  smallBtnText: {
    fontSize: 11,
    color: '#5D9BFA',
    fontWeight: 'bold',
  },
  winOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    pointerEvents: 'none',
  },
  winText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  submittingText: {
    fontSize: 14,
    color: '#8888AA',
    marginTop: 16,
  },
});

export default GameModal;
