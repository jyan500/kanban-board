import React from "react"
import { PieChartItem } from "../../types/common"
import { ColorKeyRow } from "./ColorKeyRow"

interface Props {
    data: Array<PieChartItem>
    hoveredIndex: number | null
    boardId: number
    searchKey: string
    handleMouseEnter: (index: number) => void
    handleMouseLeave: () => void
}

export const ColorKey = ({
    data, 
    hoveredIndex, 
    handleMouseEnter, 
    handleMouseLeave,
    boardId,
    searchKey,
}: Props) => {
    return (
        <div className = "tw-space-y-2">
            {
                data.map((obj, index) => {
                    return (
                        <div 
                            key={`type_${obj.name}`} 
                            onMouseEnter={() => handleMouseEnter(index)}
                            onMouseLeave={handleMouseLeave}
                            style={{ 
                                opacity: hoveredIndex === index ? .5 : 1,
                                transition: 'opacity 0.2s ease',
                                cursor: "pointer"
                            }}
                            className = "tw-flex tw-flex-col tw-gap-y-2 tw-text-sm">
                            <ColorKeyRow 
                                boardId={boardId}
                                searchKey={searchKey}
                                data={obj}/>
                        </div>
                    )
                })
            }
        </div>
    )
}
