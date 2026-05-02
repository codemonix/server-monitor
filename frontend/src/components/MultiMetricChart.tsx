import { Box, Typography } from "@mui/material";
import ReactEcharts from 'echarts-for-react';
import { useMemo, useRef } from "react";
import { useAppSelector } from "../redux/hooks.js";

export default function MultiMetricChart({ selected, chartData }) {
    const zoomRef = useRef({ start: 0, end: 100 });
    
    // Grab the global theme mode to pass into ECharts
    const themeMode = useAppSelector((state) => state.settings.themeMode);

    const series = useMemo(() => {
        if (!chartData) return [];

        const map = {
            cpu:     { label: "CPU %",       color: "#e53935", yAxisIndex: 0 },
            memory:  { label: "Memory %",    color: "#3b82f6", yAxisIndex: 0 },
            disk:    { label: "Disk %",      color: "#10b981", yAxisIndex: 0 },
            network: { label: "Network Kbps",color: "#fb8c00", yAxisIndex: 1 }, 
        };

        const formatSeriesData = (data) => 
            data ? data.map( item => [ item.x.getTime(), item.y]) : [];

        return Object.keys(map).map((key) => {
            const isSelected = selected[key];
            const config = map[key];

            return {
                name: config.label,
                type: 'line',
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: false,
                smooth: true,
                sampling: 'average',
                itemStyle: { color: config.color },
                yAxisIndex: config.yAxisIndex,
                data: isSelected ? formatSeriesData(chartData[key]) : [],
                emphasis: { focus: 'series', lineStyle: { width: 3 } }
            }
        });
    }, [selected, chartData]);

    const options = useMemo(() => {
        if (series.length === 0) return {};

        // Adjust text colors based on mode so axes are readable
        const textColor = themeMode === 'dark' ? '#94a3b8' : '#64748b';
        const splitLineColor = themeMode === 'dark' ? '#334155' : '#e2e8f0';

        return {
            animation: false,
            backgroundColor: 'transparent',
            dataZoom: [
                { type: 'slider', start: zoomRef.current.start, end: zoomRef.current.end },
                { type: 'inside' },
            ],
            tooltip: {
                trigger: 'axis',
                backgroundColor: themeMode === 'dark' ? '#1e293b' : '#ffffff',
                borderColor: splitLineColor,
                textStyle: { color: themeMode === 'dark' ? '#f1f5f9' : '#0f172a' },
                formatter: (params) => {
                    const date = new Date(params[0].value[0]);
                    let text = `<strong>${date.toLocaleTimeString()}</strong>`;
                    params.forEach((item) => {
                        if (item.value[1] !== undefined) {
                            text += `<br/>${item.marker} ${item.seriesName}: ${item.value[1]}`;
                        }
                    });
                    return text;
                },
            },
            legend: { bottom: 0, textStyle: { color: textColor } },
            grid: { top: '8%', left: '2%', right: '2%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'time',
                boundaryGap: false,
                axisLabel: { color: textColor },
                splitLine: { show: false }
            },
            yAxis: [
                {
                    type: "value",
                    min: 0,
                    max: 100,
                    axisLabel: { color: textColor },
                    splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
                },
                {
                    type: "value",
                    min: 0,
                    position: 'right',
                    axisLabel: { color: textColor },
                    splitLine: { show: false },
                }
            ],
            series
        };
    }, [series, themeMode]);

    const onEvents = {
        'dataZoom': (params) => {
            const { start, end } = params.batch ? params.batch[0] : params ;
            if (start !== undefined && end !== undefined) zoomRef.current = { start, end };
        }
    }

    const hasData =
        chartData &&
        Object.values(chartData as Record<string, unknown>).some(
            (arr) => Array.isArray(arr) && arr.length > 0
        );
    
    if (!hasData) {
        return (
            <Typography sx={{ p: 4, textAlign: 'center' }} variant="body2" color="text.secondary">
                Gathering telemetry data...
            </Typography>
        )
    }

    return (
        <Box sx={{ width: '100%', height: '100%' }}>
            <ReactEcharts 
                option={options}
                theme={themeMode === 'dark' ? 'dark' : undefined}
                notMerge={false}
                onEvents={onEvents}
                lazyUpdate={false}
                style={{ width: '100%', height: '100%' }}
            />
        </Box>
    );
}