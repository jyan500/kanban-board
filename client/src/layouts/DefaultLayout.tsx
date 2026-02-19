import React from "react"
import { Link, Outlet, Navigate, useLocation } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SocialMedia } from "../components/page-elements/SocialMedia"
import { Logo } from "../components/page-elements/Logo"
import { GradientContainer } from "../components/page-elements/GradientContainer"
import { HOME } from "../helpers/routes"
import { Header } from "../components/page-elements/Header"
import { Footer } from "../components/page-elements/Footer"
import { LandingPage } from "../pages/LandingPage"

const DefaultLayout = () => {
	const { pathname } = useLocation()
	return (
		<div className = "tw-relative tw-min-h-screen tw-max-h-screen tw-overflow-y-auto tw-text-gray-900">
			<Header/>
			<div className = "tw-min-h-[87vh] tw-h-full tw-w-full tw-bg-gray-50 tw-shadow-md tw-pb-48">
				{pathname === "/" ? (
					<LandingPage/>
				) : (
					// other pages besides landing page are a single card
					<div className={`tw-bg-gradient-background tw-pt-44 tw-flex tw-justify-center tw-items-center tw-w-full tw-h-full tw-pb-12`}>
						<div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-8 tw-w-full tw-max-w-md tw-mx-4">
							<Outlet/>
						</div>
					</div>
				)}
			</div>
			<div className = "tw-fixed tw-bottom-0 tw-w-full">
				<Footer/>
			</div>
			
		</div>
	)
}

export default DefaultLayout
