import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import OtjiuWestPage from './pages/OtjiuWestPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/otjiu-west" element={<OtjiuWestPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;