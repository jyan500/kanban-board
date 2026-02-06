import React, { useRef } from "react" 
import { Dropdown } from "../Dropdown" 
import { useNavigate } from "react-router-dom"
import { STANDARD_DROPDOWN_ITEM } from "../../helpers/constants"

type Props = {
	additionalLinks: Array<{pathname: string, text: string}>
	isMobile?: boolean
	dropdownAlignLeft?: boolean
	closeDropdown: () => void
}

export const BoardNavDropdown = React.forwardRef<HTMLDivElement, Props>(({
	closeDropdown, 
	additionalLinks,
	isMobile,
	dropdownAlignLeft,
}: Props, ref) => {
	const navigate = useNavigate()
	return (
		<Dropdown alignLeft={dropdownAlignLeft} isMobile={isMobile} closeDropdown={closeDropdown} ref = {ref}>
			<ul>
				{additionalLinks.map(({pathname, text}) => (
					<li
						key={pathname}
						onClick={(e) => {
							navigate(pathname)
							closeDropdown()
						}}
						className={STANDARD_DROPDOWN_ITEM}
						role="menuitem"
					>

						<p>{text}</p>
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

