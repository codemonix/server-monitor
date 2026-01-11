import { Paper, Typography, Box} from "@mui/material";
import ReactEcharts from 'echarts-for-react';
import { useMemo } from "react";

export default function MultiMetricChart({ title, selected, chartData }) {

    console.log("MultiMetricChart.jsc -> chartData:", chartData)
    console.log("MultiMetricChart.jsx -> title:", title);

    
    const series = useMemo(() => {

        console.log("MultiMetricChart.jsx -> selected:", selected);
        console.log("MultiMetricChart.jsx -> chartData:", chartData);

        if (!chartData || !chartData.cpu || chartData.cpu.length === 0) {
            return [];
        }

    const map = {
        cpu:     { label: "CPU %",       color: "#e53935", yAxisIndex: 0 },
        memory:  { label: "Memory %",    color: "#1e88e5", yAxisIndex: 0 },
        disk:    { label: "Disk %",      color: "#43a047", yAxisIndex: 0 },
        network: { label: "Network Kbps",color: "#fb8c00", yAxisIndex: 1 }, 
    };

        const formatSeriesData = (data) => 
            data.map( item => [ item.x.getTime(), item.y]);

        return Object.keys(selected)
            .filter((key) => selected[key])
            .map((key) => ({
                name: map[key].label,
                type: 'line',
                symbol: 'none',
                smooth: true,
                sampling: 'average',
                itemStyle: { color: map[key].color },
                yAxisIndex: map[key].yAxisIndex,
                data: formatSeriesData(chartData[key]),
                emphasis: { focus: "series" },
            }));
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
                    start: 0,
                    end: 100,
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
                        text += `<br/>${item.marker} ${item.seriesName}: ${item.value[1]}`;
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
                axisLabel: {
                    formatter: (value) => {
                        const date = new Date(value);
                        return (
                            date
                                .toLocaleString("en-US", {
                                    month: '2-digit',
                                    day: '2-digit',
                                })
                                .replace(/\//g, '-') + 
                                "\n" + 
                                date.toLocaleTimeString("en-US", {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })
                        );
                    },
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
                    max: 5400,
                    position: 'right',

                }
            ],


            series
        };
    },[series]);


    if (series.length === 0) {
        return (
            <Typography sx={{ p: 2, textAlign: 'center'}} variant="body2" >
                No Data Available
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
                lazyUpdate={false}
                style={{ width: '100%', height: '300px' }}
            />
        </Paper>
    );
}