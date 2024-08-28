type Props = {
	className: string
}

export const EpicIcon = ({className}: Props) => {
	return (
		<svg className={className} width="112" height="112" viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M96 0H16C7.16344 0 0 7.16344 0 16V96C0 104.837 7.16344 112 16 112H96C104.837 112 112 104.837 112 96V16C112 7.16344 104.837 0 96 0Z" fill="#904EE2"/>
			<path fillRule="evenodd" clipRule="evenodd" d="M79.3864 54.0528L79.3704 54.0208C79.7384 53.4208 80.0024 52.7568 80.0024 51.9968C80.0024 49.7888 78.2104 47.9968 76.0024 47.9968H56.0024V27.9968C56.0024 25.7888 54.2104 23.9968 52.0024 23.9968C50.6264 23.9968 49.4824 24.7328 48.7624 25.7808C48.5384 26.1088 48.3544 26.4448 48.2344 26.8208L32.6504 57.8928L32.6664 57.9168C32.2824 58.5328 32.0024 59.2208 32.0024 59.9968C32.0024 62.2128 33.7944 63.9968 36.0024 63.9968H56.0024V83.9968C56.0024 86.2128 57.7944 87.9968 60.0024 87.9968C61.4344 87.9968 62.6344 87.2048 63.3464 86.0688L63.3704 86.0768L63.4744 85.8688C63.5624 85.7008 63.6584 85.5488 63.7224 85.3728L79.3864 54.0528Z" fill="white"/>
		</svg>
	)
}
