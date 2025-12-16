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
	customPageParam?: string
}

export const PaginationRow = ({showPageNums, showNumResults, paginationData, setPage, url, urlParams, currentPage, customPageParam}: Props) => {

	return (
		<div className = {`tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-items-center lg:tw-gap-x-4`}>
			{
				paginationData ? (
					<>

						{showNumResults ? <p>Showing {paginationData.from} - {paginationData.to} out of {paginationData.total} results</p> : null}
						<div className = "tw-flex tw-flex-row tw-items-center tw-gap-x-2">
							{
	                            <ArrowButton disabled={paginationData?.prevPage == null} onClick={(e => {
	                            	e.preventDefault()
	                            	if (paginationData.prevPage){
	                            		setPage(paginationData.prevPage)
	                            	}
	                            })}/>
							}
							{
								showPageNums ? (
									<div className = "tw-flex tw-flex-wrap tw-gap-x-1">
									{
										Array.from(Array(paginationData.lastPage), (_, i) => {
											if (!url){
												return (
													<button
														className={`tw-px-0.5 tw-border-b ${i+1 === currentPage ? "tw-font-bold tw-border-gray-800" : "tw-border-transparent"}`}
														key={`pagination-page-${i}`}
														onClick={() => setPage(i+1)}
													>
														{i+1}
													</button>
												)
											}
											const urlParamsWithPage = {
												[customPageParam ?? "page"]: i+1,
												...urlParams
											}
											return (
												<Link 
													className={`tw-px-0.5 tw-border-b ${i+1 === currentPage ? "tw-font-bold tw-border-gray-800" : "tw-border-transparent"}`}
													key={`pagination_page_${i}`} 
													to={`${url}?${parseURLParams(urlParamsWithPage)}`}>
													{i+1}
												</Link>	
											)
										})
									}	
									</div>
								) : null
							}
							{
                                <ArrowButton disabled={paginationData?.nextPage == null} isForward={true} onClick={(e => {
	                            	e.preventDefault()
	                            	if (paginationData.nextPage){
	                            		setPage(paginationData.nextPage)
	                            	}
	                            })}/>
							}
                        </div>
                    </>
                ) : (null)
			}  
		</div>
	)
}
