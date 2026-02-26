import * as DomainModel from '../models/Domain';
import * as NodeProgressModel from '../models/NodeProgress';
import * as StudyRecordModel from '../models/StudyRecord';
import * as RewardModel from '../models/Reward';
import * as MonsterService from './monsterService';
import { generateMockSkillTree } from './skillService';
import { SkillNode } from '../types/skill';

export const createDomain = async (userId: number, name: string, type: 'custom' | 'preset') => {
  const mindMapData = await generateMockSkillTree(name);
  const domainId = await DomainModel.createDomain({
    userId,
    name,
    type,
    mindMapData
  });

  await initializeNodeProgress(userId, domainId, mindMapData);

  return { success: true, domainId, mindMapData };
};

const initializeNodeProgress = async (userId: number, domainId: number, node: SkillNode) => {
  await NodeProgressModel.createNodeProgress({
    userId,
    domainId,
    nodeId: node.id
  });

  if (node.children) {
    for (const child of node.children) {
      await initializeNodeProgress(userId, domainId, child);
    }
  }
};

export const getDomains = async (userId: number) => {
  const domains = await DomainModel.getDomainsByUserId(userId);
  return { domains };
};

export const getDomainById = async (id: number) => {
  const domain = await DomainModel.getDomainById(id);
  if (!domain) {
    return null;
  }

  const nodeProgresses = await NodeProgressModel.getNodeProgressesByDomain(domain.userId, id);
  const progressMap = new Map<string, NodeProgressModel.NodeProgress>();
  
  for (const progress of nodeProgresses) {
    progressMap.set(progress.nodeId, progress);
  }

  return {
    ...domain,
    nodeProgresses: progressMap
  };
};

export const updateNodeProgress = async (
  userId: number,
  domainId: number,
  nodeId: string,
  status: 'pending' | 'doing' | 'done',
  studyTime?: number,
  notes?: string
) => {
  await NodeProgressModel.updateNodeProgress(userId, domainId, nodeId, {
    status,
    studyTime,
    notes
  });

  await calculateDomainProgress(domainId);

  if (status === 'done') {
    await RewardModel.createReward({
      userId,
      type: 'exp',
      amount: 10,
      source: `完成节点: ${nodeId}`
    });

    await MonsterService.addExp(userId, 10);
  }

  return { success: true };
};

const calculateDomainProgress = async (domainId: number) => {
  const domain = await DomainModel.getDomainById(domainId);
  if (!domain) return;

  const nodeProgresses = await NodeProgressModel.getNodeProgressesByDomain(domain.userId, domainId);
  
  let totalNodes = 0;
  let completedNodes = 0;

  const countNodes = (node: SkillNode) => {
    totalNodes++;
    const progress = nodeProgresses.find(p => p.nodeId === node.id);
    if (progress?.status === 'done') {
      completedNodes++;
    }
    if (node.children) {
      for (const child of node.children) {
        countNodes(child);
      }
    }
  };

  countNodes(domain.mindMapData);

  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;
  await DomainModel.updateDomainProgress(domainId, progress);
};

export const startLearning = async (userId: number, domainId: number, nodeId: string) => {
  const hasEnergy = await MonsterService.consumeEnergy(userId);
  if (!hasEnergy) {
    return { success: false, error: '体力不足' };
  }

  const domain = await DomainModel.getDomainById(domainId);
  const recordId = await StudyRecordModel.createStudyRecord({
    userId,
    domainId,
    nodeId,
    startTime: new Date(),
    progressBefore: domain?.progress || 0
  });

  await NodeProgressModel.updateNodeProgress(userId, domainId, nodeId, {
    status: 'doing'
  });

  return { success: true, recordId };
};

export const finishLearning = async (recordId: number, duration: number, progressAfter: number) => {
  await StudyRecordModel.updateStudyRecord(recordId, {
    endTime: new Date(),
    duration,
    progressAfter,
    rewardObtained: { exp: duration > 0 ? Math.floor(duration / 60) * 5 : 0 }
  });

  return { success: true };
};
