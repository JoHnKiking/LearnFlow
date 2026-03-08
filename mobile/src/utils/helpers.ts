import { Alert, Keyboard, Platform, Dimensions, LayoutAnimation } from 'react-native';

// 通用工具函数

/**
 * 显示错误提示
 */
export const showErrorAlert = (message: string, title: string = '错误') => {
  Alert.alert(title, message);
};

/**
 * 显示成功提示
 */
export const showSuccessAlert = (message: string, title: string = '成功') => {
  Alert.alert(title, message);
};

/**
 * 验证输入是否为空
 */
export const validateInput = (input: string, fieldName: string): boolean => {
  if (!input.trim()) {
    showErrorAlert(`请输入${fieldName}`);
    return false;
  }
  return true;
};

/**
 * 格式化时间显示
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
};

/**
 * 截断长文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * 创建键盘定位监听器
 * 实现点击输入框时，输入框自动上升到屏幕中心位置
 */
export const createKeyboardPositioningListener = (
  onKeyboardShow: (keyboardHeight: number, inputOffset: number) => void,
  onKeyboardHide: () => void,
  inputYPosition: number = 0
) => {
  const screenHeight = Dimensions.get('window').height;
  
  // 计算输入框需要移动的偏移量
  const calculateInputOffset = (keyboardHeight: number, yPosition: number): number => {
    const visibleScreenHeight = screenHeight - keyboardHeight;
    const inputHeight = 56; // 标准输入框高度
    const keyboardOffset = 40; // 键盘上方保留1cm左右的间距（约40px）
    const targetY = visibleScreenHeight - inputHeight - keyboardOffset;
    
    // 如果输入框已经在目标位置之上，不需要移动
    if (yPosition <= targetY) {
      return 0;
    }
    
    return targetY - yPosition;
  };

  // 配置动画
  const configureAnimation = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.7,
      },
    });
  };

  const keyboardDidShowListener = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
    (e) => {
      const keyboardHeight = e.endCoordinates.height;
      const inputOffset = calculateInputOffset(keyboardHeight, inputYPosition);
      configureAnimation();
      onKeyboardShow(keyboardHeight, inputOffset);
    }
  );

  const keyboardDidHideListener = Keyboard.addListener(
    Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
    () => {
      configureAnimation();
      onKeyboardHide();
    }
  );

  // 返回清理函数
  return () => {
    keyboardDidShowListener.remove();
    keyboardDidHideListener.remove();
  };
};

/**
 * 测量输入框位置
 */
export const measureInputPosition = (event: any, callback: (yPosition: number) => void) => {
  if (event.nativeEvent && event.nativeEvent.layout) {
    const { layout } = event.nativeEvent;
    callback(layout.y);
  }
};

/**
 * 测量输入框位置（通过ref）
 */
export const measureInputPositionByRef = (inputRef: any, callback: (yPosition: number) => void) => {
  if (inputRef.current) {
    inputRef.current.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      callback(pageY);
    });
  }
};

/**
 * 获取输入框定位样式
 */
export const getInputPositioningStyle = (offset: number) => ({
  transform: [{ translateY: offset }]
});

/**
 * 生成唯一ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};