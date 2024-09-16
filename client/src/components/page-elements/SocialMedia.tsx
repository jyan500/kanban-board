import React from "react"
import { IconContext } from "react-icons"
import { FaInstagram as Instagram } from "react-icons/fa";
import { ImFacebook2 as Facebook } from "react-icons/im";
import { FaYoutube as Youtube } from "react-icons/fa";

export const SocialMedia = () => {
	return (
		<div className = "tw-flex tw-flex-row tw-justify-center tw-items-center tw-gap-x-4">
			<a href = "#">
				<IconContext.Provider value={{className: "tw-w-10 tw-h-10", color: "white"}}>
					<Instagram/>
				</IconContext.Provider>
			</a>
			<a href = "#">
				<IconContext.Provider value={{className: "tw-w-[35px] tw-h-[35px]", color: "white"}}>
					<Facebook/>
				</IconContext.Provider>
			</a>
			<a href = "#">
				<IconContext.Provider value={{className: "tw-w-10 tw-h-10", color: "white"}}>
					<Youtube/>
				</IconContext.Provider>
			</a>
		</div>
	)	
}