import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  FlatList
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

interface StudySession {
  id: string;
  taskId: string;
  duration: number; // 秒
  startTime: Date;
  endTime: Date;
}

export default function HomeScreen() {
  const [time, setTime] = useState(1500); // 25分钟
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 保存数据
  useEffect(() => {
    saveData();
  }, [tasks, studySessions]);

  // 计时器逻辑
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      // 计时结束
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  const loadData = async () => {
    try {
      const tasksData = await AsyncStorage.getItem('tasks');
      const sessionsData = await AsyncStorage.getItem('studySessions');
      
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (sessionsData) setStudySessions(JSON.parse(sessionsData));
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      await AsyncStorage.setItem('studySessions', JSON.stringify(studySessions));
    } catch (error) {
      console.error('保存数据失败:', error);
    }
  };

  const handleTimerComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);
    
    // 记录学习会话
    if (activeTaskId && mode === 'work') {
      const newSession: StudySession = {
        id: Date.now().toString(),
        taskId: activeTaskId,
        duration: 1500, // 25分钟
        startTime: new Date(Date.now() - 1500 * 1000),
        endTime: new Date(),
      };
      setStudySessions(prev => [...prev, newSession]);
    }
    
    // 切换模式
    if (mode === 'work') {
      setMode('break');
      setTime(300); // 5分钟休息
    } else {
      setMode('work');
      setTime(1500); // 25分钟工作
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(mode === 'work' ? 1500 : 300);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date() : undefined }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const setActiveTask = (taskId: string) => {
    setActiveTaskId(taskId === activeTaskId ? null : taskId);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayStudyTime = () => {
    const today = new Date().toDateString();
    return studySessions
      .filter(session => new Date(session.endTime).toDateString() === today)
      .reduce((total, session) => total + session.duration, 0);
  };

  return (
    <View style={[styles.container, mode === 'work' ? styles.workBg : styles.breakBg]}>
      <StatusBar style="auto" />
      
      <ScrollView style={styles.scrollView}>
        {/* 计时器部分 */}
        <View style={styles.timerSection}>
          <Text style={styles.modeText}>
            {mode === 'work' ? '专注时间' : '休息时间'}
          </Text>
          
          <Text style={styles.timerText}>
            {formatTime(time)}
          </Text>
          
          <View style={styles.controls}>
            <TouchableOpacity 
              style={[styles.button, styles.startButton]} 
              onPress={isRunning ? pauseTimer : startTimer}
            >
              <Text style={styles.buttonText}>
                {isRunning ? '暂停' : '开始'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.resetButton]} 
              onPress={resetTimer}
            >
              <Text style={styles.buttonText}>重置</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tipText}>
            {mode === 'work' ? '专注工作25分钟' : '休息5分钟'}
          </Text>
        </View>

        {/* 今日统计 */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>今日学习统计</Text>
          <Text style={styles.statsText}>
            总时长: {Math.floor(getTodayStudyTime() / 60)} 分钟
          </Text>
          <Text style={styles.statsText}>
            完成会话: {studySessions.filter(s => new Date(s.endTime).toDateString() === new Date().toDateString()).length} 次
          </Text>
        </View>

        {/* 任务管理 */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>学习任务</Text>
          
          <View style={styles.addTaskContainer}>
            <TextInput
              style={styles.taskInput}
              placeholder="添加新任务..."
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={addTask}
            />
            <TouchableOpacity style={styles.addButton} onPress={addTask}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.taskItem, item.completed && styles.taskCompleted]}>
                <TouchableOpacity 
                  style={styles.taskCheckbox}
                  onPress={() => toggleTaskCompletion(item.id)}
                >
                  <Text style={styles.checkboxText}>{item.completed ? '✓' : ''}</Text>
                </TouchableOpacity>
                
                <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]}>
                  {item.title}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.activeButton, activeTaskId === item.id && styles.activeButtonSelected]}
                  onPress={() => setActiveTask(item.id)}
                >
                  <Text style={styles.activeButtonText}>
                    {activeTaskId === item.id ? '进行中' : '设为当前'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteTask(item.id)}
                >
                  <Text style={styles.deleteButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workBg: {
    backgroundColor: '#f8f9fa',
  },
  breakBg: {
    backgroundColor: '#fff0f5',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  button: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#3498db',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  statsText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  tasksSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addTaskContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  taskInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#27ae60',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskCompleted: {
    opacity: 0.6,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxText: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  activeButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
  },
  activeButtonSelected: {
    backgroundColor: '#e67e22',
  },
  activeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 18,
    fontWeight: 'bold',
  },
});