import React, {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "../styles/table.css"
import { v4 as uuidv4 } from "uuid"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { LG_BREAKPOINT } from "../helpers/constants"

type Props = {
	config: Record<string, any>
	data: Array<Record<string, any>> | undefined 
	itemIds?: Array<number>
	tableKey?: string
	hideCheckAllBox?: boolean
}

export const Table = ({config, data, itemIds, tableKey: tKey, hideCheckAllBox}: Props) => {
	const [tableKey, setTableKey] = useState(tKey ?? uuidv4())
	const allIds = config.bulkEdit?.isEnabled && config.bulkEdit?.filter ? config.bulkEdit?.filter(data).map((row: Record<string, any>) => row.id) : data?.map((row) => row.id)
	// if there any actions we can take on each row, but the row is not selectable due to a specific condition from the config,
	// we cannot show the checkboxes and the action buttons
	const showCheckboxes = config.bulkEdit?.isEnabled && config.bulkEdit?.filter && allIds.length > 0
	return (
		<div className = "tw-max-w-4xl tw-overflow-x-auto">
			<table className = "tw-min-w-full tw-w-max">
				<thead>
					<tr>
						{showCheckboxes ? (
							<th>
								{!hideCheckAllBox ? <input type = "checkbox" checked={itemIds?.length === allIds?.length && itemIds?.length !== 0} onChange={(e) => {
									config.bulkEdit?.updateIds(itemIds?.length === allIds?.length ? [] : allIds)
								}}/> : <></>}
							</th>
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
								{showCheckboxes ? 
									(<td>
										{config.bulkEdit?.canSelect(row) ? 
											<input type = "checkbox" checked = {itemIds?.includes(row.id)} onChange={(e) => config.bulkEdit?.onClick(row.id)}/>
										: null
										}
									</td>) 
								: null}
								{
									Object.keys(config.headers).map((headerKey) => {
										if (headerKey === config.linkCol){
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}><Link to = {config.link(row.id)}>{row[headerKey]}</Link></td>
											)
										}
										else if (headerKey === config.editCol?.col){
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}>
													{
														!config.editCol.shouldShow || (config.editCol.shouldShow && config.editCol.shouldShow(row)) ? (
															<button className = "button" onClick={() => config.editCol?.onClick(row.id)}>{config.editCol?.text}
															</button>
														) : null	
													}
												</td>
											)
										}
										else if (headerKey === config.deleteCol?.col){
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}>
													{
														!config.deleteCol.shouldShow || (config.deleteCol.shouldShow && config.deleteCol.shouldShow(row)) ? (
															<button className = "button --alert" onClick={() => config.deleteCol?.onClick(row.id)}>{config.deleteCol?.text}
															</button>
														) : null
													}
												</td>
											)
										}
										else if (config.renderers && headerKey in config.renderers){
											const {component: Component, props} = config.renderers[headerKey](row[headerKey])
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}>
													<div className = "tw-flex tw-justify-center">
														<Component {...props}/>
													</div>
												</td>
											)
										}
										else if (headerKey in config.modifiers){
											const {modifier, lookup} = config.modifiers[headerKey]
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}>{lookup ? modifier(row[headerKey], lookup) : modifier(row[headerKey])}</td>
											)
										}
										else {
											return (
												<td key = {`${tableKey}-${row.id}-${headerKey}`}>{row[headerKey]}</td>
											)
										}
									})
								}
							</tr>
						)	
					})}
				</tbody>
			</table>
		</div>
	)
}
