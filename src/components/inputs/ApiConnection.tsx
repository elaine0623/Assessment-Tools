import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { connectToTrello, fetchTrelloCards } from '../../services/trelloService';
import { connectToJira, fetchJiraIssues } from '../../services/jiraService';
import { AlertCircle } from 'lucide-react';

const ApiConnection: React.FC = () => {
  const { state, dispatch } = useData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Jira 特定的狀態
  const [jiraUsername, setJiraUsername] = useState('');
  const [jiraDomain, setJiraDomain] = useState('');

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_PLATFORM', payload: e.target.value });
    dispatch({ type: 'SET_API_KEY', payload: '' });
    dispatch({ type: 'SET_TOKEN_KEY', payload: '' });
    setJiraUsername('');
    setJiraDomain('');
    setError(null);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_API_KEY', payload: e.target.value });
    setError(null);
  };
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_TOKEN_KEY', payload: e.target.value });
    setError(null);
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const platform = state.userInput.apiConnection.platform;
      const apiKey = state.userInput.apiConnection.apiKey;
      const token = state.userInput.apiConnection.token;
      // 檢查 API 金鑰格式
      if (!apiKey || apiKey.length < 32) {
        throw new Error(`請提供有效的 ${platform === 'trello' ? 'Trello' : 'Jira'} API 金鑰`);
      }

      // 針對不同平台使用不同的連接邏輯
      if (platform === 'trello') {
        // 連接 Trello 並獲取資料
        const connectionResult = await connectToTrello(apiKey, token);

        // 如果連接成功，獲取卡片數據
        if (connectionResult.connected) {
          const cardsData = await fetchTrelloCards(apiKey, token);

          // 更新狀態，包含獲取到的 Trello 資料
          dispatch({
            type: 'CONNECT_API_SUCCESS',
            payload: {
              connected: true,
              data: cardsData
            }
          });
        }
      } else if (platform === 'jira') {
        // 檢查 Jira 必要參數
        if (!jiraUsername) {
          throw new Error('請提供 Jira 用戶名');
        }

        if (!jiraDomain) {
          throw new Error('請提供 Jira 網域 (例如: your-company.atlassian.net)');
        }

        // 連接 Jira 並獲取資料
        const connectionResult = await connectToJira(jiraDomain, jiraUsername, apiKey);

        if (connectionResult.connected) {
          const issuesData = await fetchJiraIssues(jiraDomain, jiraUsername, apiKey);

          dispatch({
            type: 'CONNECT_API_SUCCESS',
            payload: {
              connected: true,
              data: issuesData
            }
          });
        }
      } else {
        // 其他平台的連接邏輯
        dispatch({ type: 'CONNECT_PLATFORM', payload: true });
      }
    } catch (err) {
      console.error('API 連接錯誤:', err);
      setError(err instanceof Error ? err.message : '連接平台時發生錯誤');
      dispatch({ type: 'CONNECT_PLATFORM', payload: false });
    } finally {
      setIsLoading(false);
    }
  };

  // 根據連接狀態顯示卡片統計
  const renderPlatformStats = () => {
    if (!state.userInput.apiConnection.connected || !state.userInput.apiConnection.data) {
      return null;
    }

    const platform = state.userInput.apiConnection.platform;
    const data = state.userInput.apiConnection.data;

    if (platform === 'trello') {
      const totalCards = data.cards.length;
      const completedCards = data.cards.filter(card => card.completed).length;

      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-700 mb-2">Trello 資料概要</h3>
          <ul className="text-sm space-y-1">
            <li>找到 {totalCards} 張卡片</li>
            <li>{completedCards} 張已完成卡片</li>
            <li>涵蓋 {data.boards.length} 個看板</li>
          </ul>
        </div>
      );
    }
    else if (platform === 'jira') {
      const totalIssues = data.issues.length;
      const completedIssues = data.issues.filter(issue => issue.status === 'Done' || issue.status === 'Closed').length;

      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h3 className="font-medium text-blue-700 mb-2">Jira 資料概要</h3>
          <ul className="text-sm space-y-1">
            <li>找到 {totalIssues} 個問題</li>
            <li>{completedIssues} 個已完成問題</li>
            <li>涵蓋 {data.projects.length} 個專案</li>
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div>
      <label className="block mb-2 text-sm font-medium">選擇平台</label>
      <select
        className="w-full p-2 border rounded-md"
        value={state.userInput.apiConnection.platform}
        onChange={handlePlatformChange}
      >
        <option value="">請選擇</option>
        <option value="jira">Jira</option>
        <option value="trello">Trello</option>
      </select>

      {state.userInput.apiConnection.platform && (
        <div className="mt-4">
          {/* Trello 串接 */}
          {state.userInput.apiConnection.platform === 'trello' && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
              <p className="mb-2 font-medium">Trello API 連接步驟:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>登入您的 Trello 帳號</li>
                <li>前往 <a href="https://trello.com/app-key" className="underline" target="_blank" rel="noopener noreferrer">https://trello.com/app-key</a></li>
                <li>複製您的 API 金鑰並取得token</li>
                <li>將 API 金鑰 & token 貼在下方</li>
              </ol>
            </div>
          )}

          {/* Jira 連接指引 */}
          {state.userInput.apiConnection.platform === 'jira' && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-sm rounded-md">
              <p className="mb-2 font-medium">Jira API 連接步驟:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>登入您的 Jira 帳號</li>
                <li>前往個人設定 &gt; 安全性 &gt; 建立 API 權杖</li>
                <li>保存生成的 API 權杖</li>
                <li>填寫下方所需資訊</li>
              </ol>
            </div>
          )}

          {/* Jira 特有設定字段 */}
          {state.userInput.apiConnection.platform === 'jira' && (
            <>
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Jira 網域</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="例如: your-company.atlassian.net"
                  value={jiraDomain}
                  onChange={(e) => setJiraDomain(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">Jira 用戶名 (電子郵件)</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded-md"
                  placeholder="您的 Jira 登錄郵箱"
                  value={jiraUsername}
                  onChange={(e) => setJiraUsername(e.target.value)}
                />
              </div>
            </>
          )}
          {/* API 金鑰輸入 */}
          <label className="block mb-2 text-sm font-medium">API Key</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md mb-2"
            placeholder={state.userInput.apiConnection.platform === 'trello' ? "輸入 Trello API 金鑰" : "輸入 Jira API 權杖"}
            value={state.userInput.apiConnection.apiKey}
            onChange={handleApiKeyChange}
          />
          {state.userInput.apiConnection.platform === 'trello' && (<><label className="block mb-2 text-sm font-medium">token</label>
            <input
              type="password"
              className="w-full p-2 border rounded-md"
              placeholder={state.userInput.apiConnection.platform === 'trello' ? "輸入 Trello token" : "輸入 Jira token"}
              value={state.userInput.apiConnection.token}
              onChange={handleTokenChange}
            /></>)}

          {error && (
            <div className="mt-2 flex items-center text-red-600 text-sm">
              <AlertCircle size={16} className="mr-1" />
              {error}
            </div>
          )}

          <button
            className={`mt-4 px-4 py-2 rounded-md font-medium ${isLoading ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
            onClick={handleConnect}
            disabled={isLoading || !state.userInput.apiConnection.apiKey}
          >
            {isLoading ? '連接中...' : '連接平台'}
          </button>

          {state.userInput.apiConnection.connected && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              已成功連接到 {state.userInput.apiConnection.platform}
            </div>
          )}

          {renderPlatformStats()}
        </div>
      )}
    </div>
  );
};

export default ApiConnection;