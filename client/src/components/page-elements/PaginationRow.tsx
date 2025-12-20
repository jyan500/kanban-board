import React, { useState } from "react"
import { IconButton } from "./IconButton"
import { GrNext as Next, GrPrevious as Previous } from "react-icons/gr"
import { Link } from "react-router-dom"
import { IconContext } from "react-icons"
import { IPagination } from "../../types/common"
import { parseURLParams } from "../../helpers/functions" 
import { ArrowButton } from "./ArrowButton" 
import { InlineEditButton } from "./InlineEditButton"
import { IconCheckmark } from "../icons/IconCheckmark"
import { IconClose } from "../icons/IconClose"
import { MAX_PAGES_BEFORE_COMPRESS } from "../../helpers/constants"

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
    const [showInputIndex, setShowInputIndex] = useState<number>(0)
    const [inputValue, setInputValue] = useState("")
    const [errorState, setErrorState] = useState(false)

    const handleGoToPage = () => {
        const pageNum = parseInt(inputValue)
        if (pageNum >= 1 && pageNum <= (paginationData?.lastPage || 1)) {
        	setErrorState(false)
            setPage(pageNum)
            setShowInputIndex(0)
            setInputValue("")
        }
        else {
        	setErrorState(true)
        }
    }

    const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleGoToPage()
        }
    }

    /* 
    Render page numbers in the following manner:
    First page (1)
	Ellipsis if needed
	2 pages before and after the current page
	Ellipsis if needed
	Last page
    */
    const renderPageNumbers = () => {
        if (!paginationData?.lastPage) return null

        const totalPages = paginationData.lastPage
        const current = currentPage || paginationData.currentPage

        // If under page constraint, show all
        if (totalPages <= MAX_PAGES_BEFORE_COMPRESS) {
            return Array.from(Array(totalPages), (_, i) => renderPageButton(i + 1))
        }

        // Show smart pagination with ellipsis
        const pages: (number | 'ellipsis')[] = []
        
        // Always show first page
        pages.push(1)

        // Determine range around current page
        const rangeStart = Math.max(2, current - 2)
        const rangeEnd = Math.min(totalPages - 1, current + 2)

        // Add ellipsis after first page if needed
        if (rangeStart > 2) {
            pages.push('ellipsis')
        }

        // Add range around current page
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i)
        }

        // Add ellipsis before last page if needed
        if (rangeEnd < totalPages - 1) {
            pages.push('ellipsis')
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages)
        }

        return pages.map((page, index) => {
            if (page === 'ellipsis') {
                return (
                    <div key={`ellipsis-${index}`}>
                        {showInputIndex !== index ? (
                            <button
                                className="tw-px-2 tw-py-1 tw-border-b tw-border-transparent hover:tw-text-gray-600"
                                onClick={() => setShowInputIndex(index)}
                            >
                                ...
                            </button>
                        ) : (
                            <div className="tw-relative">
                            	<div>
	                                <input
	                                    type="number"
	                                    min="1"
	                                    max={paginationData.lastPage}
	                                    value={inputValue}
	                                    onChange={(e) => setInputValue(e.target.value)}
	                                    onKeyPress={handleInputKeyPress}
	                                    className={`${errorState ? "!tw-border-red-500" : ""} !tw-p-1 tw-w-16`}
	                                    placeholder="Page"
	                                    autoFocus
	                                />
	                            </div>
                                <div className="tw-absolute tw-top-full tw-mt-1 tw-z-10 tw-flex tw-flex-row tw-gap-x-2">
									<InlineEditButton 
										className = "tw-p-1"
										onClick={(e) => {
											e.preventDefault()
											handleGoToPage()
										}}>
										<IconCheckmark/>
									</InlineEditButton>
									<InlineEditButton
										className = "tw-p-1"
										onClick={(e) => {
											e.preventDefault()
											setErrorState(false)
											setShowInputIndex(0)
											setInputValue("")
										}}
									>
										<IconClose/>
									</InlineEditButton>
						        </div>
                            </div>
                        )}
                    </div>
                )
            }
            return renderPageButton(page as number)
        })
    }

    const renderPageButton = (pageNum: number) => {
        const current = currentPage || paginationData?.currentPage
        const isActive = pageNum === current

        if (!url) {
            return (
                <button
                    className={`tw-px-2 tw-py-1 tw-border-b ${isActive ? "tw-font-bold tw-border-gray-800" : "tw-border-transparent"}`}
                    key={`pagination-page-${pageNum}`}
                    onClick={() => setPage(pageNum)}
                >
                    {pageNum}
                </button>
            )
        }

        const urlParamsWithPage = {
            [customPageParam ?? "page"]: pageNum,
            ...urlParams
        }

        return (
            <Link 
                className={`tw-px-2 tw-py-1 tw-border-b ${isActive ? "tw-font-bold tw-border-gray-800" : "tw-border-transparent"}`}
                key={`pagination_page_${pageNum}`} 
                to={`${url}?${parseURLParams(urlParamsWithPage)}`}
            >
                {pageNum}
            </Link>	
        )
    }

    return (
        <div className={`tw-flex tw-flex-col tw-gap-y-2 lg:tw-flex-row lg:tw-items-center lg:tw-gap-x-4`}>
            {
                paginationData ? (
                    <>
                        {showNumResults ? <p>Showing {paginationData.from} - {paginationData.to} out of {paginationData.total} results</p> : null}
                        <div className="tw-flex tw-flex-row tw-items-center tw-gap-x-2">
                            <ArrowButton 
                                disabled={paginationData?.prevPage == null} 
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (paginationData.prevPage){
                                        setPage(paginationData.prevPage)
                                    }
                                }}
                            />
                            {showPageNums ? (
                                <div className="tw-flex tw-flex-wrap tw-gap-x-1 tw-items-center">
                                    {renderPageNumbers()}
                                </div>
                            ) : null}
                            <ArrowButton 
                                disabled={paginationData?.nextPage == null} 
                                isForward={true} 
                                onClick={(e) => {
                                    e.preventDefault()
                                    if (paginationData.nextPage){
                                        setPage(paginationData.nextPage)
                                    }
                                }}
                            />
                        </div>
                    </>
                ) : null
            }  
        </div>
    )
}