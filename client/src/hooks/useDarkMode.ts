import React, {useEffect} from "react"
import { useAppSelector } from "./redux-hooks"

export const useDarkMode = (id: string, isDarkMode: boolean) => {
	const { token, isTemp } = useAppSelector((state) => state.auth)
    useEffect(() => {
		if (token && !isTemp){
			const root = document.getElementById(id)
			/* The way this works is that in the background CSS, all the dark: selectors
				only work if the "dark" classname is added as a parent selector
				this will add "dark" to the classlist of "protected-main"
				so only elements inside this div will have dark mode
			*/
			if (root){
				if (isDarkMode){
					root.classList.add("tw-dark")
				}
				else {
					root.classList.remove("tw-dark")
				}
			}
		}
	}, [isDarkMode, token, isTemp])
}
