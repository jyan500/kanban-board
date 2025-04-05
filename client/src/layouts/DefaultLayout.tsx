import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SocialMedia } from "../components/page-elements/SocialMedia"
import { Logo } from "../components/page-elements/Logo"
import { GradientContainer } from "../components/page-elements/GradientContainer"
import { HOME } from "../helpers/routes"
import { Header } from "../components/page-elements/Header"
import { Footer } from "../components/page-elements/Footer"

const DefaultLayout = () => {
	return (
		<div className = "tw-min-h-screen tw-bg-white tw-text-gray-900">
			<Header/>
			<div className = "tw-min-h-[76vh] tw-flex tw-flex-1 tw-justify-center tw-items-center tw-p-8 tw-bg-gray-50 tw-shadow-md">
				<div className = "tw-w-full lg:tw-w-1/2">
					<Outlet/>
				</div>
			</div>
			<Footer/>
		</div>
	)
}

export default DefaultLayout
