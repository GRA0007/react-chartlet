import { useContext } from 'react'
import { ChartletContext } from '../components/Chartlet'
import ChartSVG from '../components/ChartSVG'
import { ChartColor, GenericChartProps, SeriesProps } from '../types/charts'
import { CATEGORICAL } from '../utils/colors'
import { invertListOfPairsOrRecord } from '../utils/data'
import { makeAlignmentFunctions } from '../utils/layout'

export interface LineChartProps extends GenericChartProps, SeriesProps {
  pathStyle?: React.CSSProperties,
  pathStyles?: React.CSSProperties[],
  colors?: ChartColor[],
}

const LineChart: React.FC<LineChartProps> = ({
  series,
  width,
  height,
  colors=CATEGORICAL,
  pathStyle={},
  pathStyles=[],
  ...props
}) => {
  // Resolve dimensions
  const { autoWidth, autoHeight } = useContext(ChartletContext)
  width = width ?? autoWidth
  height = height ?? autoHeight

  // Check data source
  if (!series)
    throw new Error('Bad data argument: expected series')

  // Resolve categories/groups
  const seriesPositions = series.map(points => invertListOfPairsOrRecord(points))

  // Determine element positions
  const xValues = seriesPositions.map(([xPoints, _]) => xPoints).flat(1)
  const yValues = seriesPositions.map(([_, yPoints]) => yPoints).flat(1)
  const [getXPos, getYPos] = makeAlignmentFunctions(xValues, yValues,
    { distribute: false },
    { distribute: false, reverse: true }
  )

  // Create points
  const seriesPoints = seriesPositions.map(([xValues, yValues]) =>
    xValues
      .sort((x1, x2) => x1 - x2)
      .map((_, i) => ({ x: getXPos(xValues[i], width), y: getYPos(yValues[i], height)}))
  )

  // Generate svg path data
  const seriesPathData = seriesPoints.map(points =>
    points
      .map(({ x, y }, i) =>`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
      .join(' ')
  )

  return <ChartSVG width={width} height={height} {...props}>
    {seriesPathData.map((pathData, i) =>
      <path
        d={pathData}
        fill='none'
        stroke={colors[i]}
        strokeWidth={3}
        strokeLinejoin='round'
        strokeLinecap='round'
        style={{...pathStyle, ...pathStyles?.[i] ?? {}}}
      />
    )}
  </ChartSVG>
}

export default LineChart
