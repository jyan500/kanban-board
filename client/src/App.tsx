import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes } from "react-router-dom"
import { Login } from "./pages/Login" 
import { Home } from "./pages/Home" 
import { HamburgerButton } from "./components/HamburgerButton" 
import { Register } from "./pages/Register" 
import DefaultLayout from "./layouts/DefaultLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import { useGetOrganizationQuery } from "./services/organization"
import { setOrganization } from "./slices/organizationSlice" 
import { useAppDispatch } from "./hooks/redux-hooks" 
import "./styles/common.css" 

function App() {

	const {data: orgData} = useGetOrganizationQuery()
	const dispatch = useAppDispatch()

	useEffect(() => {
		if (orgData?.length){
			console.log("set org data")
			dispatch(setOrganization({organizations: orgData}))
		}
	}, [orgData])

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
