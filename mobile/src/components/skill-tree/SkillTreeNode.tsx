import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SkillNode } from '../../types/skill';
import { COLORS, SPACING } from '../../utils/constants';

interface SkillTreeNodeProps {
  node: SkillNode;
  level: number;
  isExpanded: boolean;
  onToggle: (nodeId: string) => void;
  onLinkPress: (url: string) => void;
}

const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
  node,
  level,
  isExpanded,
  onToggle,
  onLinkPress,
}) => {
  const hasChildren = node.children && node.children.length > 0;
  const marginLeft = level * SPACING.MEDIUM;

  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const handleLinkPress = (url: string) => {
    onLinkPress(url);
  };

  return (
    <View style={[styles.container, { marginLeft }]}>
      {/* 节点头部 */}
      <TouchableOpacity
        style={[
          styles.nodeHeader,
          hasChildren && styles.nodeHeader_interactive,
        ]}
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
      )}

      {/* 子节点 */}
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
  container: {
    marginBottom: SPACING.SMALL,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  nodeHeader_interactive: {
    // 可交互样式
  },
  nodeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: SPACING.SMALL,
  },
  nodeDescription: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.SMALL,
    marginLeft: SPACING.MEDIUM,
    lineHeight: 20,
  },
  linksContainer: {
    marginTop: SPACING.SMALL,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    backgroundColor: '#e8f4fd',
    borderRadius: 6,
    marginTop: SPACING.SMALL,
  },
  linkText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    flex: 1,
  },
  linkIcon: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    marginLeft: SPACING.SMALL,
  },
  childrenContainer: {
    marginTop: SPACING.SMALL,
  },
});

export default SkillTreeNode;