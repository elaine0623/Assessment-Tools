import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, GeneratedReport, TabType, DailyRecordEntry } from '../type';
import { getDailyData } from '../services/apiService';

const getInitialState = (): AppState => ({
  currentTab: 'daily',
  userInput: {
    userName: '',
    job_name: '',
    dailyRecords: {},
    apiConnection: { platform: '', apiKey: '', token: '', connected: false },
    fileUpload: { file: null, uploaded: false, parsed: false, data: null }
  },
  isGenerating: false,
  generatedReports: [],
  currentReport: null,
  error: null
});

// 定義動作類型
export type Action =
  | { type: 'SET_USER_NAME'; payload: string }
  | { type: 'SET_USER_JOB'; payload: string }
  | { type: 'SET_TAB'; payload: TabType }
  | { type: 'ADD_DAILY_RECORD'; payload: DailyRecordEntry }
  | { type: 'DELETE_DAILY_RECORD'; payload: string }
  | { type: 'SET_DAILY_RECORDS'; payload: { [date: string]: DailyRecordEntry } }
  | { type: 'SET_PLATFORM'; payload: string }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_TOKEN_KEY'; payload: string }
  | { type: 'CONNECT_PLATFORM'; payload: boolean }
  | { type: 'CONNECT_API_SUCCESS'; payload: { connected: boolean; data: any } }
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'SET_FILE_UPLOADED'; payload: boolean }
  | { type: 'SET_FILE_DATA'; payload: any }
  | { type: 'SET_FILE_PARSED'; payload: boolean }
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_SUCCESS'; payload: GeneratedReport }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'UPDATE_REPORT_CONTENT'; payload: { reportId: string; content: string } };

// 定義reducer函數
function dataReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_USER_NAME':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          userName: action.payload
        }
      };
    case 'SET_USER_JOB':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          job_name: action.payload
        }
      };
    case 'SET_DAILY_RECORDS':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          dailyRecords: action.payload
        }
      };
    case 'SET_TAB':
      return { ...state, currentTab: action.payload };
    case 'ADD_DAILY_RECORD':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          dailyRecords: {
            ...state.userInput.dailyRecords,
            [action.payload.date]: action.payload
          }
        }
      };
    case 'DELETE_DAILY_RECORD':
      const { [action.payload]: _, ...remainingRecords } = state.userInput.dailyRecords;
      return {
        ...state,
        userInput: {
          ...state.userInput,
          dailyRecords: remainingRecords
        }
      };
    case 'SET_PLATFORM':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          apiConnection: {
            ...state.userInput.apiConnection,
            platform: action.payload as any,
            connected: false
          }
        }
      };
    case 'SET_API_KEY':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          apiConnection: {
            ...state.userInput.apiConnection,
            apiKey: action.payload
          }
        }
      };
    case 'SET_TOKEN_KEY':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          apiConnection: {
            ...state.userInput.apiConnection,
            token: action.payload
          }
        }
      };
    case 'CONNECT_PLATFORM':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          apiConnection: {
            ...state.userInput.apiConnection,
            connected: action.payload
          }
        }
      };
    case 'CONNECT_API_SUCCESS':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          apiConnection: {
            ...state.userInput.apiConnection,
            connected: action.payload.connected,
            data: action.payload.data
          }
        }
      };
    case 'SET_FILE':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          fileUpload: {
            ...state.userInput.fileUpload,
            file: action.payload
          }
        }
      };
    case 'SET_FILE_UPLOADED':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          fileUpload: {
            ...state.userInput.fileUpload,
            uploaded: action.payload
          }
        }
      };
    case 'SET_FILE_DATA':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          fileUpload: {
            ...state.userInput.fileUpload,
            data: action.payload
          }
        }
      };

    case 'SET_FILE_PARSED':
      return {
        ...state,
        userInput: {
          ...state.userInput,
          fileUpload: {
            ...state.userInput.fileUpload,
            parsed: action.payload
          }
        }
      };
    case 'START_GENERATION':
      return { ...state, isGenerating: true, error: null };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        currentReport: action.payload,
        generatedReports: [...state.generatedReports, action.payload]
      };
    case 'GENERATION_ERROR':
      return { ...state, isGenerating: false, error: action.payload };
    case 'UPDATE_REPORT_CONTENT':
      // 更新指定 ID 的報告內容
      if (state.currentReport && state.currentReport.id === action.payload.reportId) {
        // 更新當前報告
        const updatedCurrentReport = {
          ...state.currentReport,
          content: action.payload.content
        };

        // 更新報告列表中的對應報告
        const updatedReports = state.generatedReports.map(report =>
          report.id === action.payload.reportId
            ? updatedCurrentReport
            : report
        );

        return {
          ...state,
          currentReport: updatedCurrentReport,
          generatedReports: updatedReports
        };
      }
      return state;
    default:
      return state;
  }

}

// 創建上下文
const DataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: getInitialState(), dispatch: () => null });

// 創建Provider組件
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, getInitialState());

  // 當用戶名稱變化時，從資料庫獲取數據
  useEffect(() => {
    const fetchDailyRecords = async () => {
      if (state.userInput.userName) {
        try {
          var dailyRecords = await getDailyData(state.userInput.userName);
          var dailyRecords = dailyRecords.data
          dispatch({
            type: 'SET_DAILY_RECORDS',
            payload: dailyRecords
          });
          console.log(dailyRecords)
        } catch (error) {
          console.error('獲取每日記錄時出錯:', error);
        }
      }
    };

    fetchDailyRecords();
  }, [state.userInput.userName]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

// 創建自定義hook便於使用
export const useData = () => useContext(DataContext);