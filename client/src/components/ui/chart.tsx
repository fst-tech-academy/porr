"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "../../lib/utils"

// Re-export all recharts primitives
export const Area = RechartsPrimitive.Area
export const AreaChart = RechartsPrimitive.AreaChart
export const Bar = RechartsPrimitive.Bar
export const BarChart = RechartsPrimitive.BarChart
export const CartesianGrid = RechartsPrimitive.CartesianGrid
export const Cell = RechartsPrimitive.Cell
export const ComposedChart = RechartsPrimitive.ComposedChart
export const Curve = RechartsPrimitive.Curve
export const Dot = RechartsPrimitive.Dot
export const Funnel = RechartsPrimitive.Funnel
export const FunnelChart = RechartsPrimitive.FunnelChart
export const Label = RechartsPrimitive.Label
export const LabelList = RechartsPrimitive.LabelList
export const Legend = RechartsPrimitive.Legend
export const Line = RechartsPrimitive.Line
export const LineChart = RechartsPrimitive.LineChart
export const Pie = RechartsPrimitive.Pie
export const PieChart = RechartsPrimitive.PieChart
export const PolarAngleAxis = RechartsPrimitive.PolarAngleAxis
export const PolarGrid = RechartsPrimitive.PolarGrid
export const PolarRadiusAxis = RechartsPrimitive.PolarRadiusAxis
export const Radar = RechartsPrimitive.Radar
export const RadarChart = RechartsPrimitive.RadarChart
export const RadialBar = RechartsPrimitive.RadialBar
export const RadialBarChart = RechartsPrimitive.RadialBarChart
export const Rectangle = RechartsPrimitive.Rectangle
export const ReferenceArea = RechartsPrimitive.ReferenceArea
export const ReferenceDot = RechartsPrimitive.ReferenceDot
export const ReferenceLine = RechartsPrimitive.ReferenceLine
export const ResponsiveContainer = RechartsPrimitive.ResponsiveContainer
export const Scatter = RechartsPrimitive.Scatter
export const ScatterChart = RechartsPrimitive.ScatterChart
export const Sector = RechartsPrimitive.Sector
export const Surface = RechartsPrimitive.Surface
export const Tooltip = RechartsPrimitive.Tooltip
export const XAxis = RechartsPrimitive.XAxis
export const YAxis = RechartsPrimitive.YAxis
export const ZAxis = RechartsPrimitive.ZAxis

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, any>
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      {children}
    </div>
  )
})
ChartContainer.displayName = "Chart"

// Chart style component
const ChartStyle = ({ id, config }: { id: string; config: Record<string, any> }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([_, config]) => config.theme || config.color)
          .map(([key, itemConfig]) => {
            const color = itemConfig.color || itemConfig.theme?.color
            return color
              ? `.${id} [data-${key}] { color: hsl(var(--${color})) }`
              : null
          })
          .join("\n"),
      }}
    />
  )
}

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: "line" | "dot" | "dashed"
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || "value"}`
      const value =
        typeof label === "string"
          ? label
          : labelFormatter
          ? labelFormatter(label, payload)
          : key

      return value
    }, [label, labelFormatter, payload, hideLabel, labelKey])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!hideLabel && tooltipLabel && (
          <div className={cn("font-medium", labelClassName)}>
            {tooltipLabel}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const indicatorColor = color || item.payload?.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {!hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        hideIndicator ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        <div className="text-muted-foreground">
                          {key}
                        </div>
                      </div>
                      {item.value && (
                        <div className="font-mono font-medium tabular-nums text-foreground">
                          {item.value}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Chart legend component
const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(
  ({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    if (!payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
      >
        {payload.map((item) => {
          const key = `${nameKey || item.dataKey || "value"}`

          return (
            <div
              key={item.value}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {!hideIcon && (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}
              {key}
            </div>
          )
        })}
      </div>
    )
  }
)
ChartLegend.displayName = "ChartLegend"

export {
  ChartContainer,
  ChartTooltipContent,
  ChartLegend,
}

