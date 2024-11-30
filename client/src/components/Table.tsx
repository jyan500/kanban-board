import React, {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "../styles/table.css"
import { v4 as uuidv4 } from "uuid"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"

type Props = {
	config: Record<string, any>
	data: Array<Record<string, any>> | undefined 
}

export const Table = ({config, data}: Props) => {
	const [tableKey, setTableKey] = useState(uuidv4())
	const { selectAll, ids: itemIds } = useAppSelector((state) => state.bulkEdit)
	const allIds = data?.map((row) => row.id)

	return (
		<table>
			<thead>
				<tr>
					{config.bulkEdit?.isEnabled ? (
						<th><input type = "checkbox" checked={itemIds.length === allIds?.length && itemIds.length !== 0} onChange={(e) => {
							config.bulkEdit?.onClickAll(allIds)
						}}/></th>
					) : null}
					{(Object.values(config.headers) as Array<string>).map((header) => (
						<th key = {`${tableKey}-${header !== "" ? header : uuidv4()}`}>{header}</th>	
					))
					}
				</tr>
			</thead>
			<tbody>
				{data?.map((row) => {
					return (
						<tr key = {`${tableKey}-${row.id}`}>
							{config.bulkEdit?.isEnabled ? 
								(<td><input type = "checkbox" checked = {itemIds.includes(row.id)} onChange={(e) => config.bulkEdit?.onClick(row.id)}/></td>) 
							: null}
							{
								Object.keys(config.headers).map((headerKey) => {
									if (headerKey === config.linkCol){
										return (
											<td key = {`${tableKey}-${headerKey}`}><Link to = {config.link(row.id)}>{row[headerKey]}</Link></td>
										)
									}
									else if (headerKey === config.editCol?.col){
										return (
											<td key = {`${tableKey}-${headerKey}`}><button className = "button" onClick={() => config.editCol?.onClick(row.id)}>{config.editCol?.text}</button></td>
										)
									}
									else if (headerKey in config.modifiers){
										const {modifier, lookup} = config.modifiers[headerKey]
										return (
											<td key = {`${tableKey}-${headerKey}`}>{lookup ? modifier(row[headerKey], lookup) : modifier(row[headerKey])}</td>
										)
									}
									else {
										return (
											<td key = {`${tableKey}-${headerKey}`}>{row[headerKey]}</td>
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