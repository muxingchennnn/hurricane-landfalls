const drawDots = function ({
  container,
  projection,
  data,
  size,
  fill = 'whitesmoke',
  opacity = 1,
}) {
  const dots = container
    .append('g')
    .attr('class', 'dots')
    .attr('clip-path', 'url(#usClipPath)')
    .selectAll('circle')
    .data(data)
    .join('circle')
    // .attr('transform', function (d) {
    //   return 'translate(' + projection([+d.Longtitude, +d.Latitude]) + ')'
    // })
    .attr('cx', (d) => projection([+d.Longtitude, +d.Latitude])[0])
    .attr('cy', (d) => projection([+d.Longtitude, +d.Latitude])[1])
    .attr('r', size)
    .attr('fill', fill)
    .attr('opacity', opacity)

  return dots
}

export default drawDots
