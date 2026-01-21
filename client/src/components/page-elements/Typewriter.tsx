import React, { useState, useEffect } from "react"

interface Props {
	text: string
	speed?: number // milliseconds per character
	className?: string
}

export const Typewriter = ({text, speed=50, className}: Props) => {
	const [displayedText, setDisplayedText] = useState("")
	useEffect(() => {
		let index = 0
		let isCancelled = false

		const displayText = () => {
			if (isCancelled){
				return
			}
			setDisplayedText(text.slice(0, index+1))
			index++
			if (index < text.length){
				setTimeout(displayText, speed)
			}
		}
		displayText()

		return () => {
			isCancelled = true
		}

	}, [text])

	return (
		<span className={className}>{displayedText}</span>
	)
}
