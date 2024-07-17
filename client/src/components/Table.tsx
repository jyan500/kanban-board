import React from "react"
import { Link } from "react-router-dom"
import "../styles/table.css"

type Props = {
	config: Record<string, any>
	data: Array<Record<string, any>> | undefined 
}

export const Table = ({config, data}: Props) => {
	return (
		<table>
			<tr>
				{(Object.values(config.headers) as Array<string>).map((header) => (
					<th>{header}</th>	
				))
				}
			</tr>
			{data?.map((row) => {
				return (
					<tr>
					{
						Object.keys(config.headers).map((headerKey) => {
							if (headerKey === config.linkCol){
								return (
									<td><Link to = {config.link(row.id)}>{row[headerKey]}</Link></td>
								)
							}
							else if (headerKey === config.editCol?.col){
								return (
									<td><button onClick={() => config.editCol?.onClick(row.id)}>{config.editCol?.text}</button></td>
								)
							}
							else if (headerKey in config.modifiers){
								const {modifier, object: objectArray} = config.modifiers[headerKey]
								return (
									<td>{objectArray.length ? modifier(row[headerKey], objectArray) : modifier(row[headerKey])}</td>
								)
							}
							else {
								return (
									<td>{row[headerKey]}</td>
								)
							}
						})
					}
					</tr>
				)	
			})}
		</table>
	)
}