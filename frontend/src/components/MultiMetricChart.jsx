import { Paper, Typography  } from "@mui/material";
import ReactEcharts from 'echarts-for-react';
import { useMemo, useRef } from "react";

export default function MultiMetricChart({ title, selected, chartData }) {

    console.log("MultiMetricChart.jsc -> chartData:", chartData)
    console.log("MultiMetricChart.jsx -> title:", title);

    const zoomRef = useRef({ start: 0, end: 100 });

    
    const series = useMemo(() => {

        console.log("MultiMetricChart.jsx -> selected:", selected);
        console.log("MultiMetricChart.jsx -> chartData:", chartData);

        if (!chartData) return [];


        const map = {
            cpu:     { label: "CPU %",       color: "#e53935", yAxisIndex: 0 },
            memory:  { label: "Memory %",    color: "#1e88e5", yAxisIndex: 0 },
            disk:    { label: "Disk %",      color: "#43a047", yAxisIndex: 0 },
            network: { label: "Network Kbps",color: "#fb8c00", yAxisIndex: 1 }, 
        };

        const formatSeriesData = (data) => 
            data ? data.map( item => [ item.x.getTime(), item.y]) : [] ;

        return Object.keys(map)
            .map((key) => {
                const isSelected = selected[key];
                const config = map[key];

                return {
                    name: config.label,
                    type: 'line',
                    // symbol: 'none',
                    symbol: 'circle',
                    symbolSize: 8,
                    showSymbol: false,
                    smooth: true,
                    sampling: 'average',
                    itemStyle: { color: config.color },
                    yAxisIndex: config.yAxisIndex,
                    data: isSelected ?  formatSeriesData(chartData[key]) : [],
                    emphasise: {
                        focus: 'series',
                        lineStyle: { width: 3 }
                    }
                }
            });
    },[selected, chartData]);

    const options = useMemo(() => {

        console.log("MultiMetricChart.jsx -> options -> series:", series);


        if (series.length === 0) {
            return { title: { text: "Loading...", left: 'center' } };
        }

        return {
            animation: false,

            dataZoom: [
                {
                    type: 'slider',
                    start: zoomRef.current.start,
                    end: zoomRef.current.end
                },
                {
                    type: 'inside',
                },
            ],
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const date = new Date(params[0].value[0]);
                    let text = date.toLocaleString();

                    params.forEach((item) => {
                        if (item.value[1] !== undefined) {
                            text += `<br/>${item.marker} ${item.seriesName}: ${item.value[1]}`;
                        }
                    });
                    return text;
                },
            },

            legend: {
                bottom: 0,
            },

            grid: {
                top: '5%',
                left: '3%',
                right: '4%',
                bottom: '15%',
                containLabel: true,
            },

            xAxis: {
                type: 'time',
                boundryGap: false,
                axisLabel: {
                    hideOverlap: true,
                    formatter: (value) => {
                        const date = new Date(value);

                        const dateStr = date.toLocaleDateString("en-US", {
                            month: 'numeric',
                            day: 'numeric'
                        });

                        const timeStr = date.toLocaleTimeString("en-US", {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                        })


                        return `${dateStr}\n${timeStr}`;
                    },
                    lineHeight: 15,
                    fontSize: 11
                },
            },
            yAxis: [
                {
                    type: "value",
                    min: 0,
                    max: 100,
                    splitline: { show: false },

                },
                {
                    type: "value",
                    min: 0,
                    // max: 5400,
                    position: 'right',

                }
            ],
            series
        };
    },[series]);

    const onEvents = {
        'dataZoom': (params) => {
            const { start, end } = params.batch ? params.batch[0] : params ;
            if (start !== undefined && end !== undefined) {
                zoomRef.current = { start, end };
            }
        }
    }

    const hasData = chartData && Object.values(chartData).some(arr => arr && arr.length > 0);
    console.log("MultiMetricChart.jsx -> hasData:", hasData);
    if (!hasData) {
        return (
            // { title: { text: "No Metrics Selected", left: 'center' } }
            <Typography sx={{ p: 2, textAlign: 'center'}} variant="body2" >
                No Data Available. 
            </Typography>
        )
    }



    return (
        <Paper sx={{ mb: 1 }} >
            {/* <Typography variant="subtitle2" mb={1} >
                {title}
            </Typography> */}
            <ReactEcharts 
                option={options}
                notMerge={false}
                onEvents={onEvents}
                lazyUpdate={false}
                style={{ width: '100%', height: '300px' }}
            />
        </Paper>
    );
}