import React, {useState} from "react"
import { CgProfile } from "react-icons/cg";
import "../styles/overlapping-row.css"
import { Avatar } from "./page-elements/Avatar"

/* 
Create a row of overlapping icons 
If there are more than 4 items in a row, display the last circle
that shows the count of (total num - 4)
*/
type Props = {
	imageUrls: Array<string>
}

export const OverlappingRow = ({imageUrls}: Props) => {
	const overlappingFactor = 22
	const total = imageUrls.length
	const createElements = (num: number) => {
		let elements = []
		let remainder = 0
		if (num >= 4){
			remainder = num - 4
		}
		let amt = total <= 4 ? total : 4 
		let curLeft = 0
		let zIndex = total 
		for (let i = 0; i < amt; ++i){
			curLeft += overlappingFactor 
			zIndex -= 1 
			const style = {
				"position": "absolute",
				"top": "0",
				"left": `${curLeft}px`,
				"zIndex": zIndex,
			} as React.CSSProperties
			elements.push(
			<div key={curLeft} style={style} className = "circle">
				<Avatar imageUrl = {imageUrls[i]} className = "tw-rounded-full"/>
			</div>
			)
		}
		if (remainder > 0){
			elements.push(
			<div key={`container_${curLeft}`} style = {{position: "absolute", top: 0, left: `${curLeft + 30}px`}} className = "remainder-circle">
				<span className = "__count">+{remainder}</span>	
			</div>)
		}
		return elements
	}
	return (
		<div className = "overlapping-container">
			{createElements(total)}		
		</div>
	)
}