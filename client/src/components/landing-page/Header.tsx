import React from "react"
import { Link } from "react-router-dom"
import { GradientContainer } from "../page-elements/GradientContainer"
import { LOGIN, REGISTER, LANDING_PAGE } from "../../helpers/routes"
import { Logo } from "../page-elements/Logo"

export const Header = () => {
	return (
		<GradientContainer className = "tw-px-2 lg:tw-px-4 tw-w-full tw-flex tw-flex-row tw-justify-between tw-items-center tw-h-[12vh]">
			<>
		        <Link to = {LANDING_PAGE}><Logo isAuthLayout={false}/></Link>
		        <div className = "tw-flex tw-flex-row tw-gap-x-4">
		            <Link className = "tw-text-white tw-font-bold" to = {LOGIN}>Login</Link>
		            <Link className = "tw-text-white tw-font-bold" to = {REGISTER}>Register</Link>
	            </div>
            </>
		</GradientContainer>
	)
}