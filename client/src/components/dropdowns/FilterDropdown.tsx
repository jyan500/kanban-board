import React, { useRef } from "react" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"
import { Dropdown } from "../Dropdown" 
import { addToast } from "../../slices/toastSlice"
import { Toast, Notification } from "../../types/common"
import { v4 as uuidv4 } from "uuid"
import { Link, useLocation } from 'react-router-dom';
import { NOTIFICATIONS } from "../../helpers/routes"

type Props = {
	closeDropdown: () => void
    isMobile: boolean
    children: React.ReactNode
}

export const FilterDropdown = React.forwardRef<HTMLDivElement, Props>(({closeDropdown, isMobile, children}: Props, ref) => {
	const dispatch = useAppDispatch()
	return (
		<Dropdown isMobile={isMobile} className = {"!tw-w-[500px]"} ref = {ref}>
            {children}
		</Dropdown>
	)	
})

