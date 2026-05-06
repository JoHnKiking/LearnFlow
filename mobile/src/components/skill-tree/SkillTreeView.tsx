import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SkillTree, PlatformType } from '../../types/skill';
import { PLATFORM_NAME_MAP } from '../../data/skillTrees';

interface SkillTreeViewProps {
  skillTree: SkillTree;
}

const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case 'bilibili':
      return { icon: 'play-circle', color: '#FB7299' };
    case 'xiaohongshu':
      return { icon: 'book', color: '#FF2442' };
    case 'mooc':
      return { icon: 'graduation-cap', color: '#5D9BFA' };
    default:
      return { icon: 'link', color: '#888' };
  }
};

const getStageColor = (stage: string) => {
  switch (stage) {
    case 'beginner':
      return { bg: 'rgba(93, 155, 250, 0.15)', border: 'rgba(93, 155, 250, 0.3)', text: '#5D9BFA' };
    case 'intermediate':
      return { bg: 'rgba(72, 209, 176, 0.15)', border: 'rgba(72, 209, 176, 0.3)', text: '#48D1B0' };
    case 'advanced':
      return { bg: 'rgba(255, 152, 0, 0.15)', border: 'rgba(255, 152, 0, 0.3)', text: '#FF9800' };
    default:
      return { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)', text: '#fff' };
  }
};

const StageNode: React.FC<{ name: string; duration: number; stageColor: ReturnType<typeof getStageColor> }> = ({ name, duration, stageColor }) => (
  <View style={[styles.stageNode, { backgroundColor: stageColor.bg, borderColor: stageColor.border }]}>
    <Text style={[styles.stageName, { color: stageColor.text }]}>{name}</Text>
    <Text style={styles.stageDuration}>{duration}小时</Text>
  </View>
);

const SkillNode: React.FC<{
  name: string;
  platform: PlatformType;
  duration: number;
  url: string;
  index: number;
  stageColor: ReturnType<typeof getStageColor>;
}> = ({ name, platform, duration, url, index, stageColor }) => {
  const platformInfo = getPlatformIcon(platform);

  const handlePress = async () => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.skillNode, { borderColor: stageColor.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.skillNodeHeader}>
        <View style={styles.nodeBadge}>
          <Text style={styles.nodeBadgeText}>{index + 1}</Text>
        </View>
        <Ionicons name={platformInfo.icon} size={14} color={platformInfo.color} />
      </View>
      <Text style={styles.skillNodeName}>{name}</Text>
      <View style={styles.skillNodeFooter}>
        <Text style={[styles.platformText, { color: platformInfo.color }]}>
          {PLATFORM_NAME_MAP[platform]}
        </Text>
        <Text style={styles.durationText}>{duration}h</Text>
      </View>
      <View style={styles.arrowIcon}>
        <Ionicons name="arrow-right" size={14} color="#5D9BFA" />
      </View>
    </TouchableOpacity>
  );
};

const SkillTreeView: React.FC<SkillTreeViewProps> = ({ skillTree }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{skillTree.title}</Text>
        <Text style={styles.description}>{skillTree.description}</Text>
        <View style={styles.totalDurationBadge}>
          <Ionicons name="clock" size={14} color="#5D9BFA" />
          <Text style={styles.totalDurationText}>总时长 {skillTree.totalDuration}小时</Text>
        </View>
      </View>

      <View style={styles.treeContainer}>
        <View style={styles.centerNode}>
          <View style={styles.centerNodeInner}>
            <Ionicons name="target" size={28} color="#fff" />
            <Text style={styles.centerNodeText}>学习领域</Text>
          </View>
        </View>

        <View style={styles.stagesContainer}>
          {skillTree.stages.map((stage, stageIndex) => {
            const stageColor = getStageColor(stage.id);
            return (
              <View key={stage.id} style={[styles.stageColumn, stageIndex === 1 && styles.middleStage]}>
                <View style={styles.stageConnector}>
                  <View style={[styles.connectorLine, { backgroundColor: stageColor.text }]} />
                </View>

                <StageNode name={stage.name} duration={stage.duration} stageColor={stageColor} />

                <View style={styles.skillNodesList}>
                  {stage.nodes.map((node, nodeIndex) => (
                    <SkillNode
                      key={node.id}
                      name={node.name}
                      platform={node.platform}
                      duration={node.duration}
                      url={node.url}
                      index={nodeIndex}
                      stageColor={stageColor}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalDurationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(93, 155, 250, 0.15)',
  },
  totalDurationText: {
    fontSize: 12,
    color: '#5D9BFA',
    fontWeight: '600',
  },
  treeContainer: {
    flex: 1,
    alignItems: 'center',
  },
  centerNode: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'linear-gradient(135deg, #5D9BFA 0%, #8B5CF6 100%)',
    background: 'linear-gradient(135deg, #5D9BFA 0%, #8B5CF6 100%)',
    shadowColor: '#5D9BFA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(93, 155, 250, 0.5)',
  },
  centerNodeInner: {
    alignItems: 'center',
    gap: 6,
  },
  centerNodeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  stagesContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  stageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  middleStage: {
    marginTop: 20,
  },
  stageConnector: {
    height: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  connectorLine: {
    width: 3,
    height: '100%',
    borderRadius: 2,
  },
  stageNode: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  stageName: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  stageDuration: {
    fontSize: 10,
    color: '#888',
  },
  skillNodesList: {
    gap: 8,
    width: '100%',
  },
  skillNode: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  skillNodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  nodeBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(93, 155, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeBadgeText: {
    fontSize: 10,
    color: '#5D9BFA',
    fontWeight: '700',
  },
  skillNodeName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 16,
  },
  skillNodeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  platformText: {
    fontSize: 10,
    fontWeight: '500',
  },
  durationText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500',
  },
  arrowIcon: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});

export default SkillTreeView;