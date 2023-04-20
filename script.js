import drawContours from './drawContours.js'

let width = window.innerWidth
let height = window.innerHeight

const clearBtn = document.querySelector('button')

const svg = d3
  .select('#map')
  // .attr('width', width)
  // .attr('height', height)
  .attr('viewBox', [0, 0, width, height])

// --------------------------------------------------------------
// Data Processing

Promise.all([
  d3.json('dataset/world-alpha3.json'),
  d3.json('dataset/states.json'),
  d3.csv('dataset/atlantic hurricane.csv'),
  d3.csv('dataset/Count_By_Year.csv'),
]).then(function (dataCollection) {
  // store the data in a variable
  const mapData = topojson.feature(
    dataCollection[0],
    dataCollection[0].objects.countries
  ).features
  const states = dataCollection[1]
  const statesInnerData = topojson.mesh(
    states,
    states.objects.states,
    (a, b) => a !== b
  )
  const statesOuterData = topojson.mesh(
    states,
    states.objects.states,
    (a, b) => a === b
  )
  const hurricaneData = dataCollection[2]

  // console.log('🚀 ~ file: script.js:19 ~ mapData:', mapData)
  // console.log('🚀 ~ file: script.js:21 ~ hurricaneData:', hurricaneData)

  // transform string in csv file into number
  hurricaneData.forEach(function (d) {
    d.Latitude = +d.Latitude
    d.Longtitude = +d.Longtitude
    d.MPH = +d.MPH
    // Year = d3.timeFormat("%Y");
    d.Year = +d.Year
  })
  console.log('🚀 ~ file: script.js:58 ~ urricaneData:', hurricaneData)

  const hurricaneGroupedByID = d3.groups(hurricaneData, (d) => d.ID)
  // .filter((d) => d[1].length > 50)

  let landfallData = []

  hurricaneGroupedByID.forEach((d) => {
    let ifLandfall = d[1].findIndex((d) => d.Event === 'L') // if there is no match values, it will return -1
    // console.log(ifLandfall)
    if (ifLandfall > 0) {
      // console.log(d)
      // console.log(d[1].slice(ifLandfall, d[1].length))
      landfallData.push(...d[1].slice(ifLandfall, d[1].length))
    }
  })
  const landfallMajorData = landfallData.filter(
    (d) => d.Category === '3' || d.Category === '4' || d.Category === '5'
  )
  console.log('🚀 ~ file: script.js:66 ~ landfallData:', landfallData)
  console.log('🚀 ~ file: script.js:63 ~ landfallMajorData:', landfallMajorData)

  const areaData = dataCollection[3]

  areaData.forEach(function (d) {
    d.Year = +d.Year
    d.Total = +d.Total
    d.Minor = +d.Minor
    d.Major = +d.Major
    d.Ocean = +d.Ocean
  })
  console.log('🚀 ~ file: script.js:75 ~ areaData:', areaData)
  // --------------------------------------------------------------
  // Base Map

  // set up projection
  const projection = d3
    .geoMercator()
    .fitSize([width, height], mapData)
    .translate([2350, 1250])
    .scale(1200)

  // generate path based on projection
  const path = d3.geoPath().projection(projection)

  // draw the base map
  const map = svg
    .append('g')
    .attr('class', 'mapPath')
    .selectAll('path')
    .data(mapData)
    .join('path')
    .attr('d', path)
    // .attr('fill', '#252525')
    .attr('fill', '#000000')
    .attr('vector-effect', 'non-scaling-stroke')
    .attr('stroke', '#999')
    .attr('stroke', '#454545')
    .attr('stroke-width', '0.4px')
    .attr('class', 'map')

  //US outer borders
  const statesOuter = svg
    .append('path')
    .datum(statesOuterData)
    .attr('class', 'outer')
    .attr('d', path)
    .attr('id', 'usOuter')
    .attr('stroke', 'whitesmoke')
    .attr('stroke', '#999999')
    .attr('stroke-width', 1)
  // .style('fill', 'white')

  // US inner borders
  const statesInner = svg
    .append('path')
    .datum(statesInnerData)
    .attr('class', 'inner')
    .attr('d', path)
    .attr('stroke', '#eeeeee')
    .attr('stroke-width', 0.5)
    .attr('stroke-opacity', 0.4)

  // US outer clip path
  svg
    .append('clipPath')
    .attr('id', 'usClipPath')
    .append('use')
    .attr('xlink:href', '#usOuter')

  // --------------------------------------------------------------
  // Draw Dots
  const drawDots = function ({ data, dotSize, fill = '#5a6aa0', opacity = 1 }) {
    const dots = svg
      .append('g')
      .attr('class', 'dataPoints')
      .attr('clip-path', 'url(#usClipPath)')
      .selectAll('circle')
      .data(data)
      .join(
        (enter) => enter.append('circle'),
        (exit) => exit.remove()
      )
      // .attr('transform', function (d) {
      //   return 'translate(' + projection([+d.Longtitude, +d.Latitude]) + ')'
      // })
      .attr('cx', (d) => projection([+d.Longtitude, +d.Latitude])[0])
      .attr('cy', (d) => projection([+d.Longtitude, +d.Latitude])[1])
      .attr('r', dotSize)
      .attr('fill', fill)
      .attr('opacity', opacity)

    return dots
  }
  // const dots = drawDots({
  //   data: landfallData,
  //   dotSize: 4,
  //   opacity: 0.5,
  //   fill: '#5a6aa0',
  // })
  const dots = drawDots({
    data: landfallMajorData,
    dotSize: 8,
    opacity: 0.5,
    fill: 'whitesmoke',
  })
  // --------------------------------------------------------------
  // Draw contours

  // const contours = drawContours({
  //   container: svg,
  //   width: width,
  //   height: height,
  //   projection: projection,
  //   data: landfallMajorData,
  //   bandwidth: 50,
  //   threshold: 50,
  // })

  // --------------------------------------------------------------
  // Brush

  const brushWidth = width
  const brushHeight = 80
  const yearDomainMax = d3.max(areaData, (d) => d.Year)
  console.log(yearDomainMax)
  const yearDomainMin = d3.min(areaData, (d) => d.Year)
  console.log(yearDomainMin)

  const brushSvg = d3
    .select('#brush')
    .append('svg')
    // .attr('width', brushWidth)
    // .attr('height', brushHeight)
    .attr('viewBox', [0, 0, brushWidth, brushHeight])
  // .attr('transform', 'translate(0,' + 20 + ')')
  // .append('g')

  const brushScale = d3
    .scaleLinear()
    .domain([yearDomainMin, yearDomainMax])
    .range([0, brushWidth])

  // the grids
  brushSvg
    .append('g')
    .attr('class', 'axis axis--grid')
    .attr('transform', 'translate(0,' + brushHeight + ')')
    .call(
      d3
        .axisBottom(brushScale)
        .ticks(20)
        .tickSize(-brushHeight)
        // .tickValues([1851,2015])
        .tickFormat(function () {
          return null
        })
    )
    .selectAll('.tick')
  // .classed("tick--minor", function(d) { return d.getHours(); });

  // ticks of the brush
  brushSvg
    .append('g')
    .attr('class', 'axis axis--x')
    .attr('transform', 'translate(0,' + brushHeight + ')')
    .call(
      d3
        .axisBottom(brushScale)
        .ticks(9)
        .tickValues([1860, 1930, 2010])
        .tickFormat(d3.format('d'))
        .tickSize(5)
        .tickPadding(0)
    )
    .attr('text-anchor', null)
    .style('font', '20')
    .selectAll('text')
    .attr('x', 5)

  // append label of x-axis
  brushSvg
    .append('text')
    .attr('class', 'axistext')
    .attr('text-anchor', 'end')
    .attr('x', 0)
    .attr('y', 167)
    .text('Year')
    .attr('text-anchor', 'start')

  // area chart
  const areaScaleX = d3
    .scaleLinear()
    .domain([d3.min(areaData, (d) => d.Year), d3.max(areaData, (d) => d.Year)])
    .range([0, brushWidth])

  const stack = d3.stack().keys(['Minor', 'Major'])

  const stackColor = ['#5185A1', '#C5284D']

  const stackedData = stack(areaData)
  console.log(stackedData)

  const areaScaleY = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
    .range([brushHeight, 0])

  const areaGenerator = d3
    .area()
    .curve(d3.curveCardinal)
    .x((d) => areaScaleX(d.data.Year))
    .y0((d) => areaScaleY(d[0]))
    .y1((d) => areaScaleY(d[1]))

  var area = brushSvg
    .selectAll('g.series')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', 'series')
  area
    .append('path')
    .style('fill', (d, i) => stackColor[i])
    .attr('d', (d) => areaGenerator(d))

  brushSvg
    .append('g')
    .attr('class', 'brush')
    .call(
      d3
        .brushX()
        .extent([
          [0, 0],
          [brushWidth, brushHeight],
        ])
        .on('start brush end', brushed)
    )

  // function brushed(event) {
  //   if (!d3.event.sourceEvent) return // Only transition after input.

  //   const sourceEvent = event.sourceEvent
  //   if (!d3.event.selection) return // Ignore empty selections.
  //   const selection = event.selection.map(brushScale.invert)

  //   console.log(parseInt(selection[0]))
  //   console.log(parseInt(selection[1]))
  //   let dataFiltered = dotdata.filter(function (d) {
  //     return (
  //       d.Year <= parseInt(selection[1]) && d.Year >= parseInt(selection[0])
  //     )
  //   })
  //   console.log(dataFiltered)
  //   dotsUpdate(dataFiltered)
  // }

  function brushed({ selection }) {
    if (selection !== null) {
      const [lowerBound, upperBound] = selection.map(brushScale.invert)
      // console.log(lowerBound, parseInt(lowerBound))
      // console.log(upperBound, parseInt(upperBound))
      let dataFiltered = landfallMajorData.filter(function (d) {
        return d.Year <= parseInt(upperBound) && d.Year >= parseInt(lowerBound)
      })
      // console.log(dataFiltered)
      dotsUpdate(dataFiltered)
    }
  }

  function dotsUpdate(data) {
    // dots
    //   .enter()
    //   .append('circle')
    //   // .transition()
    //   .attr('transform', function (d) {
    //     return 'translate(' + projection([+d.Longtitude, +d.Latitude]) + ')'
    //   })
    //   .attr('fill', '#5a6aa0')
    //   .attr('r', 6)

    const dots = svg
      // .append('g')
      // .attr('class', 'dataPoints')
      .selectAll('circle')
      .data(data)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('cx', (d) => projection([+d.Longtitude, +d.Latitude])[0])
            .attr('cy', (d) => projection([+d.Longtitude, +d.Latitude])[1])
            .attr('r', 8)
            .attr('fill', 'whitesmoke')
            .attr('opacity', 0.5)
            .attr('clip-path', 'url(#usClipPath)'),
        (update) => update,
        (exit) => exit.transition().duration(200).remove()
      )

    //   .attr('cx', (d) => projection([+d.Longtitude, +d.Latitude])[0])
    //   .attr('cy', (d) => projection([+d.Longtitude, +d.Latitude])[1])
    //   .attr('r', 8)
    //   .attr('fill', 'whitesmoke')
    //   .attr('opacity', 0.5)
    //   .attr('clip-path', 'url(#usClipPath)')

    // dots
    //   .exit()
    //   // .transition()
    //   .remove()
    return dots
  }

  // --------------------------------------------------------------
  // Line Animation

  const strokeWidthScale = d3
    .scaleOrdinal()
    .domain(['0', '1', '2', '3', '4', '5'])
    .range(['1px', '5px', '10px', '15px', '20px', '25px'])

  const strokeColorScale = d3
    .scaleOrdinal()
    .domain(['0', '1', '2', '3', '4', '5'])
    .range(['#5185A1', '#5185A1', '#5185A1', '#C5284D', '#C5284D', '#C5284D'])

  const lineProjection = d3
    .line()
    .x((d) => projection([d.Longtitude, d.Latitude])[0])
    .y((d) => projection([d.Longtitude, d.Latitude])[1])
    .curve(d3.curveBasis)

  dots
    // hover to show the path
    .on('mouseover', function (e, d) {
      let id = d
      let thisPath = hurricaneGroupedByID.find((d) => d[0] === id.ID)
      let singleTrack = svg
        .append('g')
        .attr('class', 'hurricanePath')
        .selectAll('path')
        .data(thisPath[1])
        .join('path')
        .attr('d', lineProjection(thisPath[1]))
        .attr('fill', 'none')
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('stroke', '#5185A1')
        .attr('stroke-width', '1px')
        .attr('stroke-opacity', 0.05)

      dots.attr('opacity', 0.1)
      d3.select(this).attr('opacity', 1).raise()
    })
    // remove the highlighting effects
    .on('mouseout', function () {
      d3.selectAll('.hurricanePath').attr('stroke-opacity', 0).remove() // remove paths

      dots.attr('opacity', 1)
    })
    // click to animate the path
    .on('click', function (e, d) {
      let id = d
      // retrieve all the data point on a single path based on the select point
      let thisPath = hurricaneGroupedByID.find((d) => d[0] === id.ID)
      // console.log(thisPath[1])
      // console.log(lineProjection(thisPath[1]))
      // console.log(thisPath[1].Category)

      // // ---
      // // version 1
      // // all the parts start to animate at the same time
      // // ---
      // for (let i = 0; i < thisPath[1].length - 1; i++) {
      //   let dotPair = thisPath[1].slice(i, i + 2)
      //   let singleTrack = svg
      //     .append('g')
      //     .attr('class', 'hurricanePathAnimation')
      //     .selectAll('path')
      //     .data(dotPair)
      //     .join('path')
      //     .attr('d', lineProjection(dotPair))
      //     .attr('fill', 'none')
      //     .attr('vector-effect', 'non-scaling-stroke')
      //     .attr('stroke', '#C5284D')
      //     .attr('stroke-width', (d) => {
      //       console.log(d)
      //       return strokeWidthScale(d.Category)
      //     })

      //   let length = singleTrack.node().getTotalLength()
      //   singleTrack
      //     .attr('stroke-dasharray', length + ' ' + length)
      //     .attr('stroke-dashoffset', length)
      //     .transition()
      //     .ease(d3.easeLinear)
      //     .attr('stroke-dashoffset', 0)
      //     // .duration(3000)
      //     // total duration based on the length of the array
      //     .duration(500)
      // }

      // // ---
      // // version 2
      // // setTimeout doesn't help
      // // ---
      // for (let i = 0; i < thisPath[1].length - 1; i++) {
      //   setTimeout(() => {
      //     let dotPair = thisPath[1].slice(i, i + 2)
      //     let singleTrack = svg
      //       .append('g')
      //       .attr('class', 'hurricanePathAnimation')
      //       .selectAll('path')
      //       .data(dotPair)
      //       .join('path')
      //       .attr('d', lineProjection(dotPair))
      //       .attr('fill', 'none')
      //       .attr('vector-effect', 'non-scaling-stroke')
      //       .attr('stroke', '#C5284D')
      //       .attr('stroke-width', (d) => {
      //         console.log(d)
      //         return strokeWidthScale(d.Category)
      //       })

      //     let length = singleTrack.node().getTotalLength()
      //     singleTrack
      //       .attr('stroke-dasharray', length + ' ' + length)
      //       .attr('stroke-dashoffset', length)
      //       .transition()
      //       .ease(d3.easeLinear)
      //       .attr('stroke-dashoffset', 0)
      //       // .duration(3000)
      //       // total duration based on the length of the array
      //       .duration(500)
      //   }, 1000)
      // }

      // ---
      // version 3 (final)
      // ---
      function delay(ms) {
        return new Promise((res) => {
          setTimeout(() => {
            res('')
          }, ms)
        })
      }

      async function delayIteration() {
        for (let i = 0; i < thisPath[1].length - 1; i++) {
          // add time delay to every iteration
          await delay(500)

          let dotPair = thisPath[1].slice(i, i + 2)

          // create path
          let singleTrack = svg
            .append('g')
            .attr('class', 'hurricanePathAnimation')
            .selectAll('path')
            .data(dotPair)
            .join('path')
            .attr('d', lineProjection(dotPair))
            .attr('fill', 'none')
            .attr('vector-effect', 'non-scaling-stroke')
            // .attr('stroke', '#C5284D')
            .attr('stroke', (d) => strokeColorScale(d.Category))
            .attr('stroke-width', (d) => strokeWidthScale(d.Category))
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')

          // animate path
          let length = singleTrack.node().getTotalLength()
          singleTrack
            .attr('stroke-dasharray', length + ' ' + length)
            .attr('stroke-dashoffset', length)
            .transition()
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            // .duration(3000)
            // total duration based on the length of the array
            .duration(500)
        }
      }

      delayIteration()

      // // Create path
      // let singleTrack = svg
      //   .append('g')
      //   .attr('class', 'hurricanePathAnimation')
      //   .selectAll('path')
      //   .data(thisPath[1])
      //   .join('path')
      //   .attr('d', lineProjection(thisPath[1]))
      //   .attr('fill', 'none')
      //   .attr('vector-effect', 'non-scaling-stroke')
      //   .attr('stroke', '#C5284D')
      //   .attr('stroke-width', (d) => {
      //     console.log(d)
      //     return strokeWidthScale(d.Category)
      //   })

      // // Animate path
      // let length = singleTrack.node().getTotalLength()
      // singleTrack
      //   .attr('stroke-dasharray', length + ' ' + length)
      //   .attr('stroke-dashoffset', length)
      //   .transition()
      //   .ease(d3.easeLinear)
      //   .attr('stroke-dashoffset', 0)
      //   // .duration(3000)
      //   // total duration based on the length of the array
      //   .duration(thisPath[1].length * 500)
    })

  clearBtn.addEventListener('click', function (e, d) {
    d3.selectAll('.hurricanePathAnimation')
      .transition()
      .ease(d3.easeSinOut)
      .duration(100)
      .style('stroke-opacity', 0)
      .transition()
      .duration(200)
      .remove() // remove paths
  })

  // --------------------------------------------------------------
  // Zoom
  // svg.call(
  //   d3
  //     .zoom()
  //     .extent([
  //       [0, 0],
  //       [width, height],
  //     ])
  //     .scaleExtent([1, 4])
  //     .on('zoom', zoomed)
  // )

  // function zoomed({ transform }) {
  //   map.attr('transform', transform)
  //   statesOuter.attr('transform', transform)
  //   statesInner.attr('transform', transform)
  //   // dots.attr('transform', transform)
  //   contours.attr('transform', transform)
  // }
  // --------------------------------------------------------------
})
