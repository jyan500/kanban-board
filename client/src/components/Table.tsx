import React, {useState, useEffect} from "react"
import { Link } from "react-router-dom"
import "../styles/table.css"
import { v4 as uuidv4 } from "uuid"
import { useAppSelector, useAppDispatch } from "../hooks/redux-hooks"
import { LG_BREAKPOINT, PRIMARY_TEXT, NESTED_TABLE_BACKGROUND, SECONDARY_TEXT, STANDARD_BORDER_COLOR, STANDARD_HOVER, TABLE_BACKGROUND, LINK_TEXT, TABLE_DIVIDE } from "../helpers/constants"
import { IconButton } from "./page-elements/IconButton"
import { IconArrowRight } from "./icons/IconArrowRight"
import { IconArrowDown } from "./icons/IconArrowDown"
import { IconPencil } from "./icons/IconPencil"
import { Button } from "./page-elements/Button"

type Props = {
	config: Record<string, any>
	data: Array<Record<string, any>> | undefined 
	itemIds?: Array<number>
	tableKey?: string
	fullWidth?: boolean
	hideCheckAllBox?: boolean
	isNestedTable?: boolean
}

type TableWrapperProps = {
	children: React.ReactNode
}

const TableWrapper = ({children}: TableWrapperProps) => {
	return (
		<div className = "tw-max-w-8xl tw-overflow-x-auto tw-shadow-md tw-rounded-md">
			<table className = "tw-min-w-full tw-w-max">
				{children}
			</table>
		</div>
	)
}

const InnerTable = (props: Props) => {
	const { tableKey: tKey, fullWidth } = props
	const [tableKey, setTableKey] = useState(tKey ?? uuidv4())
	return (
		<div className={`${NESTED_TABLE_BACKGROUND} ${fullWidth ? "tw-w-full" : ""}`}>
			<table className={`${fullWidth ? "tw-w-full tw-min-w-full" : "tw-min-w-full tw-w-max"}`}>
				<thead className={`${NESTED_TABLE_BACKGROUND} ${STANDARD_BORDER_COLOR} tw-border-b`}>
					<TableHeader config={props.config} tableKey={tableKey}/>
				</thead>
				<tbody className={`${NESTED_TABLE_BACKGROUND} ${TABLE_DIVIDE}`}>
					<TableContent {...props} showCheckboxes={false} tableKey={tableKey}/>
				</tbody>
			</table>
		</div>
	)
}

const TableHeader = ({showCheckboxes, config, tableKey}: Omit<Props, "data" | "itemIds" | "hideCheckAllBox"> & {showCheckboxes?: boolean}) => {
	const headers = Object.values(config.headers) as Array<string>;
	// leave a small space for the checkbox column, while all other columns have the same width
	const columnWidth = `${(showCheckboxes ? 95 : 100) / headers.length}%`;
	return (
		<tr>
			{
				showCheckboxes ? <th></th> : null
			}
			{
				(Object.values(config.headers) as Array<string>).map((header) => (
					<th 	
						style={{ 
							width: columnWidth,
							minWidth: columnWidth,
							maxWidth: columnWidth
						}}
						className = {`tw-text-xs tw-font-medium ${SECONDARY_TEXT} tw-uppercase tw-tracking-wider`} key = {`${tableKey}-${header !== "" ? header : uuidv4()}`}>{header}</th>	
				))
			}
		</tr>
	)
}

