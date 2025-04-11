import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { AppState, GeneratedReport, TabType, DailyRecordEntry } from '../type';


const loadInitialState = (): AppState => {
  try {
    const savedDailyRecords = localStorage.getItem('dailyRecords');
    const baseInitialState: AppState = {
      currentTab: 'daily',
      userInput: {
        dailyRecords: {},
        apiConnection: { platform: '', apiKey: '', token: '', connected: false },
        fileUpload: { file: null, uploaded: false, parsed: false, data: null }
      },
      isGenerating: false,
      generatedReports: [],
      currentReport: null,
      error: null
    };
    return {
      ...baseInitialState,
      userInput: {
        ...baseInitialState.userInput,
        dailyRecords: savedDailyRecords ? JSON.parse(savedDailyRecords) : {}
      }
    }
  } catch (error) {
    console.error('從 localStorage 加載數據時出錯:', error);
    // 出錯時返回默認初始狀態
    return {
      currentTab: 'daily',
      userInput: {
        dailyRecords: {},
        apiConnection: { platform: '', apiKey: '', token: '', connected: false },
        fileUpload: { file: null, uploaded: false, parsed: false, data: null }
      },
      isGenerating: false,
      generatedReports: [],
      currentReport: null,
      error: null
    };
  }
}
const initialState = loadInitialState();


// 定義動作類型
type Action =
  | { type: 'SET_TAB'; payload: TabType }
  | { type: 'ADD_DAILY_RECORD'; payload: DailyRecordEntry }
  | { type: 'DELETE_DAILY_RECORD'; payload: string } // 日期
  | { type: 'SET_PLATFORM'; payload: string }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'SET_TOKEN_KEY'; payload: string }
  | { type: 'CONNECT_PLATFORM'; payload: boolean }
  | { type: 'CONNECT_API_SUCCESS'; payload: { connected: boolean; data: any } } // 新增
  | { type: 'SET_FILE'; payload: File | null } //File 對象本身，不包含文件內容
  | { type: 'SET_FILE_UPLOADED'; payload: boolean } //標記文件是否已經被上傳到組件中
  | { type: 'SET_FILE_DATA'; payload: any } //解析後的excel內容
  | { type: 'SET_FILE_PARSED'; payload: boolean } //標記 Excel 文件是否已成功被解析
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_SUCCESS'; payload: GeneratedReport }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'UPDATE_REPORT_CONTENT'; payload: { reportId: string; content: string } };

// 定義reducer函數
function dataReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
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
}>({ state: initialState, dispatch: () => null });

// 創建Provider組件
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  // 當狀態中的每日記錄時，更新 localStorage
  useEffect(() => {
    try {
      // 保存每日記錄
      localStorage.setItem('dailyRecords', JSON.stringify(state.userInput.dailyRecords));
    } catch (error) {
      console.error('保存數據到 localStorage 時出錯:', error);
    }
  }, [state.userInput.dailyRecords]);
  console.log(state)

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

// 創建自定義hook便於使用
export const useData = () => useContext(DataContext);