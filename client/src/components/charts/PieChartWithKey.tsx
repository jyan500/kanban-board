import React, {useState} from "react"
import { 
    Cell, 
    Label, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    PieLabelRenderProps, 
    Sector, 
    Text, 
    Tooltip  
} from "recharts"
import { PieChartItem } from "../../types/common"
import { ColorKey } from "../charts/ColorKey"
import { ChartTooltip } from "../charts/ChartTooltip"
import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../../hooks/redux-hooks"
import { TICKETS } from "../../helpers/routes"

interface Props {
    data: Array<PieChartItem>
    boardId: number
    searchKey: string
    total: number
}

const renderCenterLabel = (props: any) => {
    const { viewBox } = props
    // Calculate center from viewBox dimensions
    const cx = viewBox.x + viewBox.width / 2
    const cy = viewBox.y + viewBox.height / 2
    const value = props.value

    return (
        <g>
            <text 
                x={cx} 
                y={cy - 10} 
                textAnchor="middle" 
                dominantBaseline="middle"
                style={{ fontSize: '32px', fontWeight: 'bold', fill: props.isDarkMode ? "#FFF" : '#000' }}
            >
                {value}
            </text>
            <text 
                x={cx} 
                y={cy + 20} 
                textAnchor="middle" 
                dominantBaseline="middle"
                /* dark mode is slate-300 equivalent */
                style={{ fontSize: '14px', fill: props.isDarkMode ? "#d4d4d8" : '#6B7280' }}
            >
                Total tickets 
            </text>
        </g>
    )
}

export const PieChartWithKey = ({data, total, boardId, searchKey}: Props) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    const { isDarkMode } = useAppSelector((state) => state.darkMode)
    const navigate = useNavigate()

    if (!data || !Array.isArray(data) || data.length === 0) {
        return <div>No chart data</div>
    }

    const handlePieClick = (data: any, index: number) => {
        navigate(`${TICKETS}?boardId=${boardId}&${searchKey}=${data.id}`,  { replace: true })
    }

    const handleMouseEnter = (index: number) => {
        setHoveredIndex(index)
    }

    const handleMouseLeave = () => {
        setHoveredIndex(null)
    }
    
    return (
        <div className = "tw-flex tw-flex-col lg:tw-flex-row lg:tw-gap-x-2 tw-gap-y-2 lg:tw-items-center">
            <div className="tw-relative">
                <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                        {/* <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={false}
                            onClick={handlePieClick}
                        >
                            {data.map((entry, index) => (
                                <Cell 
                                    key={`cell-${entry.id}-${entry.value}`} 
                                    fill={entry.color} 
                                    style={{ 
                                        cursor: 'pointer',
                                        opacity: hoveredIndex === null || hoveredIndex === index ? 1 : 0.5,
                                        transition: 'opacity 0.2s ease'
                                    }} 
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={handleMouseLeave}
                                />
                            ))}
                        </Pie> */}
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            fill="#8884d8"
                        />
                        <Label 
                            value={total} 
                            position="center" 
                            content={(props: any) => renderCenterLabel({...props, isDarkMode})}
                        />
                        <Tooltip content={<ChartTooltip/>}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <ColorKey 
                boardId={boardId}
                searchKey={searchKey}
                hoveredIndex={hoveredIndex} 
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                data={data}
            />
        </div>
    )
}
