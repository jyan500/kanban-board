import React, { useState, useEffect } from 'react';
import { IconContext } from "react-icons"
import { GrNext as Next, GrPrevious as Previous } from "react-icons/gr";
import { IconButton } from "../page-elements/IconButton"
import { FADE_ANIMATION } from "../../helpers/constants"

interface Props {
    items: Array<React.ReactNode>
    itemsPerPage: number
    itemContainerClassName?: string
    index?: number
    setShowImageOverlay?: (index: number) => void 
}

export const MultiCardCarousel = ({ index, items, itemsPerPage, itemContainerClassName, setShowImageOverlay }: Props) => {
    const [currentIndex, setCurrentIndex] = useState(index ?? 0)

    useEffect(() => {
        if (index != null && index <= items.length){
            setCurrentIndex(index)
        }
    }, [index])

    if (itemsPerPage < 1 || itemsPerPage > items.length) {
        return <div></div>
    }

    const style = {
        ...(itemsPerPage > 1 ? {width: `${1/itemsPerPage*100}%`} : {})
    }

    const handlePrev = () => {
        /* 
            the total number of pages = Math.ceil(items.length/itemsPerPage), so 
            the last index should be total number of pages - 1
        */
        const newIndex = currentIndex === 0 ? Math.ceil(items.length/itemsPerPage) - 1 : currentIndex - 1 
        setCurrentIndex(newIndex)
    }

    const handleNext = () => {
        const newIndex = currentIndex === Math.ceil(items.length/itemsPerPage) - 1 ? 0 : currentIndex + 1
        setCurrentIndex(newIndex)
    }

    const setPage = (i: number) => {
        setCurrentIndex(i)
    }

    return (
        <div>
            <div className = "tw-flex tw-justify-center">
                <div className={`${itemsPerPage === 1 ? "tw-max-w-[800px]" : ""} tw-relative tw-h-full tw-w-full tw-overflow-hidden tw-rounded-lg`}>
                    {/* 
                        transition translate X based on the -(currentIndex) * 100. 
                        it's negative so the animation will start from right to left
                    */}
                    <div className="tw-flex tw-transition-transform tw-duration-700 tw-ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {items.map((item, i) => (
                            /* 
                                Renders all items, the combination of flex-shrink-0 on each flex item, as well as the width being set to the percent each item takes per page
                                gives the illusion that only a certain amount of items display on each page based on the itemsPerPage.
                            */
                            <button onClick={() => setShowImageOverlay ? setShowImageOverlay(i) : null} key={`carousel_item_${i}`} style = {style} className = {`${itemContainerClassName ?? ""} ${FADE_ANIMATION} tw-relative tw-w-full tw-h-full hover:tw-opacity-80 tw-flex-shrink-0 tw-px-2`}>
                                {item}
                            </button>
                        ))}
                    </div>
                    {
                        itemsPerPage < items.length ? (
                            <>
                            <button
                                className="tw-absolute tw-top-1/2 tw-left-4 tw-transform -tw-translate-y-1/2 hover:tw-bg-white hover:tw-opacity-40 tw-bg-white tw-opacity-60 tw-text-gray-800 tw-px-2 tw-py-2 tw-rounded-full tw-cursor-pointer"
                                onClick={handlePrev}
                            >
                                <IconContext.Provider value = {{className: "tw-w-6 tw-h-6"}}>
                                    <Previous/> 
                                </IconContext.Provider> 
                            </button>
                            <button
                                className="tw-absolute tw-top-1/2 tw-right-4 tw-transform -tw-translate-y-1/2 hover:tw-bg-white hover:tw-opacity-40 tw-bg-white tw-opacity-60 tw-text-gray-800 tw-px-2 tw-py-2 tw-rounded-full tw-cursor-pointer"
                                onClick={handleNext}
                            >
                                <IconContext.Provider value = {{className: "tw-w-6 tw-h-6"}}>
                                    <Next/>
                                </IconContext.Provider> 
                            </button>
                            </>
                        ) : null
                    }
                </div>
            </div>
            <div className = "tw-flex tw-flex-col tw-justify-center">
                {
                    itemsPerPage < items.length ? (
                        <div className = "tw-p-4 tw-flex tw-items-center tw-justify-center tw-gap-2">
                            {
                                Array.from(Array(Math.ceil(items.length/itemsPerPage)), (_, i) => {
                                    return (
                                        <button key = {`carousel_pagination_${i}`} onClick={() => setPage(i)}><div className = {`tw-transition tw-w-3 tw-h-3 tw-bg-gray-800 tw-rounded-full ${currentIndex === i ? "tw-p-2" : "tw-bg-opacity-50"}`}></div></button>
                                    )
                                })
                            }   
                        </div>
                    ) : null
                } 
            </div>
        </div>
    )
}

