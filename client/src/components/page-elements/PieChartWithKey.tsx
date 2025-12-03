import React from "react"
import { Cell, Label, ResponsiveContainer, PieChart, Pie, PieLabelRenderProps, Text, Tooltip  } from "recharts"
import { PieChartItem } from "../../types/common"

interface Props {
    data: Array<PieChartItem>
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
                style={{ fontSize: '32px', fontWeight: 'bold', fill: '#000' }}
            >
                {value}
            </text>
            <text 
                x={cx} 
                y={cy + 20} 
                textAnchor="middle" 
                dominantBaseline="middle"
                style={{ fontSize: '14px', fill: '#6B7280' }}
            >
                Total tickets 
            </text>
        </g>
    )
}

export const PieChartWithKey = ({data, total}: Props) => {

    return (
        <>
            <div className="tw-relative">
                <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Label 
                            value={total} 
                            position="center" 
                            content={renderCenterLabel}
                        />
                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className = "tw-space-y-2">
                {
                    data.map((obj) => {
                        return (
                            <div key={`type_${obj.name}`} className = "tw-flex tw-flex-col tw-gap-y-2 tw-text-sm">
                                <div className = "tw-flex tw-flex-row tw-gap-x-2 tw-items-center">
                                    <div className = "tw-w-3 tw-h-3 tw-rounded-sm" style={{backgroundColor: obj.color}}></div>
                                    <span className = "tw-text-gray-700">{obj.name}: {obj.value}</span>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}