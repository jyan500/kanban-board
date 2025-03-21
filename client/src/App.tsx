import React, { useEffect } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Navigate, ScrollRestoration } from "react-router-dom"
import { Login } from "./pages/Login" 
import { Home } from "./pages/Home" 
import { HamburgerButton } from "./components/HamburgerButton" 
import { Register } from "./pages/Register" 
import { BoardDisplay } from "./pages/boards/BoardDisplay" 
import { TicketDisplay } from "./pages/tickets/TicketDisplay" 
import { Ticket as TicketPage } from "./pages/tickets/Ticket"
import { Boards } from "./pages/boards/Boards"
import { Board } from "./pages/boards/Board" 
import { OrganizationDisplay } from "./pages/organization/OrganizationDisplay"
import { UsersDisplay } from "./pages/users/UsersDisplay"
import { RegisterDisplay } from "./pages/register/RegisterDisplay"
import { RegisterSelection } from "./pages/register/RegisterSelection"
import { OrganizationRegister } from "./pages/register/OrganizationRegister"
import { AccountDisplay } from "./pages/account/AccountDisplay"
import { Account } from "./pages/account/Account"
import { AccountOrganization } from "./pages/account/AccountOrganization"
import { ChangePassword } from "./pages/account/ChangePassword"
import { JoinOrganization } from "./pages/account/JoinOrganization"
import { SwitchOrganization } from "./pages/account/SwitchOrganization"
import { NotificationSettings } from "./pages/account/NotificationSettings"
import { NotificationDisplay } from "./pages/notifications/NotificationDisplay"
import DefaultLayout from "./layouts/DefaultLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import UserRoleProtectedLayout from "./layouts/UserRoleProtectedLayout"
import { useAppSelector, useAppDispatch } from "./hooks/redux-hooks" 
import "./styles/common.css" 
import { ToastList } from "./components/ToastList" 
import { 
	ACCOUNT, 
	REGISTER_USER, 
	REGISTER_ORG, 
	ACCOUNT_CREATE_ORG, 
	ACCOUNT_JOIN_ORGANIZATION, 
	ACCOUNT_SWITCH_ORGANIZATION, 
	ACCOUNT_CHANGE_PASSWORD, 
	ACCOUNT_NOTIFICATION_SETTINGS, 
	HOME,
	LOGIN, 
	REGISTER, 
	BOARDS, 
	BOARD_ID, 
	TICKETS, 
	TICKET_ID, 
	USER, 
	USERS, 
	ORGANIZATION, 
	NOTIFICATIONS 
} from "./helpers/routes"

// Define routes using createBrowserRouter
const router = createBrowserRouter([
	{
		element: 
		<>	
			<ScrollRestoration/>
			<DefaultLayout />
		</>
		,
		children: [
			{
				path: LOGIN,
				element: <Login />,
			},
			{
				path: REGISTER,
				element: <RegisterDisplay/>,
				children: [
					{
						index: true,
						element: <RegisterSelection/>
					},
					{
						path: REGISTER_USER,
						element: <Register/>
					},
					{
						path: REGISTER_ORG,
						element: <OrganizationRegister/>
					}
				]
			},
			{
				path: "*",
				element: <Navigate to = {LOGIN}/>
			}
		],
	},
	{
		element: <>
			<ProtectedLayout />
		</>,
		children: [
			{
				path: HOME,
				element: <Home />,
			},
			{
				path: BOARDS,
				element: 
					<>	
						<ScrollRestoration/>
						<BoardDisplay />
					</>
				,
				children: [
					{
						index: true,
						element: <Boards/>,
					},
					{
						path: BOARD_ID,
						element: <>
							<ScrollRestoration/>
							<Board/>
						</>,
					},
				],
			},
			{
				path: TICKETS,
				element:
					<>
						<ScrollRestoration/>
						<TicketDisplay/>
					</>,
				children: [
				{
					path: TICKET_ID,
					element: <TicketPage/>
				}
				]
			},
			{
				path: ACCOUNT,
				element: <AccountDisplay/>,
				children: [
					{
						index: true,	
						element: <Account/>
					},
					{
						path: ACCOUNT_CREATE_ORG,
						element: <AccountOrganization/>
					},
					{
						path: ACCOUNT_NOTIFICATION_SETTINGS,
						element: <NotificationSettings/>
					},
					{
						path: ACCOUNT_CHANGE_PASSWORD,
						element: <ChangePassword/>
					},
					{
						path: ACCOUNT_JOIN_ORGANIZATION,
						element: <JoinOrganization/>
					},
					{
						path: ACCOUNT_SWITCH_ORGANIZATION,
						element: <SwitchOrganization/>
					},
				]
			},
			{
				path: NOTIFICATIONS,
				element: <NotificationDisplay/>
			},
			{
				element: <><UserRoleProtectedLayout/></>,
				children: [
				{
					path: USERS,
					element: <>
						<UsersDisplay/>
					</>,
				},
				{
					path: ORGANIZATION,
					element: <>
						<ScrollRestoration/>
						<OrganizationDisplay/>
					</>
				}
				]
			},
			{
				path: "*",
				element: <Navigate to = {HOME}/>	
			}
		],
	},
])

function App() {
	return (
		<div>
			<RouterProvider router={router}/>	
			<ToastList/>
		</div>
	)
}

export default App;
