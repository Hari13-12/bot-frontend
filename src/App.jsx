import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Chatsam from './components/Chatsam';
import Dbconnector from './components/Dbconnector';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dbconnector" element={<Dbconnector />} /> 
       <Route path="/chatsam" element={<Chatsam />} />
      </Routes>
    </Router>
  );
}

export default App;
