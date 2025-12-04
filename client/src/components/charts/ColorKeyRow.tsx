import { PieChartItem } from "../../types/common"

interface Props {
    data: PieChartItem
}

export const ColorKeyRow = ({data}: Props) => {
    return (
        <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
            <div className = "tw-w-3 tw-h-3 tw-rounded-sm" style={{backgroundColor: data.color}}></div>
            <span className = "tw-text-gray-700">{data.name}: {data.value}</span>
        </div>
    )
}