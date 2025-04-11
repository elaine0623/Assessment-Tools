import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { GeneratedReport } from '../type';
import { generateAIReport } from '../services/aiService';

export const useAIGeneration = () => {
  const { state, dispatch } = useData();

  // 處理並標準化 API 數據的輔助函數
  const processApiData = useCallback((platform, data) => {
    if (!platform || !data) return null;
    
    // 根據不同平台處理數據
    switch (platform) {
      case 'trello':
        return {
          type: 'trello',
          cards: data.cards || [],
          boards: data.boards || [],
          status: {
            totalCards: data.cards?.length || 0,
            completedCards: data.cards?.filter(card => card.completed)?.length || 0,
            totalBoards: data.boards?.length || 0
          }
        };
        
      case 'jira':
        return {
          type: 'jira',
          issues: data.issues || [],
          projects: data.projects || [],
          stats: {
            totalIssues: data.issues?.length || 0,
            completedIssues: data.issues?.filter(issue => 
              issue.status === 'Done' || issue.status === 'Closed')?.length || 0,
            totalProjects: data.projects?.length || 0
          }
        };
        
      default:
        return null;
    }
  }, []);
  
  const generateReport = useCallback(async () => {
    dispatch({ type: 'START_GENERATION' });
    
    try {
      // 收集所有來源的資料
      const dailyRecords = Object.values(state.userInput.dailyRecords)
      .sort((a, b) => b.date.localeCompare(a.date)); // 按日期降序排序
    
// 處理 API 數據
const apiPlatform = state.userInput.apiConnection.platform;
const rawApiData = state.userInput.apiConnection.data;
const processedApiData = processApiData(apiPlatform, rawApiData);

// 構建輸入數據對象
const inputData = {
  dailyRecords,
  apiData: processedApiData,
  // apiPlatform,
  fileData: state.userInput.fileUpload.data,
  // 添加支援資訊，幫助 AI 理解數據來源
  dataSources: {
    hasDailyRecords: dailyRecords.length > 0,
    hasApiData: !!processedApiData,
    hasFileData: !!state.userInput.fileUpload.data
  }
};
      // 調用AI生成服務
      const reportContent = await generateAIReport(inputData);
      
      // 創建報告對象
      const report: GeneratedReport = {
        id: `report-${Date.now()}`,
        timestamp: new Date().toISOString(),
        content: reportContent,
        source: {
          dailyRecord: !!state.userInput.dailyRecords.content,
          apiPlatform: state.userInput.apiConnection.platform || null,
          fileUploaded: state.userInput.fileUpload.uploaded
        },
        status: 'draft'
      };
      
      // 更新狀態
      dispatch({ type: 'GENERATION_SUCCESS', payload: report });
      
    } catch (error) {
      dispatch({ 
        type: 'GENERATION_ERROR', 
        payload: error instanceof Error ? error.message : '生成報告時發生錯誤'
      });
    }
  }, [state.userInput, dispatch, processApiData]);
  
  return { generateReport, isGenerating: state.isGenerating };
};