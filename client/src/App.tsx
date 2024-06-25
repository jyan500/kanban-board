import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes } from "react-router-dom"
import { Login } from "./pages/Login" 
import { Home } from "./pages/Home" 
import { HamburgerButton } from "./components/HamburgerButton" 
import { Register } from "./pages/Register" 
import { BoardDisplay } from "./pages/BoardDisplay" 
import { Board } from "./pages/Board" 
import DefaultLayout from "./layouts/DefaultLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import { useAppSelector, useAppDispatch } from "./hooks/redux-hooks" 
import "./styles/common.css" 
import { ToastList } from "./components/ToastList" 

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
					<Route 
						path = "/boards" 
						element={<BoardDisplay/>}
					>
						<Route 
							path = ":boardId"
							element={<Board/>}>
						</Route>
					</Route>
				
				</Route>
			</Routes>
			<ToastList/>
		</div>
	)
}

export default App;
