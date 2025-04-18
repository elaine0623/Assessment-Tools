import React, { useState, ChangeEvent } from "react";
import { useData } from '../contexts/DataContext';
import { getDailyData } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { CircleArrowLeft } from 'lucide-react';

const Generate: React.FC = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useData();
    const [response, setResponse] = useState<any>(null);
    const [file, setFile] = useState<File | null>(null);
    const [jobName, setJobName] = useState(state.userInput.job_name);
    const [workLog, setWorkLog] = useState("");
    const [assignedToId, setAssignedToId] = useState("152");
    const [updatedOn, setUpdatedOn] = useState("2025-01-01T08:12:32");
    const [dataSource, setDataSource] = useState("manual");
    const [editedFields, setEditedFields] = useState<{ [key: string]: string }>({});

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            setFile(files[0]);
        }
    };

    const handleGenerate = () => {
        const formData = new FormData();
        if (file) {
            formData.append("file", file);
        }
        formData.append("jobName", jobName);
        formData.append("workLog", workLog);
        formData.append("userName", state.userInput.userName);

        fetch("http://10.1.6.126:89/api/generate", {
            method: "POST",
            body: formData,
        })
            .then((response) => response.json())
            .then((data) => {
                setResponse(data);
                if (Array.isArray(data)) {
                    const initialEdits = data.reduce((acc, item) => {
                        acc[item.title] = item.content;
                        return acc;
                    }, {});
                    setEditedFields(initialEdits);
                }
            });
    };

    const handleFieldChange = (title: string, value: string) => {
        setEditedFields((prev) => ({
            ...prev,
            [title]: value,
        }));
    };

    const fetchRedmineData = () => {
        const url = `http://10.1.6.126:89/api/redmine?offset=0&limit=100&assigned_to_id=${assignedToId}&updated_on=%3E%3D${updatedOn}&key=38cf4bfe25748ccf88c68a0ad55957c9862d3c41`;

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                const newEntries =
                    data.issues
                        ?.map(
                            (issue: any) =>
                                `#${issue.id} ${issue.subject} - ${issue.description || "無描述"
                                }`
                        )
                        .join("\n\n") || "";

                setWorkLog((prevLog) => {
                    const separator = prevLog ? "\n\n" : "";
                    return prevLog + separator + newEntries;
                });
            });
    };

    const fetchDailyRecords = async () => {
        try {
            const response = await getDailyData(state.userInput.userName);
            if (response.data) {
                const records = Object.entries(response.data)
                    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                    .map(([date, record]: [string, any]) => {
                        return `${date}: ${record.content}`;
                    })
                    .join("\n\n");

                setWorkLog((prevLog) => {
                    const separator = prevLog ? "\n\n" : "";
                    return prevLog + separator + records;
                });
            }
        } catch (error) {
            console.error('獲取每日記錄時出錯:', error);
        }
    };

    const handleDownload = () => {
        if (!editedFields) return;
        
        const content = Object.entries(editedFields)
            .map(([title, content]) => `## ${title}\n\n${content}`)
            .join('\n\n');

        const blob = new Blob([content], { type: 'text/markdown' });
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
                    {/* 左側區域 */}
                    <div className='w-1/2 relative after:content-[""] after:absolute after:top-0 after:right-[-20px] after:w-[1px] after:h-full after:bg-blue-900'>
                        <h2 className="text-2xl text-blue-900 font-medium mb-6">選擇資料來源</h2>

                        <div className="space-y-4 h-160 bg-gray-50 p-6 rounded-lg flex flex-col">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 w-20">選擇職務</span>
                                <div className="relative w-64">
                                    <select
                                        value={jobName}
                                        onChange={(e) => setJobName(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                                    >
                                        <option value="產品設計師">產品設計師</option>
                                        <option value="前端工程師">前端工程師</option>
                                        <option value="後端工程師">後端工程師</option>
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
                                <div className="relative w-64">
                                    <select
                                        value={dataSource}
                                        onChange={(e) => setDataSource(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md appearance-none bg-white pr-8"
                                    >
                                        <option value="manual">手動輸入</option>
                                        <option value="dailyRecord">每日紀錄資料</option>
                                        <option value="redmine">Redmine資料</option>
                                    </select>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {dataSource === "redmine" && (
                                <>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-700 w-20">指派 ID</span>
                                        <input
                                            type="text"
                                            value={assignedToId}
                                            onChange={(e) => setAssignedToId(e.target.value)}
                                            className="w-64 p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-700 w-20">更新時間</span>
                                        <input
                                            type="text"
                                            value={updatedOn}
                                            onChange={(e) => setUpdatedOn(e.target.value)}
                                            className="w-64 p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <button
                                        onClick={fetchRedmineData}
                                        className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-700 transition-all"
                                    >
                                        獲取 Redmine 資料
                                    </button>
                                </>
                            )}

                            {dataSource === "dailyRecord" && (
                                <button
                                    onClick={fetchDailyRecords}
                                    className="w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-700 transition-all"
                                >
                                    獲取每日紀錄
                                </button>
                            )}

                            <div className="flex flex-col gap-2">
                                <span className="text-gray-700">工作紀錄</span>
                                <textarea
                                    value={workLog}
                                    onChange={(e) => setWorkLog(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md h-32"
                                    placeholder="請輸入工作紀錄..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 w-20">上傳架構</span>
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    className="w-64 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="mt-auto w-full bg-blue-900 text-white py-2 rounded-md hover:bg-blue-700 transition-all"
                            >
                                生成 AI
                            </button>
                        </div>
                    </div>

                    {/* 右側區域 */}
                    <div className="w-1/2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl text-blue-900 font-medium">AI 產出考核表</h2>
                            {response && (
                                <button
                                    onClick={handleDownload}
                                    className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-700 transition-all"
                                >
                                    匯出報告
                                </button>
                            )}
                        </div>

                        <div className="space-y-6 h-160 bg-gray-50 p-6 rounded-lg overflow-y-auto">
                            {response ? (
                                Array.isArray(response) ? (
                                    response.map((item, index) => (
                                        <section key={index}>
                                            <h3 className="font-medium mb-2">{item.title}</h3>
                                            <textarea
                                                value={editedFields[item.title] || ""}
                                                onChange={(e) => handleFieldChange(item.title, e.target.value)}
                                                className="w-full p-3 border border-gray-300 rounded-md text-sm text-gray-600 leading-relaxed min-h-[100px]"
                                            />
                                        </section>
                                    ))
                                ) : (
                                    <div className="text-gray-600 text-sm">
                                        {JSON.stringify(response, null, 2)}
                                    </div>
                                )
                            ) : (
                                <div className="text-gray-500 text-center py-8">
                                    請選擇資料來源並點擊生成按鈕
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Generate;
