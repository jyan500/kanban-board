import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SocialMedia } from "../components/page-elements/SocialMedia"
import { Logo } from "../components/page-elements/Logo"
import { GradientContainer } from "../components/page-elements/GradientContainer"

const DefaultLayout = () => {
	const token = useAppSelector((state) => state.auth.token)

	if (token){
		return <Navigate replace to = {"/"} />
	}

	return (
		<div className = "tw-flex tw-h-screen tw-flex-col sm:tw-flex-row tw-my-4 sm:tw-my-0">
			<div className = "tw-flex tw-flex-1 tw-justify-center tw-items-center tw-p-8 tw-bg-gray-50 tw-shadow-md tw-h-full tw-w-full">
				<Outlet/>
			</div>
			<GradientContainer className = "tw-p-4 tw-h-screen tw-flex tw-flex-1 tw-flex-col tw-justify-center tw-items-center tw-gap-y-4">
				<Logo isLandingPage={true}/>
				<SocialMedia/>
			</GradientContainer>
		</div>
	)
}

export default DefaultLayout
