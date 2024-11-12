import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchPage from './SearchPage';
import ShowPage from './ShowPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/show/:collectionId" element={<ShowPage />} />
      </Routes>
    </Router>
  );
};

export default App;