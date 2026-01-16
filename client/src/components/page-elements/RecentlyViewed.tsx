import React, { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { getRecentlyViewed, getTotalPages } from "../../helpers/recentlyViewed" 
import { ViewedItem } from "../../types/common"
import { BOARDS, SPRINTS, TICKETS } from "../../helpers/routes"
import { IconTicket } from "../icons/IconTicket"
import { IconBoard } from "../icons/IconBoard"
import { IconClock } from "../icons/IconClock"
import { formatDistanceToNow } from "date-fns"
import { IconArrowLeft } from "../icons/IconArrowLeft"
import { IconArrowRight } from "../icons/IconArrowRight"
import { setSourceMapRange } from "typescript"
import { PaginationButtonRow } from "./PaginationButtonRow"

interface Props {
    minHeight?: string
}

export const RecentlyViewed = ({minHeight}: Props) => {
    const [recentItems, setRecentItems] = useState<Array<ViewedItem>>([])
    const [totalPages, setTotalPages] = useState(0)
    const [page, setPage] = useState(1)
    const PER_PAGE = 5
    const [_, setCurrentDate] = useState(new Date())

    useEffect(() => {
        // Load items from local storage
        const items = getRecentlyViewed(page, PER_PAGE)
        const totalPages = getTotalPages(PER_PAGE)
        setRecentItems(items)
        setTotalPages(totalPages)

        // Listen for storage changes across multiple tabs
        const handleStorageChange = () => {
            const updatedItems = getRecentlyViewed(page, PER_PAGE)
            const updatedPages = getTotalPages(PER_PAGE)
            setRecentItems(updatedItems)
            setTotalPages(updatedPages)
        }

        window.addEventListener("storage", handleStorageChange)
        // listen for custom event when items are tracked
        window.addEventListener("recentlyViewedUpdated", handleStorageChange)

        const timeInterval = setInterval(() => {
            setCurrentDate(new Date())
        }, 60000)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("recentlyViewedUpdated", handleStorageChange)
            clearInterval(timeInterval)
        }

    }, [])

    useEffect(() => {
        const items = getRecentlyViewed(page, PER_PAGE)
        const totalPages = getTotalPages(PER_PAGE)
        setRecentItems(items)
        setTotalPages(totalPages)
    }, [page])

    const getItemLink = useCallback((item: ViewedItem) => {
        switch (item.type){
            case "ticket":
                return `${TICKETS}/${item.id}`
            case "board":
                return `${BOARDS}/${item.id}`
            case "sprint":
                return `${SPRINTS}/${item.id}` 
            default:
                return "#"
        }
    }, [recentItems])

    const getItemIcon = useCallback((type: string) => {
        switch (type){
            case "ticket":
                return <IconTicket className = "tw-w-5 tw-h-5"/>
            case "board":
                return <IconBoard className = "tw-w-5 tw-h-5"/>
            case "sprint":
                return <IconClock className = "tw-w-5 tw-h-5"/>
        }
    }, [recentItems])

    const formatTimeAgo = (date: Date) => {
        // takes the current time and subtracts it with the 
        // time that the activity was viewed
        // formats based on the closest time interval
        // if less than one minute, should show "less than a minute"
        // i.e if within minutes, use minutes
        // if above one hour, use hours, etc
        return formatDistanceToNow(date, {
            addSuffix: true,
            includeSeconds: false,
        })
    }

    return (
        <div className = "tw-p-2 lg:tw-p-4 tw-w-full tw-border tw-border-gray-200 tw-shadow-sm tw-rounded-md">
            <h2>Recently Viewed</h2>

            <div className = {`${recentItems.length >= 1 && minHeight ? minHeight : ""} tw-flex tw-flex-col tw-gap-y-2`}>
                {
                    recentItems.map((item) => {
                        return (
                            <Link 
                                key={`${item.type}-${item.id}`}
                                to={getItemLink(item)}
                                className = "tw-flex tw-items-center tw-p-3 tw-rounded-md hover:tw-bg-gray-50 tw-transition-colors tw-duration-200 tw-no-underline tw-text-inherit"
                            >
                                <span className = "tw-text-xl tw-mr-3">{getItemIcon(item.type)}</span>
                                <div className = "tw-flex tw-flex-col tw-line-clamp-1">
                                    <span className = "tw-font-medium tw-text-gray-900">{item.name}</span>
                                    <span className = "tw-text-xs tw-text-gray-500 tw-mt-0.5">{formatTimeAgo(item.viewedAt)}</span>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
            {
                totalPages > 1 ? 
                <PaginationButtonRow
                    isDisabledNext={page === totalPages}
                    isDisabledPrev={page === 1}
                    nextHandler={() => setPage(page+1)}
                    prevHandler={() => setPage(page-1)}
                />
                : null
            }
        </div>
    )

}
