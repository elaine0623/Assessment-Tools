import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useData } from '../contexts/DataContext';
import FileUpload from './inputs/FileUpload';
import { CircleArrowLeft } from 'lucide-react';


const Manager: React.FC = () => {
    const navigate = useNavigate();
    //   const { state } = useData();
    const [selectedJob, setSelectedJob] = useState('前端主管');
    // const [selectedSource, setSelectedSource] = useState('');

    const workSummary = {
        title: '一、工作成果概述',
        content: '本月主要負責 AI 考核小工具的 UI/UX 規劃與設計，包含三大功能模組的資訊架構、使用流程規劃、視覺稿製作與前端協作。設計重點放在提升使用者效率、情緒價值回饋與整體體驗流暢性。'
    };

    const jobDetails = {
        title: '二、具體任務與貢獻',
        items: [
            '主導「每日工作紀錄」模組設計，整合日曆互動、資料填寫與紀錄回顧介面',
            '規劃「AI 文案產出」功能，協助使用者從紀錄或 API 整合資料，快速形成內容',
            '設計「主管專區」頁面，引導主管上傳考核後產出回饋建議，提升審閱效率',
            '提出視覺語言風格與 UI 元件標準，確保設計一致性與模組可延展性'
        ]
    };

    const collaboration = {
        title: '三、合作與溝通表現',
        items: [
            '積極與 PM、工程師同步需求與實作細節，確保 UI 實現與效能考量平衡',
            '主動提出流程優化建議，如預設鼓勵語句與設計、月報彙整區塊等，提升整體價值',
            '回應團隊回饋迅速，設計送代快，能在時間內完成交付'
        ]
    };

    return (
        <>
            <div className="container mx-auto px-8 py-8 max-w-7xl">
                <div className="flex items-center gap-4 mb-4">
                    <div
                        className="text-blue-900 cursor-pointer hover:text-blue-700 flex items-center gap-2"
                        onClick={() => navigate('/')}
                    >
                        <CircleArrowLeft className="text-blue-900 ml-auto" size={20} />
                        <span className="text-lg font-medium">返回</span>
                    </div>
                </div>
                <div className="flex gap-10">
                    <div className='w-1/2 relative after:content-[""] after:absolute after:top-0 after:right-[-20px] after:w-[1px] after:h-full after:bg-blue-900'>
                        <h2 className="text-2xl text-blue-900 font-medium mb-6">主管專區</h2>

                        <div className="space-y-4 h-160 bg-gray-50 p-6 rounded-lg flex flex-col">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 w-20">選擇職務</span>
                                <div className="relative w-64">
                                    <select
                                        value={selectedJob}
                                        onChange={(e) => setSelectedJob(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                                    >
                                        <option value="前端主管">前端主管</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 w-20">資料來源</span>
                                <FileUpload />
                            </div>
                            <button className="mt-8 w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-700 transition-all mt-auto">
                                生成AI
                            </button>
                        </div>

                    </div>

                    {/* 右側區域 */}
                    <div className="w-1/2">
                        <h2 className="text-2xl text-blue-900 font-medium mb-6">AI產出建議</h2>

                        <div className="space-y-6 h-160 bg-gray-50 p-6 rounded-lg">
                            <section>
                                <h3 className="font-medium mb-2">{workSummary.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {workSummary.content}
                                </p>
                            </section>

                            <section>
                                <h3 className="font-medium mb-2">{jobDetails.title}</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {jobDetails.items.map((item, index) => (
                                        <li key={index} className="text-gray-600 text-sm leading-relaxed">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section>
                                <h3 className="font-medium mb-2">{collaboration.title}</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    {collaboration.items.map((item, index) => (
                                        <li key={index} className="text-gray-600 text-sm leading-relaxed">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Manager; 