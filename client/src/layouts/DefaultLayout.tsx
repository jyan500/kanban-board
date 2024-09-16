import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SocialMedia } from "../components/page-elements/SocialMedia"
import { Logo } from "../components/page-elements/Logo"

const DefaultLayout = () => {
	const token = useAppSelector((state) => state.auth.token)

	if (token){
		return <Navigate replace to = {"/"} />
	}

	return (
		// <>
		// 	<Outlet/>
		// </>
		<div className = "tw-flex tw-h-screen tw-flex-col sm:tw-flex-row tw-my-4 sm:tw-my-0">
			<div className = "md:tw-min-h-screen tw-flex tw-flex-1 tw-justify-center tw-items-center">
				<div className = "tw-p-8 tw-bg-gray-50 tw-shadow-md tw-w-full sm:tw-w-[400px]">
					<Outlet/>
				</div>
			</div>
			<div className = "tw-bg-gradient-to-r tw-from-cyan-500 tw-to-primary tw-p-4 tw-h-screen tw-flex tw-flex-1 tw-flex-col tw-justify-center tw-items-center tw-gap-y-4">
			{/*	<div>
					<img src = {CountyLibrary}/>
				</div>
				<SocialMedia/>	*/}
				<Logo isLandingPage={true}/>
				<SocialMedia/>
			</div>
		</div>
	)
}

export default DefaultLayout
