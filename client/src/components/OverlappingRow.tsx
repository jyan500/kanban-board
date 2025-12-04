import React, {useState} from "react"
import { CgProfile } from "react-icons/cg";
import { Avatar } from "./page-elements/Avatar"
import { LG_BREAKPOINT, AVATAR_SIZES } from "../helpers/constants"
import { useScreenSize } from "../hooks/useScreenSize"
import { HoverTooltip } from "./page-elements/HoverTooltip"

/* 
Create a row of overlapping icons 
If there are more than 4 items in a row, display the last circle
that shows the count of (total num - 4)
*/
type Props = {
	imageUrls: Array<{imageUrl: string, name: string, initials: string}>
	imageSize: string
	ignoreScreenSize?: boolean
}

export const OverlappingRow = ({imageUrls, imageSize, ignoreScreenSize=false}: Props) => {
	const { width, height } = useScreenSize()
	const size = `${!ignoreScreenSize ? ((imageSize && imageSize in AVATAR_SIZES && width >= LG_BREAKPOINT) ? AVATAR_SIZES[imageSize] : AVATAR_SIZES.s) : AVATAR_SIZES[imageSize]}` 
	const total = imageUrls.length
	const createElements = (num: number) => {
		let amt = total <= 4 ? total : 4
		let remainder = 0
		if (num >= 4){
			remainder = num - 4
		}
		return (
			<div className="tw-flex -tw-space-x-4 rtl:tw-space-x-reverse">
				{
					imageUrls.slice(0, amt).map(({imageUrl, initials, name}: {imageUrl: string, initials: string, name: string}) => {
					    return (
					    	<div key={`avatar_${initials}_${name}`} className = "tw-relative tw-group tw-inline-flex">
						    	<Avatar userInitials={initials} imageUrl={imageUrl} size={ignoreScreenSize || width >= LG_BREAKPOINT ? imageSize : "s"} className = "tw-border-2 tw-border-gray-800 tw-rounded-full"/>
						    	<HoverTooltip text={name}/>
				    		</div>
					    )
					})
				}
				{
					remainder > 0 ?
				    <div className={`${size} tw-flex tw-items-center tw-justify-center tw-text-xs tw-font-medium tw-text-white tw-bg-gray-700 tw-border-2 tw-border-white tw-rounded-full dark:tw-border-gray-800`}>+{remainder}</div>
				    : null
				}
			</div>
		)
	}
	return createElements(total)
}
