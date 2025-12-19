import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { toggleShowModal, setModalProps, setModalType } from "../../slices/modalSlice" 
import { useNavigate } from "react-router-dom"
import { Ticket, Status } from "../../types/common"
import { IconEdit } from "../icons/IconEdit"
import { IconBulkAction } from "../icons/IconBulkAction"
import { TextIconRow } from "../page-elements/TextIconRow"
import { Navigate } from "react-router-dom"

type Props = {
	boardId: string | number | null | undefined
	additionalLinks: Array<{pathname: string, text: string}>
	isMobile?: boolean
	dropdownAlignLeft?: boolean
	closeDropdown: () => void
}

export const BoardNavDropdown = React.forwardRef<HTMLDivElement, Props>(({
	boardId, 
	closeDropdown, 
	additionalLinks,
	isMobile,
	dropdownAlignLeft,
}: Props, ref) => {
	const dispatch = useAppDispatch()
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
						className="tw-flex tw-flex-row tw-items-center tw-gap-x-2 tw-block hover:tw-bg-gray-50 tw-px-4 tw-py-2 tw-text-sm tw-text-gray-700 tw-hover:bg-gray-100 tw-hover:text-gray-900"
						role="menuitem"
					>

						<p>{text}</p>
					</li>
				))}
			</ul>
		</Dropdown>
	)	
})

