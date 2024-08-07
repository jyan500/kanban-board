type Props = {
	className: string
}

export const FeatureIcon = ({className}: Props) => {
	return (
		<svg className = {className} viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M96 0H16C7.16344 0 0 7.16344 0 16V96C0 104.837 7.16344 112 16 112H96C104.837 112 112 104.837 112 96V16C112 7.16344 104.837 0 96 0Z" fill="#68B447"/>
			<path fillRule="evenodd" clipRule="evenodd" d="M80 64H64V80C64 84.4183 60.4183 88 56 88C51.5817 88 48 84.4183 48 80V64H32C27.5817 64 24 60.4183 24 56C24 51.5817 27.5817 48 32 48H48V32C48 27.5817 51.5817 24 56 24C60.4183 24 64 27.5817 64 32V48H80C84.4183 48 88 51.5817 88 56C88 60.4183 84.4183 64 80 64Z" fill="white"/>
		</svg>
	)
}