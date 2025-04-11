import { DataProvider } from './contexts/DataContext';
import EvaluationTool from './pages/EvaluationTool';

const App: React.FC = () => {
  return (
    <DataProvider>
      <EvaluationTool />
    </DataProvider>
  );
};

export default App;