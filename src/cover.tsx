import { Link } from 'react-router-dom';

const Cover = () => {
  return (
    <div className="container mx-auto px-8 py-8 max-w-7xl ">
      <div className='flex justify-between  mt-50'>
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            讓 AI 幫助您，更快完成考核內容
          </h1>
          <p className="text-xl text-gray-600">
            把每天的努力，變成清晰可見的成長足跡。
          </p>
        </header>
        <p className='text-xl text-gray-600 w-[40%]'>結合智能生成，提高效率與品質，不再為考核煩惱，讓 AI 成為您最貼心的工作助理。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {/* 每日紀錄卡片 */}
        <div className="bg-blue-900 text-white rounded-lg shadow-lg px-8 pt-20 pb-25 transform transition-transform duration-200 hover:-translate-y-2">
          <h2 className="text-2xl font-bold mb-4">
            每日紀錄，輕鬆回顧工作點滴
          </h2>
          <p className="text-base leading-relaxed mb-6">
            內建互動式日曆，每日紀錄您的工作內容。
            打卡不只是形式，而是累積努力的證據。
          </p>
          <Link
            to="/daily-record"
            className="inline-block font-bold hover:underline"
          >
            瞭解更多 →
          </Link>
        </div>

        {/* AI 智能產出卡片 */}
        <div className="bg-gray-50 text-gray-800 rounded-lg shadow-lg p-8 transform transition-transform duration-200 hover:-translate-y-2">
          <h2 className="text-2xl font-bold mb-4">
            AI 智能產出，一秒生成考核文案
          </h2>
          <p className="text-base leading-relaxed mb-6">
            結合每日紀錄、自訂模板與外部 API，
            快速彙整出專屬您的考核報告草稿。
          </p>
          <Link
            to="/ai-generation"
            className="inline-block font-bold text-gray-800 hover:underline"
          >
            瞭解更多 →
          </Link>
        </div>

        {/* 主管專區卡片 */}
        <div className="bg-gray-50 text-gray-800 rounded-lg shadow-lg p-8 transform transition-transform duration-200 hover:-translate-y-2">
          <h2 className="text-2xl font-bold mb-4">
            主管專區，精準建議一次到位
          </h2>
          <p className="text-base leading-relaxed mb-6">
            上傳組員考核表，AI 自動分析提供改善建議，
            發展潛能與未來方向，幫助主管節省時間。
          </p>
          <Link
            to="/manager"
            className="inline-block font-bold text-gray-800 hover:underline"
          >
            瞭解更多 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cover;
