const drawContours = function ({
  data,
  width,
  height,
  bandwidth = 20,
  threshold = 20,
  projection,
  container,
}) {
  const contoursData = d3
    .contourDensity()
    .x((d) => projection([+d.Longtitude, +d.Latitude])[0])
    .y((d) => projection([+d.Longtitude, +d.Latitude])[1])
    // .weight((d) => pop_new(+d.POPULATION))
    .size([width, height])
    .bandwidth(bandwidth)
    .thresholds(threshold)(data)

  console.log('🚀 ~ file: script.js:120 ~ contoursData:', contoursData)

  const colorScale = d3
    .scaleOrdinal()
    .domain(contoursData.map((d) => d.value))
    .range(
      d3.quantize(
        d3.interpolatePurples,
        contoursData.map((d) => d.value).length
      )
    )

  const contours = container
    .append('g')
    .attr('class', 'dataPoints')
    .attr('clip-path', 'url(#usClipPath)')
    .attr('fill', 'none')
    .selectAll('path')
    .data(contoursData)
    .join('path')
    .attr('d', d3.geoPath())
    .attr('stroke', 'white')
    .attr('opacity', 1)
    .attr('fill', (d) => colorScale(d.value))
    .attr('opacity', 0.1)

  return contours
}

export default drawContours
