// src/services/aiService.ts
import { TrelloData } from '../type';
import { extractWorkSummary } from './trelloService';

// 模擬與AI服務的交互
export const generateAIReport = async (inputData: any): Promise<string> => {
  // 在實際應用中，這裡會調用AI API
  // 現在先返回模擬數據
  console.log(inputData);
  
  // 生成報告內容
  let reportContent = `## 考核報告\n\n`;
  
  // 處理每日記錄
  if (inputData.dailyRecords && inputData.dailyRecords.length > 0) {
    reportContent += `### 每日工作記錄摘要\n`;
    reportContent += extractDailyRecordSummary(inputData.dailyRecords);
    reportContent += `\n\n`;
  }
  
  // 處理 Trello 數據
  if (inputData.apiData && inputData.apiConnection?.platform === 'trello') {
    reportContent += extractWorkSummary(inputData.apiData);
    reportContent += `\n\n`;
  }
  
  // 處理文件數據
  if (inputData.fileData) {
    reportContent += `### 文件數據分析\n`;
    reportContent += `暫無文件數據分析功能。\n\n`;
  }
  
  // 添加績效評估
  reportContent += generatePerformanceEvaluation(inputData);
  
  // 添加未來目標
  reportContent += `### 未來目標\n`;
  reportContent += `- 繼續優化現有系統\n`;
  reportContent += `- 學習新技術框架\n`;
  reportContent += `- 提高團隊溝通效率\n`;
  
  // 模擬AI處理時間
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(reportContent);
    }, 2000);
  });
};

// 從每日記錄中提取摘要
const extractDailyRecordSummary = (dailyRecords: string[]): string => {
  // 簡單地返回分段的每日記錄
  
  let summary = '';

  if (dailyRecords.length === 0) {
    summary = '- 無每日工作記錄';
  } else {
    // 提取每個記錄的摘要
    dailyRecords.forEach((record, index) => {
      summary += `- 記錄 ${index + 1}: ${record?.content}\n`;
    });

    if (dailyRecords.length > 3) {
      summary += `- 以及其他 ${dailyRecords.length - 3} 項工作內容...\n`;
    }
  }

  return summary;
};

// 生成績效評估
const generatePerformanceEvaluation = (inputData: any): string => {
  // 計算任務完成率
  let completionRate = 95; // 預設值
  
  // 如果有 Trello 數據，根據卡片完成情況計算
  if (inputData.apiData && inputData.apiData.platform === 'trello') {
    const trelloData: TrelloData = inputData.apiData;
    const assignedCards = trelloData.cards.filter(card => card.assignedToMe);
    const completedCards = assignedCards.filter(card => card.completed);
    
    if (assignedCards.length > 0) {
      completionRate = Math.round((completedCards.length / assignedCards.length) * 100);
    }
  }
  
  // 根據完成率確定評級
  let qualityRating = '優良';
  let collaborationRating = '優秀';
  
  if (completionRate < 70) {
    qualityRating = '需要改進';
    collaborationRating = '一般';
  } else if (completionRate < 85) {
    qualityRating = '良好';
    collaborationRating = '良好';
  }
  
  // 生成評估內容
  let evaluation = `### 績效評估\n`;
  evaluation += `任務完成度: ${completionRate}%\n`;
  evaluation += `工作質量: ${qualityRating}\n`;
  evaluation += `協作能力: ${collaborationRating}\n\n`;
  
  return evaluation;
};