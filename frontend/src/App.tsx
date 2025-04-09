import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import LoginForm from './components/LoginForm';
import ParentDashboard from './pages/ParentDashboard';
import ChildrenDashboard from './pages/ChildrenDashboard';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/parent" element={<ParentDashboard />} />
        <Route path="/children" element={<ChildrenDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
