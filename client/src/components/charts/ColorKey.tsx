import React from "react"
import { PieChartItem } from "../../types/common"
import { ColorKeyRow } from "./ColorKeyRow"

interface Props {
    data: Array<PieChartItem>
}

export const ColorKey = ({data}: Props) => {
    return (
        <div className = "tw-space-y-2">
            {
                data.map((obj) => {
                    return (
                        <div key={`type_${obj.name}`} className = "tw-flex tw-flex-col tw-gap-y-2 tw-text-sm">
                            <ColorKeyRow data={obj}/>
                        </div>
                    )
                })
            }
        </div>
    )
}