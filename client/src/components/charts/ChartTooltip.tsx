import { ColorKeyRow } from "./ColorKeyRow"
import { PieChartItem } from "../../types/common"

interface ChartTooltipProps {
    active?: boolean
    payload?: Array<{
        name: string
        value: number
        payload: PieChartItem
    }>
}

export const ChartTooltip = ({ active, payload }: ChartTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload
        return (
            <div className="tw-bg-white tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-shadow-lg">
                <ColorKeyRow data={data}/>
            </div>
        )
    }
    return null
}