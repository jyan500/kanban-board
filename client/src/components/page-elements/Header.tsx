import React from "react"
import { Link } from "react-router-dom"
import { GradientContainer } from "./GradientContainer"
import { LOGIN, REGISTER, LANDING_PAGE } from "../../helpers/routes"
import { Logo } from "./Logo"
import { FADE_ANIMATION } from "../../helpers/constants"
import { Button } from "./Button"

export const Header = () => {
	return (
		<nav className="tw-fixed tw-top-0 tw-w-full tw-bg-white/80 tw-backdrop-blur-md tw-border-b tw-border-gray-100 tw-z-50">
			<div className="tw-max-w-7xl tw-mx-auto tw-px-6 tw-py-4 tw-flex tw-justify-between tw-items-center">
				<Link to ={LANDING_PAGE}><Logo isAuthLayout={false}/></Link>
				<div className="tw-flex tw-gap-8 tw-items-center">
					<Link to={LOGIN} className="tw-text-gray-600 hover:tw-text-blue-600 tw-transition-colors tw-text-sm">Login</Link>
					<Link to={REGISTER} className="tw-bg-blue-600 tw-text-white tw-px-5 tw-py-2 tw-rounded-lg hover:tw-bg-blue-700 tw-transition-colors tw-text-sm tw-font-medium">Register</Link>
				</div>
			</div>
		</nav>
	)
}
