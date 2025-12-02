import React from "react"
import { Cell, ResponsiveContainer, PieChart, Pie } from "recharts"
import { PieChartItem } from "../../types/common"

interface Props {
    data: Array<PieChartItem>
    total: number
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
                    </PieChart>
                </ResponsiveContainer>
                <div className="tw-absolute tw-inset-0 tw-flex tw-flex-col tw-items-center tw-justify-center">
                    <div className="tw-text-4xl tw-font-bold">{total}</div>
                    <div className="tw-text-sm tw-text-gray-600">Total work item...</div>
                </div>
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