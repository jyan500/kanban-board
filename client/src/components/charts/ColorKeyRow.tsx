import { PieChartItem } from "../../types/common"
import { Link } from "react-router-dom"
import { TICKETS } from "../../helpers/routes"

interface Props {
    data: PieChartItem
    boardId?: number
    searchKey?: string
}

export const ColorKeyRow = ({data, boardId, searchKey}: Props) => {
    return (
        <div 
            className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
            <div className = "tw-w-3 tw-h-3 tw-rounded-sm" style={{backgroundColor: data.color}}></div>
            {boardId && searchKey ? 
                <Link state={{resetFilters: true}} to={`${TICKETS}?boardId=${boardId}&${searchKey}=${data.id}`}><span className = "tw-text-gray-700">{data.name}: {data.value}</span></Link>
                :
                <span className = "tw-text-gray-700">{data.name}: {data.value}</span>}
        </div>
    )
}
