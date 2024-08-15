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
			<thead>
				<tr>
					{(Object.values(config.headers) as Array<string>).map((header) => (
						<th key = {header}>{header}</th>	
					))
					}
				</tr>
			</thead>
			<tbody>
				{data?.map((row) => {
					return (
						<tr key = {row.id}>
						{
							Object.keys(config.headers).map((headerKey) => {
								if (headerKey === config.linkCol){
									return (
										<td key = {headerKey}><Link to = {config.link(row.id)}>{row[headerKey]}</Link></td>
									)
								}
								else if (headerKey === config.editCol?.col){
									return (
										<td key = {headerKey}><button onClick={() => config.editCol?.onClick(row.id)}>{config.editCol?.text}</button></td>
									)
								}
								else if (headerKey in config.modifiers){
									const {modifier, object: objectArray} = config.modifiers[headerKey]
									return (
										<td key = {headerKey}>{objectArray.length ? modifier(row[headerKey], objectArray) : modifier(row[headerKey])}</td>
									)
								}
								else {
									return (
										<td key = {headerKey}>{row[headerKey]}</td>
									)
								}
							})
						}
						</tr>
					)	
				})}
			</tbody>
		</table>
	)
}