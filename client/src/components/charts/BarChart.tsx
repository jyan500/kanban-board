import { useState } from "react"
import { BarChart as ReBarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./ChartTooltip"
import { PieChartItem } from "../../types/common"
import { useNavigate } from "react-router-dom"
import { TICKETS } from "../../helpers/routes"

interface Props {
    data: Array<PieChartItem>
    searchKey: string
    boardId: number
}

export const BarChart = ({data, searchKey, boardId}: Props) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const navigate = useNavigate()

    const handleBarClick = (data: any) => {
        navigate(`${TICKETS}?boardId=${boardId}&${searchKey}=${data.id}`,  { state: { resetFilters: true } })
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <ReBarChart data={data}>
                <XAxis 
                    dataKey="name" 
                    tick={{fontSize: 12}}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis 
                    tick={{fontSize: 12}}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                />
                <Tooltip cursor={false} content={<ChartTooltip/>} />
                <Bar 
                    style={{cursor: "pointer"}} 
                    onMouseEnter={(data, index) => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={handleBarClick} dataKey="value" fill="#78909C" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`}
                            fill={hoveredIndex === index ? '#5a6c7d' : '#78909C'} // Darker on hover
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </Bar>
            </ReBarChart>
        </ResponsiveContainer>
    )
}