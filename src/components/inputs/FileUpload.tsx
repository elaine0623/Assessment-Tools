import { Upload, Check, AlertCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useState } from 'react';
import * as XLSX from 'xlsx';

const FileUpload: React.FC = () => {
  const { state, dispatch } = useData();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const parseExcelFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // 讀取文件為 ArrayBuffer
      const buffer = await file.arrayBuffer();
      // 解析工作簿
      const workbook = XLSX.read(buffer, { type: 'array' });

      // 使用第一個工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 將工作表轉換為 JSON 數據
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // 檢查數據有效性
      if (!data || data.length === 0) {
        throw new Error('Excel 文件沒有有效數據');
      }

      // 提取標題行
      const headers = data[0] as string[];

      // 轉換為對象數組（跳過標題行）
      const rows = data.slice(1).map((row: any) => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      // 分析工作表結構，取得所有工作表的名稱和基本信息
      const sheets = workbook.SheetNames.map(name => {
        const sheet = workbook.Sheets[name];
        const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        return {
          name,
          rowCount: sheetData.length,
          columnCount: sheetData[0]?.length || 0
        };
      });

      // 構建文件數據對象
      const fileData = {
        fileName: file.name,
        fileType: file.type,
        sheets,
        mainData: rows,
        headers,
        summary: {
          totalRows: rows.length,
          totalSheets: sheets.length
        }
      };

      // 更新狀態
      dispatch({
        type: 'SET_FILE_DATA',
        payload: fileData
      });

      dispatch({
        type: 'SET_FILE_PARSED',
        payload: true
      });

    } catch (err) {
      console.error('解析Excel文件時出錯:', err);
      setError(err instanceof Error ? err.message : '無法解析文件');
      dispatch({ type: 'SET_FILE_PARSED', payload: false });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // 檢查文件類型
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];

      if (!validTypes.includes(file.type)) {
        setError('請上傳有效的 Excel 或 CSV 文件');
        return;
      }

      // 更新文件狀態
      dispatch({ type: 'SET_FILE', payload: file });
      dispatch({ type: 'SET_FILE_UPLOADED', payload: true });

      // 解析文件內容
      await parseExcelFile(file);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center flex flex-col justify-center items-center h-[30vh]">
      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
      <p className="mb-2 text-sm text-gray-600">拖拽文件到此處或點擊上傳</p>
      <input
        type="file"
        className="hidden"
        id="fileUpload"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileChange}
      />
      <label
        htmlFor="fileUpload"
        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md cursor-pointer"
      >
        選擇Excel文件
      </label>

      {isProcessing && (
        <div className="mt-3 text-blue-600">
          <span className="inline-block animate-spin mr-2">⟳</span>
          正在解析文件...
        </div>
      )}

      {error && (
        <div className="mt-3 text-red-600 flex items-center">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}

      {state.userInput.fileUpload.uploaded && state.userInput.fileUpload.parsed && (
        <div className="mt-4 text-green-600 flex items-center justify-center gap-1">
          <Check size={16} />
          <span>
            文件已解析: {state.userInput.fileUpload.file?.name}
            ({state.userInput.fileUpload.data?.summary.totalRows} 行數據)
          </span>
        </div>
      )}

      {state.userInput.fileUpload.uploaded && !isProcessing && !state.userInput.fileUpload.parsed && !error && (
        <div className="mt-4 text-orange-600 flex items-center justify-center gap-1">
          <AlertCircle size={16} />
          <span>文件已上傳，但無法解析內容</span>
        </div>
      )}
    </div>
  );
};

export default FileUpload;