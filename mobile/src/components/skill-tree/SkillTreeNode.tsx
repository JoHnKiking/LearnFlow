import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SkillNode as SkillNodeType } from '../../types/skill';
import { COLORS, SPACING } from '../../utils/constants';

/**
 * 技能树节点组件属性
 */
interface SkillTreeNodeProps {
  /** 节点数据 */
  node: SkillNodeType;
  /** 缩进层级 */
  level: number;
  /** 是否展开显示子节点 */
  isExpanded: boolean;
  /** 切换展开状态回调 */
  onToggle: (nodeId: string) => void;
  /** 点击学习资源链接回调 */
  onLinkPress: (url: string) => void;
}

/**
 * 技能树节点组件
 * 递归渲染技能树中的节点，支持展开/折叠子节点
 */
const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onLinkPress,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const marginLeft = level * SPACING.MEDIUM;

  /**
   * 切换节点展开状态
   */
  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  /**
   * 处理学习资源链接点击
   */
  const handleLinkPress = (url: string) => {
    onLinkPress(url);
  };

  return (
    <View style={[styles.container, { marginLeft }]}>
      {/* 节点头部 */}
      <TouchableOpacity
        style={[styles.nodeHeader, hasChildren && styles.nodeHeaderInteractive]}
        onPress={handleToggle}
        disabled={!hasChildren}
      >
        <Text style={styles.nodeName} numberOfLines={1}>
          {node.name}
        </Text>
        {hasChildren && (
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 节点描述 */}
      {node.description && (
        <Text style={styles.nodeDescription}>
          {node.description}
        </Text>
      )}

      {/* 学习资源链接 */}
      {node.links && node.links.length > 0 && (
        <View style={styles.linksContainer}>
          {node.links.map((link, index) => (
          <TouchableOpacity
            key={index}
            style={styles.linkButton}
            onPress={() => handleLinkPress(link.url)}
          >
            <Text style={styles.linkText} numberOfLines={1}>
              {link.title || '学习资源'}
            </Text>
            <Text style={styles.linkIcon}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 子节点 - 递归渲染 */}
      {isExpanded && hasChildren && (
        <View style={styles.childrenContainer}>
          {node.children!.map((child) => (
            <SkillTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              onToggle={onToggle}
              onLinkPress={onLinkPress}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  /** 容器样式 */
  container: {
    marginBottom: SPACING.SMALL,
  },
  /** 节点头部样式 */
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  /** 可交互节点头部样式（有子节点时） */
  nodeHeaderInteractive: {
    // 可在此添加可交互状态的样式
  },
  /** 节点名称样式 */
  nodeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  /** 展开/折叠图标样式 */
  expandIcon: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SMALL,
  },
  /** 节点描述样式 */
  nodeDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
    marginLeft: SPACING.MEDIUM,
    lineHeight: 20,
  },
  /** 学习资源链接容器样式 */
  linksContainer: {
    marginTop: SPACING.SMALL,
  },
  /** 学习资源链接按钮样式 */
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    marginTop: SPACING.SMALL,
  },
  /** 学习资源链接文字样式 */
  linkText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    flex: 1,
  },
  /** 学习资源链接箭头样式 */
  linkIcon: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.SMALL,
  },
  /** 子节点容器样式 */
  childrenContainer: {
    marginTop: SPACING.SMALL,
  },
});

export default SkillTreeNode;