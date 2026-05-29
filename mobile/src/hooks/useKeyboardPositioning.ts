import { useState, useEffect, useRef } from 'react';
import { Keyboard, Platform, Dimensions, LayoutAnimation, Animated } from 'react-native';

/**
 * 智能键盘定位 Hook
 * 实现点击输入框时，输入框自动上升到屏幕中心位置
 */
export const useKeyboardPositioning = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [activeInputY, setActiveInputY] = useState(0);
  const translateY = useRef(new Animated.Value(0)).current;
  
  const screenHeight = Dimensions.get('window').height;

  // 计算输入框需要移动的偏移量
  const calculateInputOffset = (keyboardH: number, inputY: number): number => {
    const visibleScreenHeight = screenHeight - keyboardH;
    const inputHeight = 56; // 标准输入框高度
    const keyboardOffset = 40; // 键盘上方保留1cm左右的间距（约40px）
    const targetY = visibleScreenHeight - inputHeight - keyboardOffset;
    
    // 如果输入框已经在目标位置之上，不需要移动
    if (inputY <= targetY) {
      return 0;
    }
    
    return targetY - inputY;
  };

  // 动画移动输入框
  const animateInput = (offset: number) => {
    Animated.timing(translateY, {
      toValue: offset,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        const keyboardH = e.endCoordinates.height;
        setKeyboardHeight(keyboardH);
        
        // 计算输入框偏移量
        const offset = calculateInputOffset(keyboardH, activeInputY);
        animateInput(offset);
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
        animateInput(0);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [activeInputY]);

  // 设置活动输入框位置
  const setInputPosition = (yPosition: number) => {
    setActiveInputY(yPosition);
  };

  // 获取输入框定位样式
  const getInputStyle = () => ({
    transform: [{ translateY }]
  });

  return {
    keyboardHeight,
    setInputPosition,
    getInputStyle,
  };
};

export default useKeyboardPositioning;