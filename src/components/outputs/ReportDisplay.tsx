import { FileText } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import React, { useState, useEffect } from 'react';


const ReportDisplay: React.FC = () => {
  const { state, dispatch } = useData();
  const [editedContent, setEditedContent] = useState('');

  // 當報告內容變化時更新編輯區域
  useEffect(() => {
    if (state.currentReport) {
      setEditedContent(state.currentReport.content);
    }
  }, [state.currentReport]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditedContent(newContent);

    // 更新 context 中的報告內容
    if (state.currentReport) {
      dispatch({
        type: 'UPDATE_REPORT_CONTENT',
        payload: {
          reportId: state.currentReport.id,
          content: newContent
        }
      });
    }
  };

  const handleDownload = () => {
    if (!editedContent) return;

    const blob = new Blob([editedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `評核報告_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h2 className="text-xl font-semibold">AI 生成的自述考核內容</h2>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
          onClick={handleDownload}
        >
          下載報告
        </button>
      </div>

      {state.isGenerating ? (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">AI 正在分析您的資料...</p>
        </div>
      ) : state.currentReport ? (
        <div className="prose max-w-none">
          <textarea value={editedContent}
            onChange={handleContentChange} className="w-full h-[75vh] whitespace-pre-wrap bg-gray-50 p-4 rounded-md" />

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FileText size={48} />
          <p className="mt-2">請輸入資料並點擊生成按鈕</p>
        </div>
      )}

      {state.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          錯誤: {state.error}
        </div>
      )}
    </div>
  );
};

export default ReportDisplay;