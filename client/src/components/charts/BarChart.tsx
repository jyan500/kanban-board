import { useState, useEffect } from "react"
import { BarChart as ReBarChart, Bar, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip } from "./ChartTooltip"
import { PieChartItem } from "../../types/common"
import { useNavigate } from "react-router-dom"
import { TICKETS } from "../../helpers/routes"
import { useScreenSize } from "../../hooks/useScreenSize"
import { LG_BREAKPOINT, PRIMARY_TEXT, SECONDARY_TEXT } from "../../helpers/constants"
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks"

interface Props {
    data: Array<PieChartItem>
    searchKey: string
    boardId: number
}

export const BarChart = ({data, searchKey, boardId}: Props) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const { width, height } = useScreenSize()
    const { isDarkMode } = useAppSelector((state) => state.darkMode)
    const navigate = useNavigate()

    const handleBarClick = (data: any) => {
        navigate(`${TICKETS}?boardId=${boardId}&${searchKey}=${data.id}`,  { replace: true })
    }

    const CustomLegend = () => (
        <div className="tw-mt-4 tw-grid tw-grid-cols-2 tw-gap-2 tw-text-sm">
            {data.map((item, index) => (
                <div 
                    key={`legend-${index}`}
                    className="tw-flex tw-items-center tw-gap-2 tw-p-2 tw-rounded hover:tw-bg-gray-100 tw-cursor-pointer"
                    onClick={() => handleBarClick(item)}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <span className={`tw-flex-1 tw-truncate ${SECONDARY_TEXT}`} title={item.name}>
                        {item.name}
                    </span>
                    <span className={`tw-font-semibold ${PRIMARY_TEXT}`}>
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    )

    return (
        <div className = "tw-flex tw-flex-col tw-gap-y-2">
            <ResponsiveContainer width="100%" height={300}>
                <ReBarChart data={data}>
                    <XAxis 
                        dataKey="name" 
                        tick={width >= LG_BREAKPOINT ? {fontSize: 12} : false}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis 
                        tick={{fontSize: 12}}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={15}
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
            { width < LG_BREAKPOINT ? <CustomLegend/> : null}
        </div>
    )
}
