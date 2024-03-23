import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { Login } from "./pages/Login" 
import { Home } from "./pages/Home" 
import { Register } from "./pages/Register" 
import DefaultLayout from "./layouts/DefaultLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"

function App() {
	return (
		<div>
			<Routes>
				<Route element = {<DefaultLayout/>}>
				    <Route path="/login" element={<Login/>} />
				    <Route path="/register" element={<Register/>}/>
				</Route>
				<Route element = {<ProtectedLayout/>}>
					<Route path = "/" element={<Home/>}></Route>
				</Route>
			</Routes>
		</div>
	)
}

export default App;
