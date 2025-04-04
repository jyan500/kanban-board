import React from "react"
import { Link } from "react-router-dom"
import { GradientContainer } from "../page-elements/GradientContainer"
import { LOGIN } from "../../helpers/routes"
import { Logo } from "../page-elements/Logo"

export const Header = () => {
	return (
		<GradientContainer className = "tw-p-8">
	        <div className="tw-max-w-7xl tw-mx-auto tw-flex tw-justify-between tw-items-center">
		        <Logo isAuthLayout={false}/>
	            <Link className = "tw-text-white tw-font-bold" to = {LOGIN}>Get Started</Link>
	        </div>
		</GradientContainer>
	)
}