import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Board as KanbanBoard } from "./components/Board" 

function App() {
  return (
    <div>
      <Router>
	      <div>
	        <Routes>
	          <Route path = "/" element={<KanbanBoard/>}></Route>
	        </Routes>
	      </div>
      </Router>
    </div>
  );
}

export default App;
