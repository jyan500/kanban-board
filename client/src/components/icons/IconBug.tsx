type Props = {
	className?: string
}

export const IconBug = ({className}: Props) => {
	return (
		<svg 
			className={className}
			viewBox="0 0 112 112" 
			fill="none" 
			xmlns="http://www.w3.org/2000/svg">
			<path d="M96 0H16C7.16344 0 0 7.16344 0 16V96C0 104.837 7.16344 112 16 112H96C104.837 112 112 104.837 112 96V16C112 7.16344 104.837 0 96 0Z" fill="#E5493A"/>
			<path fillRule="evenodd" clipRule="evenodd" d="M84 56C84 71.4653 71.4653 84 56 84C40.5347 84 28 71.4653 28 56C28 40.5347 40.5347 28 56 28C71.4653 28 84 40.5347 84 56Z" fill="white"/>
		</svg>
	)
}