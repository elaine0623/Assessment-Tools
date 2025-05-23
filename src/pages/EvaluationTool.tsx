import { Calendar, Database, FileText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useAIGeneration } from '../hooks/useAIGeneration';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import DailyRecord from '../components/inputs/DailyRecord';
import ApiConnection from '../components/inputs/ApiConnection';
import FileUpload from '../components/inputs/FileUpload';
import ReportDisplay from '../components/outputs/ReportDisplay';

const EvaluationTool: React.FC = () => {
  const { state, dispatch } = useData();
  const { generateReport, isGenerating } = useAIGeneration();

  const handleTabChange = (tab: 'daily' | 'api' | 'file') => {
    dispatch({ type: 'SET_TAB', payload: tab });
  };

  // 檢查是否有足夠資料可以生成報告
  const hasDataToGenerate = () => {
    const hasDailyRecords = Object.keys(state.userInput.dailyRecords).length > 0;

    const hasApiData = state.userInput.apiConnection.connected &&
      !!state.userInput.apiConnection.data;

    const hasFileData = state.userInput.fileUpload.uploaded &&
      state.userInput.fileUpload.parsed &&
      !!state.userInput.fileUpload.data;

    return hasDailyRecords || hasApiData || hasFileData;
  };

  // 獲取禁用按鈕的提示文字
  const getButtonTooltip = () => {
    if (isGenerating) {
      return "正在生成報告...";
    }

    if (!hasDataToGenerate()) {
      return "請至少輸入一種資料來源才能生成報告";
    }

    return "點擊生成考核報告";
  };

  // 是否禁用生成按鈕
  const isButtonDisabled = isGenerating || !hasDataToGenerate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Panel - Input Options */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r">
          <h2 className="text-xl font-semibold mb-4">資料來源</h2>

          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${state.currentTab === "daily" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
              onClick={() => handleTabChange('daily')}
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span>每日工作紀錄</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 ${state.currentTab === "api" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
              onClick={() => handleTabChange('api')}
            >
              <div className="flex items-center gap-2">
                <Database size={18} />
                <span>平台連接</span>
              </div>
            </button>
            <button
              className={`px-4 py-2 ${state.currentTab === "file" ? "border-b-2 border-blue-600 text-blue-600" : ""}`}
              onClick={() => handleTabChange('file')}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span>文件上傳</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="h-[70vh] flex flex-col mb-6 overflow-y-auto" >
            {state.currentTab === "daily" && <DailyRecord />}
            {state.currentTab === "api" && <ApiConnection />}
            {state.currentTab === "file" && <FileUpload />}
          </div>

          {/* Generate Button */}
          <div className="relative">
            <button
              className={`w-full py-3 rounded-md font-medium transition-colors ${isButtonDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              onClick={generateReport}
              disabled={isButtonDisabled}
              title={getButtonTooltip()}
            >
              {isGenerating ? "生成中..." : "生成考核報告"}
            </button>
          </div>
        </div>

        {/* Right Panel - Generated Content */}
        <div className="w-full md:w-1/2 p-6 bg-white overflow-y-auto">
          <ReportDisplay />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EvaluationTool;