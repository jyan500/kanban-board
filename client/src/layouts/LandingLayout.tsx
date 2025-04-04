import React from "react"
import { Link, Outlet, Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks/redux-hooks" 
import { SocialMedia } from "../components/page-elements/SocialMedia"
import { Logo } from "../components/page-elements/Logo"
import { GradientContainer } from "../components/page-elements/GradientContainer"
import { LANDING_PAGE } from "../helpers/routes"

const LandingLayout = () => {
	return (
		<Outlet/>
	)	
}

export default LandingLayout
