import React from "react"
import { IconButton } from "./IconButton"
import { GrNext as Next, GrPrevious as Previous } from "react-icons/gr";
import { Link } from "react-router-dom"
import { IconContext } from "react-icons"
import { IPagination } from "../../types/common"
import { parseURLParams } from "../../helpers/functions" 
import { ArrowButton } from "./ArrowButton" 

interface Props {
	showPageNums: boolean 
	paginationData: IPagination | null | undefined
	setPage: (pageNum: number) => void
	url?: string
	urlParams?: Record<string, any>
	currentPage?: number
	showNumResults?: boolean
}

export const PaginationRow = ({showPageNums, showNumResults, paginationData, setPage, url, urlParams, currentPage}: Props) => {

	return (
		<div className = {`tw-flex tw-flex-row tw-items-center tw-gap-x-4`}>
			{
				paginationData ? (
					<>

						{showNumResults ? <p>Showing {paginationData.from} - {paginationData.to} out of {paginationData.total} results</p> : null}
						<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
							{
								paginationData?.prevPage ? (
		                            <ArrowButton onClick={(e => {
		                            	e.preventDefault()
		                            	if (paginationData.prevPage){
		                            		setPage(paginationData.prevPage)
		                            	}
		                            })}/>
								) : null	
							}
							{
								showPageNums ? (
									<div className = "tw-flex tw-flex-wrap tw-gap-x-1">
										{
											Array.from(Array(paginationData.lastPage), (_, i) => {
												const urlParamsWithPage = {
													page: i+1,
													...urlParams
												}
											return (
											<Link 
												className = {`tw-px-0.5 ${i+1 === currentPage ? "tw-font-bold tw-border-b tw-border-gray-800" : ""}`}
												key={`pagination_page_${i}`} 
												to={`${url}?${parseURLParams(urlParamsWithPage)}`}>
												{i+1}
											</Link>	)
										})
									}	
									</div>
								) : null
							}
							{
								paginationData?.nextPage ? (
	                                  <ArrowButton isForward={true} onClick={(e => {
		                            	e.preventDefault()
		                            	if (paginationData.nextPage){
		                            		setPage(paginationData.nextPage)
		                            	}
		                            })}/>
								) : null 
							}
                        </div>
                    </>
                ) : (null)
			}  
		</div>
	)
}
