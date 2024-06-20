import React from "react"

type Props = {
	headers: Array<string>
	data: Array<Record<string, Array<string>>>
}

export const Table = ({headers, data}: Props) => {
	return (
		<table>
			<tr>
				{headers.map(header => (
					<th>{header}</th>	
				))
				}
			</tr>
			{data.map((row) => {
				return (
					<tr>
					{
						Object.keys(row).map((col) => {
							return (
								<td>{col}</td>
							)
						})
					}
					</tr>
				)	
			})}
		</table>
	)
}