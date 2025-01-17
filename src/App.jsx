import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dbconnector from './components/Dbconnector';
import Chatsam from './components/Chatsam';

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
