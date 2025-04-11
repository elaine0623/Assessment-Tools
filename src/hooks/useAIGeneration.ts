import { useCallback } from 'react';
import { useData } from '../contexts/DataContext';
import { GeneratedReport } from '../type';
import { generateAIReport } from '../services/aiService';
import { JiraIssue, TrelloCard,TrelloData,JiraData } from '../type';

interface ProcessedTrelloData {
  type: 'trello';
  cards: TrelloCard[];
  boards: any[]; // Consider using a more specific type from your type definitions
  status: {
    totalCards: number;
    completedCards: number;
    totalBoards: number;
  };
}

interface ProcessedJiraData {
  type: 'jira';
  issues: JiraIssue[];
  projects: any[]; // Consider using a more specific type from your type definitions
  stats: {
    totalIssues: number;
    completedIssues: number;
    totalProjects: number;
  };
}
type ProcessedData = ProcessedTrelloData | ProcessedJiraData | null;


export const useAIGeneration = () => {
  const { state, dispatch } = useData();

  // 處理並標準化 API 數據的輔助函數
  const processApiData = useCallback((platform: 'trello' | 'jira' | '', data: TrelloData | JiraData | undefined): ProcessedData => {
    if (!platform || !data) return null;
    
    // 根據不同平台處理數據
    switch (platform) {
      case 'trello':{
        const trelloData = data as TrelloData;
        return {
          type: 'trello',
          cards: trelloData.cards || [],
          boards: trelloData.boards || [],
          status: {
            totalCards: trelloData.cards?.length || 0,
            completedCards: trelloData.cards?.filter((card: TrelloCard) => card.completed)?.length || 0,
            totalBoards: trelloData.boards?.length || 0
          }
        }
        }
      case 'jira':{
        const jiraData = data as JiraData;
        return {
          type: 'jira',
          issues: jiraData.issues || [],
          projects: jiraData.projects || [],
          stats: {
            totalIssues: jiraData.issues?.length || 0,
            completedIssues: jiraData.issues?.filter((issue: JiraIssue) => 
              issue.status === 'Done' || issue.status === 'Closed')?.length || 0,
            totalProjects: jiraData.projects?.length || 0
          }
        };
      }
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