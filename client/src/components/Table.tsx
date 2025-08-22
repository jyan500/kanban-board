import React, {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "../styles/table.css"
import { v4 as uuidv4 } from "uuid"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { LG_BREAKPOINT } from "../helpers/constants"
import { IconButton } from "./page-elements/IconButton"
import { IconArrowRight } from "./icons/IconArrowRight"
import { IconArrowDown } from "./icons/IconArrowDown"

type Props = {
	config: Record<string, any>
	data: Array<Record<string, any>> | undefined 
	itemIds?: Array<number>
	tableKey?: string
	hideCheckAllBox?: boolean
	isNestedTable?: boolean
}

export const Table = ({config, data, itemIds, tableKey: tKey, hideCheckAllBox, isNestedTable=false}: Props) => {
	const [tableKey, setTableKey] = useState(tKey ?? uuidv4())
	const [showNestedTable, setShowNestedTable] = useState(false)
	const allIds = config.bulkEdit?.isEnabled && config.bulkEdit?.filter ? config.bulkEdit?.filter(data).map((row: Record<string, any>) => row.id) : data?.map((row) => row.id)
	// if there any actions we can take on each row, but the row is not selectable due to a specific condition from the config,
	// we cannot show the checkboxes and the action buttons
	const showCheckboxes = config.bulkEdit?.isEnabled && config.bulkEdit?.filter && allIds.length > 0
	return (
		<div className = "tw-max-w-6xl tw-overflow-x-auto tw-shadow-md tw-rounded-md">
			<table className = "tw-min-w-full tw-w-max tw-bg-white">
				<thead className={`${isNestedTable ? "tw-bg-gray-100" : "tw-bg-gray-50"} tw-border-b tw-border-gray-200`}>
					<tr>
						{showCheckboxes ? (
							<th className = "tw-text-xs tw-font-medium tw-text-gray-600 tw-uppercase tw-tracking-wider">
								{!hideCheckAllBox ? <input type = "checkbox" checked={itemIds?.length === allIds?.length && itemIds?.length !== 0} onChange={(e) => {
									config.bulkEdit?.updateIds(itemIds?.length === allIds?.length ? [] : allIds)
								}}/> : <></>}
							</th>
						) : null}
						{(Object.values(config.headers) as Array<string>).map((header) => (
							<th className = "tw-text-xs tw-font-medium tw-text-gray-600 tw-uppercase tw-tracking-wider" key = {`${tableKey}-${header !== "" ? header : uuidv4()}`}>{header}</th>	
						))
						}
					</tr>
				</thead>
				<tbody>
					{data?.map((row) => {
						return (
							<tr className = {`${isNestedTable ? "tw-bg-gray-50 hover:tw-bg-gray-100 tw-transition-colors tw-duration-200" : ""}`} key = {`${tableKey}-${row.id}`}>
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
										else if (headerKey === config.nestedTableControl?.col){
											return (
												<td key={`${tableKey}-${row.id}-${headerKey}`}>	
													{
														<IconButton onClick={() => setShowNestedTable(!showNestedTable)} className = "tw-inline-flex tw-items-center tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-shadow-sm tw-text-sm tw-leading-4 tw-font-medium tw-rounded-md tw-text-gray-700 tw-bg-white hover:tw-bg-gray-50 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 focus:tw-ring-indigo-500 tw-transition-colors tw-duration-200">
															{
																showNestedTable ? 
																<>
				                                                    <IconArrowDown className="tw-h-4 tw-w-4 tw-mr-1" />
				                                                    <span>Hide {config.nestedTableControl.text}</span>
				                                                </> : 
				                                                <>
				                                                    <IconArrowRight className="tw-h-4 tw-w-4 tw-mr-1" />
				                                                    <span>Show {config.nestedTableControl.text}</span>
				                                                </>
															}	
														</IconButton>
													}
												</td>
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
													<div className = "tw-flex">
														<Component {...props}/>
													</div>
												</td>
											)
										}
										else if (config.nestedTable && showNestedTable){
											return (<div></div>)
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
