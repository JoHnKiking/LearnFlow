import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../utils/constants';

interface LoadingProps {
  visible: boolean;
  message?: string;
  type?: 'overlay' | 'inline';
}

const Loading: React.FC<LoadingProps> = ({
  visible,
  message = '处理中...',
  type = 'overlay',
}) => {
  if (!visible) return null;

  if (type === 'overlay') {
    return (
      <View style={styles.overlay}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <Text style={styles.loadingText}>{message}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size="small" color={COLORS.PRIMARY} />
      <Text style={styles.inlineText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingContainer: {
    backgroundColor: COLORS.WHITE,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '600',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  inlineText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
});

export default Loading;