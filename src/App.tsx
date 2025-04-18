import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Cover from './cover';
import DailyRecord from './components/inputs/DailyRecord';
import Manager from './components/Manager';
import Gernerate from './components/Generate';
import { DataProvider } from './contexts/DataContext';
// import EvaluationTool from './pages/EvaluationTool';

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/Assessment-Tools" element={<Cover/>} />
          <Route path="/daily-record" element={<DailyRecord/>} />
          <Route path="/ai-generation" element={<Gernerate/>} />
          <Route path="/manager" element={<Manager/>} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;