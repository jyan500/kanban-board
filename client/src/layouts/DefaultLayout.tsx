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
		<div className = "tw-min-h-screen tw-text-gray-900">
			<Header/>
			<div className = "tw-min-h-[76vh] tw-w-full tw-bg-gray-50 tw-shadow-md">
				<Outlet/>
			</div>
			<Footer/>
		</div>
	)
}

export default DefaultLayout
