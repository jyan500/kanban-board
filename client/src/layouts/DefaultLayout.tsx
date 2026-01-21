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
		<div className = "tw-min-h-screen tw-text-gray-900">
			<Header/>
			<div className = "tw-min-h-[87vh] tw-w-full tw-bg-gray-50 tw-shadow-md">
				{pathname === "/" ? (
					<LandingPage/>
				) : (
					// other pages besides landing page are a single card
					<div className={`tw-bg-gradient-background tw-pt-44 tw-flex tw-justify-center tw-items-center tw-min-h-full tw-w-full tw-pb-12`}>
						<div className="tw-bg-white tw-rounded-xl tw-shadow-lg tw-p-8 tw-w-full tw-max-w-md tw-mx-4">
							<Outlet/>
						</div>
					</div>
				)}
			</div>
			<Footer/>
		</div>
	)
}

export default DefaultLayout