const TableContent = ({
	config, 
	data, 
	tableKey, 
	showCheckboxes, 
	itemIds, 
	isNestedTable, 
	nestedTableSet,
	setNestedTableSet, 
}: {
	nestedTableSet?: Set<number>, 
	showCheckboxes?: boolean, 
	setNestedTableSet?: (nestedTableSet: Set<number>) => void
} & Omit<Props, "hideCheckAllBox">) => {
	
	/* get the colspan to display a row that spans the whole col span for the inner table */	
	const getColSpan = () => {
		let cols = Object.keys(config.headers).length;
		if (showCheckboxes) cols += 1
		return cols;
	}	

	return (
		<>
		{data?.map((row) => {
			const {component: Component, idKey, fullWidth} = config.nestedTable ?? {}
			const props = {
				[idKey]: row.id,
				fullWidth,
			}
			return (
				<React.Fragment key={`${tableKey}-${row.id}-fragment`}>
				<tr className = {`${SECONDARY_TEXT} ${isNestedTable ? `${NESTED_TABLE_BACKGROUND} ${STANDARD_HOVER}` : ""}`} key = {`${tableKey}-${row.id}`}>
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
									<td key = {`${tableKey}-${row.id}-${headerKey}`}><Link className={LINK_TEXT} to = {config.link(row.id)}>{row[headerKey]}</Link></td>
								)
							}
							else if (headerKey === config.nestedTableControl?.col){
								return (
									<td key={`${tableKey}-${row.id}-${headerKey}`}>	
										{
											<Button theme={"secondary"} onClick={setNestedTableSet && nestedTableSet ? () => {
												const newNestedTableSet = new Set(nestedTableSet)
												newNestedTableSet.has(row.id) ? newNestedTableSet.delete(row.id) : newNestedTableSet.add(row.id)
												setNestedTableSet(newNestedTableSet)
											} : () => {}}>
												{
													nestedTableSet?.has(row.id) ? 
													<>
														<IconArrowDown className="tw-h-4 tw-w-4 tw-mr-1" />
														<span>Hide {config.nestedTableControl.text}</span>
													</> : 
													<>
														<IconArrowRight className="tw-h-4 tw-w-4 tw-mr-1" />
														<span>Show {config.nestedTableControl.text}</span>
													</>
												}	
											</Button>
										}
									</td>
								)
							}
							else if (headerKey === config.editCol?.col){
								return (
									<td key = {`${tableKey}-${row.id}-${headerKey}`}>
										{
											!config.editCol.shouldShow || (config.editCol.shouldShow && config.editCol.shouldShow(row)) ? (
												<IconButton onClick={() => config.editCol?.onClick(row.id)}>
													<IconPencil className = {`tw-w-6 tw-h-6 ${SECONDARY_TEXT}`}/>
												</IconButton>
											) : null	
										}
									</td>
								)
							}
							else if (headerKey === config.approveCol?.col){
								return (
									<td key = {`${tableKey}-${row.id}-${headerKey}`}>
										{
											!config.approveCol.shouldShow || (config.approveCol.shouldShow && config.approveCol.shouldShow(row)) ? (
												<Button onClick={() => config.approveCol?.onClick(row.id)}>
													{ config.approveCol?.text }
												</Button>
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
												<Button theme="alert" onClick={() => config.deleteCol?.onClick(row.id)}>{config.deleteCol?.text}
												</Button>
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
							
							else if (headerKey in config.modifiers){
								const {modifier, lookup} = config.modifiers[headerKey]
								return (
									<td key = {`${tableKey}-${row.id}-${headerKey}`}>{lookup ? modifier(row[headerKey], lookup) : modifier(row[headerKey])}</td>
								)
							}
							else {
								return (
									<td key = {`${tableKey}-${row.id}-${headerKey}`}><span className = "tw-line-clamp-3">{row[headerKey]}</span></td>
								)
							}
						})
					}
				</tr>
				{/* Render nested table in a separate row that spans all columns */}
				{
					Component && nestedTableSet && nestedTableSet.has(row.id) ? 
					(
					<tr key={`${tableKey}-${row.id}-nested`}>
						<td colSpan={getColSpan()} className={`${NESTED_TABLE_BACKGROUND} tw-p-0 tw-bg-gray-50`}>
							<div className={`${NESTED_TABLE_BACKGROUND} tw-p-4 tw-border-l-4 tw-border-blue-200 tw-min-w-full`}>
								<Component {...props}/>
							</div>
						</td>
					</tr>	
					) : null
				}
				</React.Fragment>
			)	
		})}
		</>
	)
}


const MainTable = (props: Props) => {
	const {config, data, itemIds, tableKey: tKey, hideCheckAllBox, isNestedTable=false} = props
	const [tableKey, setTableKey] = useState(tKey ?? uuidv4())
	const [nestedTableSet, setNestedTableSet] = useState<Set<number>>(new Set())
	const allIds = config.bulkEdit?.isEnabled && config.bulkEdit?.filter ? config.bulkEdit?.filter(data).map((row: Record<string, any>) => row.id) : data?.map((row) => row.id)
	// if there any actions we can take on each row, but the row is not selectable due to a specific condition from the config,
	// we cannot show the checkboxes and the action buttons
	const showCheckboxes = config.bulkEdit?.isEnabled && config.bulkEdit?.filter && allIds.length > 0

	return (
		<>
			<thead className={`${isNestedTable ? NESTED_TABLE_BACKGROUND : TABLE_BACKGROUND} tw-border-b ${STANDARD_BORDER_COLOR}`}>
				<TableHeader showCheckboxes={showCheckboxes} config={config} tableKey={tableKey}/>
			</thead>
			<tbody className={`${TABLE_BACKGROUND} ${TABLE_DIVIDE}`}>
				<TableContent 
					nestedTableSet={nestedTableSet} 
					setNestedTableSet={setNestedTableSet} 
					showCheckboxes={showCheckboxes} 
					tableKey={tableKey}
					{...props}
				/>
			</tbody>
		</>
	)
}

export const Table = (props: Props) => {
	return (
		props.isNestedTable ? (
			<InnerTable
				{...props}
			/>
		) : (
			<TableWrapper>
				<MainTable {...props}/>
			</TableWrapper>
		)
	)	
}
