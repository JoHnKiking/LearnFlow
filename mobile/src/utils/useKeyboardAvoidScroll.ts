import { useRef, useCallback, useEffect } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  KeyboardEvent,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';

// ================================================================
// useKeyboardAvoidScroll
// iOS 水流式丝滑键盘避让 Hook
//
// 核心设计：
// 1. measureInWindow 绝对定位 — 聚焦时用原生 measureInWindow 获取输入框
//    在屏幕上的绝对坐标，换算为 ScrollView 内容坐标，彻底解决 onLayout
//    相对坐标导致的偏移错误
// 2. keyboardWillShow 抢占 — 键盘动画开始前获取 duration，LayoutAnimation
//    匹配动画曲线，scrollTo 在动画上下文中丝滑同步
// 3. onScroll 追踪 — 记录当前滚动偏移，确保切换输入框时计算准确
// 4. ref 避免闭包 — 可变数据全部通过 useRef 存储，键盘监听器只挂载一次
//
// 使用方式：
//   const { scrollViewRef, handleInputFocus, handleInputBlur, onScroll } = useKeyboardAvoidScroll();
//   const emailRef = useRef<TextInput>(null);
//
//   <ScrollView ref={scrollViewRef} onScroll={onScroll}>
//     <TextInput ref={emailRef} onFocus={() => handleInputFocus(emailRef)} onBlur={handleInputBlur} />
//   </ScrollView>
// ================================================================

const KEYBOARD_TOP_PADDING = 12; // 输入框底部到键盘顶部的舒适间距

export const useKeyboardAvoidScroll = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const activeInputRef = useRef<TextInput | null>(null);
  const keyboardHeightRef = useRef(0);
  const currentScrollYRef = useRef(0);

  // ============================================================
  // 测量 + 滚动：获取输入框在 ScrollView 内容中的真实坐标
  // 并滚动到键盘上方合适位置
  // ============================================================
  const measureAndScroll = useCallback(() => {
    const input = activeInputRef.current;
    const sv = scrollViewRef.current;
    if (!input || !sv) return;

    const kbHeight = keyboardHeightRef.current;
    if (kbHeight === 0) return;

    // Step 1: 获取输入框的屏幕绝对坐标
    input.measureInWindow((_ix: number, iy: number, _iw: number, ih: number) => {
      // Step 2: 获取 ScrollView 的屏幕绝对坐标
      sv.measureInWindow((_sx: number, sy: number) => {
        const screenH = Dimensions.get('window').height;
        const visibleBottom = screenH - kbHeight;
        const inputWindowBottom = iy + ih;

        if (inputWindowBottom > visibleBottom - KEYBOARD_TOP_PADDING) {
          // Step 3: 换算为 ScrollView 内容坐标
          //   contentY = (input窗口Y - scrollView窗口Y) + 当前滚动偏移
          //   例如: 输入框在屏幕 y=500, ScrollView 在屏幕 y=100, 已滚动 0
          //         contentY = 500 - 100 + 0 = 400 ← 这才是 scrollTo 需要的值
          const contentY = iy - sy + currentScrollYRef.current;

          // Step 4: 计算目标滚动量
          //   让输入框底部刚好在 visibleBottom - padding 处
          const targetY = Math.max(
            0,
            contentY + ih - visibleBottom + KEYBOARD_TOP_PADDING
          );

          sv.scrollTo({ y: targetY, animated: false });
        }
      });
    });
  }, []);

  // ============================================================
  // 追踪 ScrollView 的当前滚动偏移
  // ============================================================
  const onScroll = useCallback((event: any) => {
    currentScrollYRef.current = event.nativeEvent?.contentOffset?.y || 0;
  }, []);

  // ============================================================
  // 输入框 onFocus：记录活跃输入框，键盘已显示时直接滚动
  // ============================================================
  const handleInputFocus = useCallback(
    (ref: React.RefObject<TextInput>) => {
      activeInputRef.current = ref.current as TextInput | null;

      // 键盘已显示，用户正在切换输入框 → 立即测量并滚动
      if (keyboardHeightRef.current > 0) {
        // rAF 确保布局稳定后测量
        requestAnimationFrame(() => {
          measureAndScroll();
        });
      }
    },
    [measureAndScroll]
  );

  // ============================================================
  // 输入框 onBlur：清除活跃引用
  // ============================================================
  const handleInputBlur = useCallback(() => {
    activeInputRef.current = null;
  }, []);

  // ============================================================
  // 键盘事件监听（只挂载一次）
  // ============================================================
  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e: KeyboardEvent) => {
      keyboardHeightRef.current = e.endCoordinates.height;

      // 匹配键盘动画参数
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext({
          duration: e.duration || 280,
          create: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
          update: {
            type: LayoutAnimation.Types.easeInEaseOut,
          },
          delete: {
            type: LayoutAnimation.Types.easeInEaseOut,
            property: LayoutAnimation.Properties.opacity,
          },
        });
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      // measureInWindow 需要布局稳定，用 rAF 确保
      requestAnimationFrame(() => {
        measureAndScroll();
      });
    });

    const hideSub = Keyboard.addListener(hideEvent, (e: KeyboardEvent) => {
      keyboardHeightRef.current = 0;

      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext({
          duration: e.duration || 280,
          update: { type: LayoutAnimation.Types.easeInEaseOut },
        });
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [measureAndScroll]);

  return {
    scrollViewRef,
    handleInputFocus,
    handleInputBlur,
    onScroll,
  };
};
