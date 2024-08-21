import React, {useState} from "react"
import { CgProfile } from "react-icons/cg";
import "../styles/overlapping-row.css"

/* 
Create a row of overlapping icons 
If there are more than 4 items in a row, display the last circle
that shows the count of (total num - 4)
*/
type Props = {
	total: number
}

export const OverlappingRow = ({total}: Props) => {
	const overlappingFactor = 22
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
				<CgProfile 
				className = "--l-icon"
				/>
			</div>
			)
		}
		if (remainder > 0){
			elements.push(
			<div style = {{position: "absolute", top: 0, left: `${curLeft + 30}px`}} className = "remainder-circle">
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