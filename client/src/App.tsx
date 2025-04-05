import React, { useEffect } from 'react';
import './App.css';
import { createBrowserRouter, RouterProvider, Navigate, ScrollRestoration } from "react-router-dom"
import { Login } from "./pages/Login" 
import { Home } from "./pages/Home" 
import { HamburgerButton } from "./components/HamburgerButton" 
import { Register } from "./pages/Register" 
import { ForgotPassword } from "./pages/ForgotPassword"
import { ResetPassword } from "./pages/ResetPassword"
import { AccountActivation } from "./pages/AccountActivation"
import { BoardDisplay } from "./pages/boards/BoardDisplay" 
import { TicketDisplay } from "./pages/tickets/TicketDisplay" 
import { Ticket as TicketPage } from "./pages/tickets/Ticket"
import { Boards } from "./pages/boards/Boards"
import { Board } from "./pages/boards/Board" 
import { OrganizationDisplay } from "./pages/organization/OrganizationDisplay"
import { Organization } from "./pages/organization/Organization"
import { OrganizationAddEditStatuses } from "./pages/organization/OrganizationAddEditStatuses"
import { UsersDisplay } from "./pages/users/UsersDisplay"
import { RegisterDisplay } from "./pages/register/RegisterDisplay"
import { RegisterSelection } from "./pages/register/RegisterSelection"
import { OrganizationRegister } from "./pages/register/OrganizationRegister"
import { AccountDisplay } from "./pages/account/AccountDisplay"
import { Account } from "./pages/account/Account"
import { TempAccount } from "./pages/temp-account/TempAccount"
import { AccountOrganization } from "./pages/account/AccountOrganization"
import { ChangePassword } from "./pages/account/ChangePassword"
import { JoinOrganization } from "./pages/account/JoinOrganization"
import { SwitchOrganization } from "./pages/account/SwitchOrganization"
import { RegistrationRequests } from "./pages/account/RegistrationRequests"
import { NotificationSettings } from "./pages/account/NotificationSettings"
import { NotificationDisplay } from "./pages/notifications/NotificationDisplay"
import { LandingPage } from "./pages/LandingPage"
import AuthLayout from "./layouts/AuthLayout"
import DefaultLayout from "./layouts/DefaultLayout"
import ProtectedLayout from "./layouts/ProtectedLayout"
import UserRoleProtectedLayout from "./layouts/UserRoleProtectedLayout"
import UserActivatedProtectedLayout from "./layouts/UserActivatedProtectedLayout"
import TempLoginProtectedLayout from "./layouts/TempLoginProtectedLayout"
import { useAppSelector, useAppDispatch } from "./hooks/redux-hooks" 
import "./styles/common.css" 
import { ToastList } from "./components/ToastList" 
import { 
	ACCOUNT, 
	ACTIVATION,
	REGISTER_USER, 
	REGISTER_ORG, 
	ACCOUNT_CREATE_ORG, 
	ACCOUNT_JOIN_ORGANIZATION, 
	ACCOUNT_SWITCH_ORGANIZATION, 
	ACCOUNT_CHANGE_PASSWORD, 
	ACCOUNT_NOTIFICATION_SETTINGS, 
	ACCOUNT_REGISTRATION_REQUESTS,
	HOME,
	LOGIN, 
	REGISTER, 
	BOARDS, 
	BOARD_ID, 
	TICKETS, 
	TICKET_ID, 
	USER, 
	USERS, 
	TEMP,
	ORGANIZATION, 
	ORGANIZATION_ADD_EDIT_STATUSES,
	NOTIFICATIONS,
	FORGOT_PASSWORD,
	RESET_PASSWORD,
	LANDING_PAGE,
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
				path: LANDING_PAGE,
				element: <LandingPage/>
			},
			{
				element: <>
					<ScrollRestoration/>
					<AuthLayout/>
				</>,
				children: [
					{
						path: LOGIN,
						element: <Login/>,
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
						path: FORGOT_PASSWORD,
						element: <ForgotPassword/>
					},
					{
						path: RESET_PASSWORD,
						element: <ResetPassword/>
					},
					{
						path: ACTIVATION,
						element: <AccountActivation/>
					},	
				]
			}
		],
	},
	{
		element:
		<>
			<TempLoginProtectedLayout/>	
		</>,
		children: [
			{
				path: `${TEMP}${ACCOUNT}`,
				element: <TempAccount/>,
				children: [
					{
						index: true,	
						element: <Account/>
					},
					{
						path: `${TEMP}${ACCOUNT_CHANGE_PASSWORD}`,
						element: <ChangePassword/>
					},
					{
						path: `${TEMP}${ACCOUNT_CREATE_ORG}`,
						element: <AccountOrganization/>
					},
					{
						path: `${TEMP}${ACCOUNT_JOIN_ORGANIZATION}`,
						element: <JoinOrganization/>
					},
					{
						path: `${TEMP}${ACCOUNT_SWITCH_ORGANIZATION}`,
						element: <SwitchOrganization/>
					},
					{
						path: `${TEMP}${ACCOUNT_REGISTRATION_REQUESTS}`,
						element: <RegistrationRequests/>
					},
				]
			}
		]
	},
	{
		element: <>
			<ProtectedLayout />
		</>,
		children: [
			{	
				element: <UserActivatedProtectedLayout/>,
				children: [
					{
						path: HOME,
						element: <Home />,
					},
					{
						path: NOTIFICATIONS,
						element: <NotificationDisplay/>
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
							</>,
							children: [
								{

									index: true,
									element: <Organization/>
								},
								{
									path: ORGANIZATION_ADD_EDIT_STATUSES,		
									element: <OrganizationAddEditStatuses/>
								}
							]
						}
						]
					},
					{
						path: "*",
						element: <Navigate to = {HOME}/>	
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
						element: <UserActivatedProtectedLayout/>,
						children: [
							{
								path: ACCOUNT_CREATE_ORG,
								element: <AccountOrganization/>
							},
							{
								path: ACCOUNT_JOIN_ORGANIZATION,
								element: <JoinOrganization/>
							},
							{
								path: ACCOUNT_SWITCH_ORGANIZATION,
								element: <SwitchOrganization/>
							},
							{
								path: ACCOUNT_NOTIFICATION_SETTINGS,
								element: <NotificationSettings/>
							},
							{
								path: ACCOUNT_REGISTRATION_REQUESTS,
								element: <RegistrationRequests/>
							},
						]
					},
					{
						path: ACCOUNT_CHANGE_PASSWORD,
						element: <ChangePassword/>
					},
				]
			},
			{
				path: "*",
				element: <Navigate to = {"/"}/>	
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
