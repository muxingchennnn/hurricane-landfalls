import drawDots from './drawDots.js'
import drawContours from './drawContours.js'

const width = window.innerWidth
const height = window.innerHeight
const svg = d3.select('#map').attr('viewBox', [0, 0, width, height])

// --------------------------------------------------------------
// Data Processing

Promise.all([
  d3.json('dataset/world-alpha3.json'),
  d3.json('dataset/US.json'),
  d3.csv('dataset/atlantic hurricane.csv'),
  d3.csv('dataset/hurricane count by year.csv'),
]).then(function (dataCollection) {
  // data for base map
  const mapData = topojson.feature(
    dataCollection[0],
    dataCollection[0].objects.countries
  ).features

  // data for clip path
  const us = dataCollection[1]
  const usInnerData = topojson.mesh(us, us.objects.states, (a, b) => a !== b)
  const usOuterData = topojson.mesh(us, us.objects.states, (a, b) => a === b)

  const hurricaneData = dataCollection[2]
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

  // gather hurricane landfall data
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

  // data for area chart
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
  const usOuter = svg
    .append('g')
    .attr('class', 'usOuter')
    .append('path')
    .datum(usOuterData)
    .attr('class', 'outer')
    .attr('d', path)
    .attr('id', 'usOuter')
    .attr('stroke', 'whitesmoke')
    .attr('stroke', '#999999')
    .attr('stroke-width', 1)
  // .style('fill', 'white')

  // US inner borders
  const usInner = svg
    .append('g')
    .attr('class', 'usInner')
    .append('path')
    .datum(usInnerData)
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
  // Brush

  const brushWidth = width
  const brushHeight = window.innerHeight * 0.11
  const yearDomainMin = d3.min(areaData, (d) => d.Year)
  const yearDomainMax = d3.max(areaData, (d) => d.Year)
  // const defaultExtent = [yearDomainMin, yearDomainMax]

  const brushSvg = d3
    .select('#brush')
    .append('svg')
    .attr('viewBox', [0, 0, brushWidth, brushHeight])

  const brushScale = d3
    .scaleLinear()
    .domain([yearDomainMin, yearDomainMax])
    .range([0, brushWidth])

  // the line on the left
  brushSvg
    .append('g')
    .attr('class', 'brush-grid-left')
    // x+ to right y+ to bottom
    .attr('transform', `translate(0,  ${brushHeight} )`)
    .call(
      d3
        .axisTop(brushScale)
        .ticks(1)
        .tickValues([yearDomainMin])
        .tickFormat(d3.format('d'))
        .tickSize(brushHeight - 20) // length of the tick mark
        .tickPadding(10)
      // .tickValues([1851, 2017])
      // .tickFormat(function () {
      //   return null
      // })
    )
    .attr('text-anchor', 'start')
    .call((g) => g.select('.domain').remove())

  // the line on the right
  brushSvg
    .append('g')
    .attr('class', 'brush-grid-right')
    // x+ to right y+ to bottom
    .attr('transform', `translate(-1,  ${brushHeight} )`)
    .call(
      d3
        .axisTop(brushScale)
        .ticks(1)
        .tickValues([yearDomainMax])
        .tickFormat(d3.format('d'))
        .tickSize(brushHeight - 20) // length of the tick mark
        .tickPadding(10)
      // .tickValues([1851, 2017])
      // .tickFormat(function () {
      //   return null
      // })
    )
    .attr('text-anchor', 'end')
    .call((g) => g.select('.domain').remove())

  // ticks of the brush
  brushSvg
    .append('g')
    .attr('class', 'brush-xAxis')
    .attr('transform', `translate(0,  20)`)
    .call(
      d3
        .axisTop(brushScale)
        .ticks(8)
        .tickValues([1870, 1890, 1910, 1930, 1950, 1970, 1990])
        // .tickSize(-5)
        .tickFormat(d3.format('d'))
        .tickSize(-5)
        .tickPadding(10)
    )
    .call((g) => g.select('.domain').remove())
    .attr('text-anchor', 'middle')
    // .style('font', '20')
    .selectAll('text')
    .attr('x', 0)

  // // append label of y-axis
  // brushSvg
  //   .append('text')
  //   .attr('class', 'brush-yAxis-label')
  //   .attr('x', 10)
  //   .attr('y', 10)
  //   .text('Year')
  //   .attr('text-anchor', 'start')

  // area chart

  // data processing for area chart
  const stack = d3.stack().keys(['Minor', 'Major'])
  const stackColor = ['#5185A1', '#C5284D']
  const stackedData = stack(areaData)
  const areaHeight = brushHeight - 30

  // area chart scales
  const areaScaleX = brushScale
  const areaScaleY = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData[stackedData.length - 1], (d) => d[1])])
    .range([areaHeight, 0])

  const areaGenerator = d3
    .area()
    .curve(d3.curveCardinal)
    .x((d) => areaScaleX(d.data.Year))
    .y0((d) => areaScaleY(d[0]))
    .y1((d) => areaScaleY(d[1]))

  const area = brushSvg
    .selectAll('g.series')
    .data(stackedData)
    .enter()
    .append('g')
    .attr('class', 'series')
    .attr('transform', `translate(0, ${brushHeight - areaHeight} )`)

  area
    .append('path')
    .style('fill', (d, i) => stackColor[i])
    .attr('d', (d) => areaGenerator(d))

  // --------------------------------------------------------------
  // Interactions

  // scale for width of the paths
  const strokeWidthScale = d3
    .scaleOrdinal()
    .domain(['0', '1', '2', '3', '4', '5'])
    .range(['1px', '4px', '7px', '10px', '15px', '20px'])

  // scale for color of the paths
  const strokeColorScale = d3
    .scaleOrdinal()
    .domain(['0', '1', '2', '3', '4', '5'])
    .range(['#5185A1', '#5185A1', '#5185A1', '#C5284D', '#C5284D', '#C5284D'])

  // projection for the paths
  const lineProjection = d3
    .line()
    .x((d) => projection([d.Longtitude, d.Latitude])[0])
    .y((d) => projection([d.Longtitude, d.Latitude])[1])
    .curve(d3.curveBasis)

  // hover effect
  function mouseover(e, d) {
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
  }

  function mouseout(e, d) {
    d3.selectAll('.hurricanePath').attr('stroke-opacity', 0).remove() // remove paths
    dots.attr('opacity', 1)
  }

  // path animation
  function click(e, d) {
    // retrieve all the data point on a single path based on the select point
    let id = d
    let thisPath = hurricaneGroupedByID.find((d) => d[0] === id.ID)

    const delayBetweenIteration = function (ms) {
      return new Promise((res) => {
        setTimeout(() => {
          res('')
        }, ms)
      })
    }

    async function pathAnimation() {
      console.log(animationSpeedState)
      for (let i = 0; i < thisPath[1].length - 1; i++) {
        // add time delay between iterations
        if (!clearState) {
          await delayBetweenIteration(animationSpeedState)

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
            .duration(animationSpeedState)
        } else {
          clearState = false
          break
        }
      }
    }

    pathAnimation({})
  }

  // initialize the state of variables
  let dataState = landfallMajorData
  let encodingState = 'dots'
  let dataPointer = 'major'
  let dotSizeState = 8
  let dotOpacityState = 0.5
  let contourBandwidthState = 50
  let contourThresholdState = 50
  let animationSpeedState = 200
  let clearState = false

  // clicking the data input radio button
  d3.selectAll("input[name='data-source1']").on('change', function () {
    dataPointer = d3
      .select('input[name="data-source1"]:checked')
      .property('value')
    const data = dataPointer === 'major' ? landfallMajorData : landfallData

    state({ data: data })
  })

  // clicking the encoding radio button and show/hide parameters of the encoding
  d3.selectAll("input[name='encoding']").on('change', function () {
    const encoding = d3
      .select('input[name="encoding"]:checked')
      .property('value')

    document
      .querySelectorAll('.parameter')
      .forEach((d) => (d.style.display = 'none'))

    document
      .querySelectorAll(`.parameter-${encoding}`)
      .forEach((d) => (d.style.display = 'block'))

    state({
      encoding: encoding,
    })
  })

  // input of dot size
  d3.select('#sizeSlider').on('change', function () {
    const size = this.value
    state({ dotSize: size })
  })

  // input of dot opacity
  d3.select('#opacitySlider').on('change', function () {
    const opacity = this.value
    state({ dotOpacity: opacity })
  })

  // input of contour bandwidth
  d3.select('#bandwidthSlider').on('change', function () {
    const bandwidth = this.value
    state({ contourBandwidth: bandwidth })
  })

  // input of contour threshold
  d3.select('#thresholdSlider').on('change', function () {
    const threshold = this.value
    state({ contourThreshold: threshold })
  })

  // input of animation speed
  d3.select('#speedSlider').on('change', function () {
    const speed = this.value
    state({ animationSpeed: speed })
  })

  // button of clearing paths
  const clearBtn = document.querySelector('button')
  // clearBtn.addEventListener('click', function (e, d) {
  //   clearState = true
  //   setTimeout(() => {
  //     d3.selectAll('.hurricanePathAnimation')
  //       .transition()
  //       .ease(d3.easeSinOut)
  //       .duration(100)
  //       .style('stroke-opacity', 0)
  //       .transition()
  //       .duration(200)
  //       .remove() // remove paths
  //   }, animationSpeedState)
  // })

  clearBtn.addEventListener('click', clearPaths)

  function clearPaths() {
    clearState = true
    setTimeout(() => {
      d3.selectAll('.hurricanePathAnimation')
        .transition()
        .ease(d3.easeSinOut)
        .duration(100)
        .style('stroke-opacity', 0)
        .transition()
        .duration(200)
        .remove() // remove paths
    }, animationSpeedState)
  }

  // set up the brush
  const brush = d3
    .brushX()
    .extent([
      [0, 0],
      [brushWidth, areaHeight],
    ])
    .on('start brush end', brushed)

  brushSvg
    .append('g')
    .attr('class', 'brush')
    .attr('transform', `translate(0, ${brushHeight - areaHeight} )`)
    .call(brush)
    .on('dblclick', dblclicked)
  // .call(brush.move, defaultExtent)

  // brush behaviour
  function brushed({ sourceEvent, selection }) {
    const data = dataPointer === 'major' ? landfallMajorData : landfallData
    if (!sourceEvent) return
    if (selection !== null) {
      const [lowerBound, upperBound] = selection.map(brushScale.invert)
      // console.log(lowerBound, parseInt(lowerBound))
      // console.log(upperBound, parseInt(upperBound))
      const dataBrushed = data.filter(function (d) {
        return d.Year <= parseInt(upperBound) && d.Year >= parseInt(lowerBound)
      })
      console.log(dataBrushed)
      // console.log(dataState)
      state({ data: dataBrushed })
    }
  }

  // double click brush behavior
  function dblclicked() {
    const selection = d3.brushSelection(this) ? null : brushScale.range()
    const data = dataPointer === 'major' ? landfallMajorData : landfallData
    d3.select(this).call(brush.move, selection)
    const [lowerBound, upperBound] = selection.map(brushScale.invert)
    const dataBrushed = data.filter(function (d) {
      return d.Year <= parseInt(upperBound) && d.Year >= parseInt(lowerBound)
    })
    state({ data: dataBrushed })
  }

  // update the state of varaibles and the visualization
  function state({
    data,
    encoding,
    dotSize,
    dotOpacity,
    contourBandwidth,
    contourThreshold,
    animationSpeed,
  }) {
    if (data !== undefined) {
      dataState = data
    }
    if (encoding !== undefined) {
      encodingState = encoding
    }

    if (dotSize !== undefined) {
      dotSizeState = dotSize
    }

    if (dotOpacity !== undefined) {
      dotOpacityState = dotOpacity
    }

    if (contourBandwidth !== undefined) {
      contourBandwidthState = contourBandwidth
    }

    if (contourThreshold !== undefined) {
      contourThresholdState = contourThreshold
    }

    if (animationSpeed !== undefined) {
      animationSpeedState = animationSpeed
    }

    update()
  }

  //initialize the visualization
  state({
    data: dataState,
    encoding: encodingState,
    dotSize: dotSizeState,
    dotOpacity: dotOpacityState,
    contourBandwidth: contourBandwidthState,
    contourThresholde: contourThresholdState,
    animationSpeed: animationSpeedState,
  })

  function update() {
    // console.log(data)
    // console.log(encoding)
    svg.selectAll('.dots').remove()
    svg.selectAll('.contours').remove()
    // d3.selectAll('.hurricanePathAnimation').remove()
    clearPaths()

    if (encodingState === 'dots') {
      const dots = drawDots({
        container: svg,
        projection: projection,
        data: dataState,
        size: dotSizeState,
        opacity: dotOpacityState,
        fill: 'whitesmoke',
      })

      dots
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('click', click)

      return dots
    } else if (encodingState === 'contours') {
      const contours = drawContours({
        container: svg,
        width: width,
        height: height,
        projection: projection,
        data: dataState,
        bandwidth: contourBandwidthState,
        threshold: contourThresholdState,
      })
      return contours
    }
  }

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
  //   usOuter.attr('transform', transform)
  //   usInner.attr('transform', transform)
  //   dots.attr('transform', transform)
  //   contours.attr('transform', transform)
  // }
  // --------------------------------------------------------------
})
