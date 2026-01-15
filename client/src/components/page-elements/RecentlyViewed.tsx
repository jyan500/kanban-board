import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getRecentlyViewed } from "../../helpers/recentlyViewed" 
import { ViewedItem } from "../../types/common"
import { BOARDS, SPRINTS, TICKETS } from "../../helpers/routes"
import { IconTicket } from "../icons/IconTicket"
import { IconBoard } from "../icons/IconBoard"
import { IconClock } from "../icons/IconClock"
import { formatDistanceToNow } from "date-fns"

export const RecentlyViewed = () => {
    const [recentItems, setRecentItems] = useState<Array<ViewedItem>>([])

    useEffect(() => {
        // Load items from local storage
        const items = getRecentlyViewed(5)
        setRecentItems(items)

        // Listen for storage changes across multiple tabs
        const handleStorageChange = () => {
            const updatedItems = getRecentlyViewed(5)
            setRecentItems(updatedItems)
        }

        window.addEventListener("storage", handleStorageChange)
        // listen for custom event when items are tracked
        window.addEventListener("recentlyViewedUpdated", handleStorageChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("recentlyViewedUpdated", handleStorageChange)
        }

    }, [])

    const getItemLink = (item: ViewedItem) => {
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
    }

    const getItemIcon = (type: string) => {
        switch (type){
            case "ticket":
                return <IconTicket/>
            case "board":
                return <IconBoard/>
            case "sprint":
                return <IconClock/>
        }
    }

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
            <div className = "tw-flex tw-flex-col tw-gap-y-2">
                {
                    recentItems.map((item) => {
                        return (
                            <Link 
                                key={`${item.type}-${item.id}`}
                                to={getItemLink(item)}
                                className = "tw-flex tw-items-center tw-p-3 tw-rounded-md hover:tw-bg-gray-50 tw-transition-colors tw-duration-200 tw-no-underline tw-text-inherit"
                            >
                                <span className = "tw-text-xl tw-mr-3">{getItemIcon(item.type)}</span>
                                <div className = "tw-flex tw-flex-col tw-flex-1">
                                    <span className = "tw-font-medium tw-text-gray-900">{item.name}</span>
                                    <span className = "tw-text-xs tw-text-gray-500 tw-mt-0.5">{formatTimeAgo(item.viewedAt)}</span>
                                </div>
                            </Link>
                        )
                    })
                }
            </div>
        </div>
    )

}
