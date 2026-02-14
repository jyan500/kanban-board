import { PieChart, Pie } from 'recharts'

export const TestPie = () => {
    return (
        <div style={{ width: 300, height: 300, border: '2px solid red' }}>
            <PieChart width={300} height={300}>
                <Pie 
                    data={[
                        { name: 'A', value: 400 },
                        { name: 'B', value: 300 },
                    ]} 
                    dataKey="value"
                    cx={150}
                    cy={150}
                    outerRadius={80}
                    fill="#8884d8"
                />
            </PieChart>
        </div>
    )
}