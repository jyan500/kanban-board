import React, {ReactNode} from "react"
import { IoMdClose } from "react-icons/io";
import { setToolbarType, setToolbarProps, toggleShowToolbar } from "../../slices/toolbarSlice" 
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks" 
import { TOOLBAR_Z_INDEX, LG_BREAKPOINT } from "../../helpers/constants"
import { useScreenSize } from "../../hooks/useScreenSize"
import { BacklogToolbar } from "../toolbars/BacklogToolbar"

export const toolbarTypes = {
	// "BULK_EDIT_TICKET": "",
	// "BULK_EDIT_REGISTRATION": "",
	// "BULK_EDIT_BACKLOG": "",
	"BULK_EDIT_BACKLOG": BacklogToolbar,
}

// type for partial subset of keys
type PartialKeys<T> = Partial<{ [K in keyof T]: Record<string, any>}>

export const BottomToolbar = () => {
	const dispatch = useAppDispatch()
	const { currentToolbarType, showToolbar, currentToolbarProps }  = useAppSelector((state) => state.toolbar)
	const ToolbarContent = toolbarTypes[currentToolbarType as keyof typeof toolbarTypes] as React.FC 

	return (
		<div className = {`${TOOLBAR_Z_INDEX} ${showToolbar ? "tw-visible": "tw-invisible"} tw-fixed tw-bottom-4 tw-left-4 tw-right-4`}>
            <div className = "tw-bg-gray-700">
            {
                ToolbarContent ? <ToolbarContent {...currentToolbarProps} /> : null
            }
            </div>
		</div>
	)	
}