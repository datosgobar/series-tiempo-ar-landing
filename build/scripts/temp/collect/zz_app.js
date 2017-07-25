// Global Variables
////////////////////////////////////////////////////////////////////////////////

let gdata = {};

// Global Functions
////////////////////////////////////////////////////////////////////////////////

function proccessTypeLine(type) {
  switch (type) {
    case 'solid': return null;
    case 'dashed': return '5, 5';
    default: return null;
  }
}


function generateCharts(element) {
  // console.log('Se solicita generación de graficos ...');

  let id = element.getAttribute('id'),
      chartsContainer = window.document.querySelector('#chartsContainer');
      chartsContainer.innerHTML = '';

  function downloadData(processData, renderChart) {
    // console.log('Se descargan indicadores faltantes para generación de grafico');
    let charts, indicators, length, count;

    gdata.cards.forEach((card) => {

      if (card.id === id) { // Se identifica la tarjeta seleccionada y se consulta data
        charts = card.charts;

        charts.forEach((chart) => {
          indicators = chart.indicators;
          count = 0;
          length = indicators.length - 1;

          indicators.forEach((indicator, index) => { // Se guarda información de cada indicador
            if (!gdata[indicator.name]) {
              // console.log('download');
              downloadFile(`./public/data/series/${ indicator.name }.json`, indicator.name).then(() => {
                // console.log('finish download');
                if (length === count) { processData(chart, renderChart); } else { count++; /*console.log(count, '/', indicators.length); */}
              });
            } else {
              // console.log('not download');
              if (length === count) { processData(chart, renderChart); } else { count++; /*console.log(count, '/', indicators.length); */}
            }
          });
        });
      }
    });
  }

  function processData(chart, renderCallback) {
    // console.log('Process data ...');
    let group = {}, dataset = [], index;

    // Se agrupan indicadores
    chart.indicators.forEach((indicator) => {
      gdata[indicator.name].forEach((value) => {
        index = group[value[0]];

        if (index === undefined) {
          group[value[0]] = { date: moment(value[0]).format('YYYYMMDD') };
        }

        // group[value[0]][indicator.name] = (value[1] === null)?(0):(value[1]);
        group[value[0]][indicator.name] = value[1];
      });
    });

    // Se define formato
    for (var item in group) {
      dataset.push(group[item]);
    }

    return renderCallback(chart, dataset);
  }

  function renderCharts(chart, data) {
    // console.log('Draw chart ...');

    // Se agrega titulo
    let modulo = Modal.add.title({
      settings: {type: 'title2', text: chart.title},
      styles:   {color: Modal.variables.colors.gobar_dark, textAlign: 'center'}
    });
    chartsContainer.appendChild(modulo);

    // Se dibuja grafico
    let marginChart = {top: 20, right: 20, bottom: 110, left: 50},
        marginRange = {top: 430, right: 20, bottom: 30, left: 40},
        width       = chartsContainer.getBoundingClientRect().width - marginChart.left - marginChart.right,
        heightChart = 500 - marginChart.top - marginChart.bottom,
        heightRange = 500 - marginRange.top - marginRange.bottom;

    let parseDate = d3.timeParse("%Y%m%d");

    let xScaleChart = d3.scaleTime().range([0, width]),
        xScaleRange = d3.scaleTime().range([0, width]),
        yScaleChart = d3.scaleLinear().range([heightChart, 0]),
        yScaleRange = d3.scaleLinear().range([heightRange, 0]);

    let xAxisChart = d3.axisBottom(xScaleChart),
        xAxisRange = d3.axisBottom(xScaleRange),
        yAxisChart = d3.axisLeft(yScaleChart),
        yAxisRange = d3.axisLeft(yScaleRange);

    // var zoom = d3.zoom()
    //   .scaleExtent([1, Infinity])
    //   .translateExtent([[0, 0], [width, heightChart]])
    //   .extent([[0, 0], [width, heightChart]])
    //   .on("zoom", zoomed);

    let brush = d3.brushX()
        .extent([[0, 0], [width, heightRange]])
        .on('brush', brushed);

    let svg = d3.select('#chartsContainer').append('svg')
        .attr('width', width + marginChart.left + marginChart.right)
        .attr('height', heightChart + marginChart.top + marginChart.bottom);

    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
      .append('rect')
        .attr('width', width)
        .attr('height', heightChart);

    // svg.append("rect")
    //   .attr("class", "zoom")
    //   .attr("width", width)
    //   .attr("height", heightChart)
    //   .style('fill', 'silver')
    //   .attr("transform", "translate(" + marginChart.left + "," + marginChart.top + ")");
      // .call(zoom);

    let focus = svg.append('g')
        .attr('class', 'focus')
        .attr('width', width)
        .attr('transform', `translate(${ marginChart.left }, ${ marginChart.top })`);

    let context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', `translate(${ marginChart.left }, ${ marginRange.top })`);

    // Se define escala de colores
    let domainColor = [];
    chart.indicators.forEach((v, k) => {domainColor.push(v.name);});

    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(domainColor);

    data.forEach((d) => { d.date = parseDate(d.date); });

    // Se normaliza data
    var indicators = color.domain().map((name) => ({ name: name, values: data.map((d) => ({ date: d.date, value: +d[name] })) }));

    // console.log(data);
    // console.log(indicators);
    let min = 0;
    let max = 0;

    indicators.forEach((indicator) => {
      indicator.values.forEach((values) => {
        min = Math.min(min, values.value);
        max = Math.max(max, values.value);
      });
    });

    xScaleChart.domain(d3.extent(data, (d) => d.date));
    yScaleChart.domain([min, max]);
    xScaleRange.domain(xScaleChart.domain());
    yScaleRange.domain(yScaleChart.domain());

    // line
    var line = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => xScaleChart(d.date))
      .y((d) => yScaleChart(d.value));

    var lines = focus.selectAll('.series')
      .data(indicators)
      .enter().append('g')
      .attr('class', 'series');

    lines.append('path')
      .attr('class', 'line')
      .attr('stroke-dasharray', (d) => { return proccessTypeLine(d.name.typeLine); })
      .attr('d', (d) => line(d.values))
      .style('fill', 'none')
      .style('stroke', (d) => color(d.name));

    var dots = focus.selectAll('.dot')
      .data(indicators)
      .enter().append('g')
      .attr('class', 'dot')
      .style('fill', (d) => color(d.name))
      .selectAll('circle')
      .data((d) => d.values)
      .enter().append('circle')
      .attr('r', 2)
      .attr('cx', (d) => xScaleChart(d.date))
      .attr('cy', (d) => yScaleChart(d.value));

    focus.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${ heightChart })`)
      .call(xAxisChart);
    focus.append('g')
      .attr('class', 'axis axis--y')
      .call(yAxisChart);

    // append scatter plot to brush chart area
    var lineMini = d3.line()
      .x((d) => xScaleRange(d.date))
      .y((d) => yScaleRange(d.value));

    let linesMini = context.selectAll('.mini-line')
      .data(indicators)
      .enter().append('g')
      .attr('class', 'mini-line');

    linesMini.append('path')
      .attr('d', (d) => lineMini(d.values))
      .style('fill', 'none')
      .style('stroke', (d) => color(d.name));

    // console.log(chart.laps);
    console.log('aca');
    let lapsDate = indicators[0].values;
    let indice = lapsDate.length - 1 - chart.laps;
        indice = (indice < 0)?(0):(indice);
        lapsDate = lapsDate[indice];

        lapsDate = lapsDate.date;
        

    context.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${ heightRange })`)
      .call(xAxisRange);
    context.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, [xScaleRange(lapsDate), width]);

    var legend = svg.append('g')
      .attr('class', 'legends')
      .attr('transform', `translate(${ -width + 75 },0)`)
      .selectAll('.legend')
      .data(indicators)
      .enter().append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', width - 20)
      .attr('y', function(d, i) {
        return i * 20;
      })
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', function(d) {
        return color(d.name);
      });

    legend.append('text')
      .attr('x', width - 8)
      .attr('y', function(d, i) {
        return (i * 20) + 9;
      })
      .text(function(d) {
        return d.name;
      });


    // Vertical Line
    var lineHover = svg.append('g').attr('class', 'lineHover').attr("transform", "translate(" + marginChart.left + "," + marginChart.top + ")");

    lineHover.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'red')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    var mousePerLine = lineHover.selectAll('.mouse-per-line')
      .data(indicators)
      .enter().append('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('r', 10)
      // .style('stroke', 'black')
      .style('stroke', function(d) { return color(d.name); })
      .style('fill', 'none')
      .style('stroke-width', '2px')
      .style('opacity', '0');
    mousePerLine.append('text')
      .attr('transform', 'translate(10,3)');

    lineHover.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', width) // can't catch mouse events on a g element
      .attr('height', heightChart)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', function() { // on mouse in show line, circles and text

        d3.select(this.parentNode).select('.mouse-line').style("opacity", "1");
        d3.select(this.parentNode).selectAll(".mouse-per-line circle").style("opacity", "1");
        d3.select(this.parentNode).selectAll(".mouse-per-line text").style("opacity", "1");

      })
      .on('mouseout', function() { // on mouse out hide line, circles and text

        d3.select(this.parentNode).select(".mouse-line").style("opacity", "0");
        d3.select(this.parentNode).selectAll(".mouse-per-line circle").style("opacity", "0");
        d3.select(this.parentNode).selectAll(".mouse-per-line text").style("opacity", "0");

      })
      .on('mousemove', function() { // mouse moving over canvas
        // keep a reference to all our lines
        var lines = this.parentNode.parentNode.querySelectorAll('.line');

        var mouse = d3.mouse(this);

        d3.select(this.parentNode).select('.mouse-line').attr('d', function() {
          var d = 'M' + mouse[0] + ',' + heightChart;
              d += ' ' + mouse[0] + ',' + 0;

          return d;
        });

        // position the circle and text
        d3.select(this.parentNode).selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {

            // console.log(width/mouse[0]);

            var xDate = xScaleChart.invert(mouse[0]),
                bisect = d3.bisector(function(d) { return d.date; }).right,
                idx = bisect(d.values, xDate);

            // since we are use curve fitting we can't relay on finding the points like I had done in my last answer
            // this conducts a search using some SVG path functions
            // to find the correct position on the line
            // from http://bl.ocks.org/duopixel/3824661
            var beginning = 0,
                end = lines[i].getTotalLength(),
                target = null;

            while (true){
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);
              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                  break;
              }
              if (pos.x > mouse[0])      end = target;
              else if (pos.x < mouse[0]) beginning = target;
              else break; //position found
            }

            // update the text with y value
            d3.select(this).select('text')
              .text(yScaleChart.invert(pos.y).toFixed(2));

            // return position
            return "translate(" + mouse[0] + "," + pos.y +")";
          });

      });

    //create brush function redraw scatterplot with selection
    function brushed() {
      let selection = d3.event.selection;

      xScaleChart.domain(selection.map(xScaleRange.invert, xScaleRange));

      focus.selectAll('.line')
        .attr('d', (d) => line(d.values));

      focus.selectAll('.dot circle')
        .attr('cx', (d) => xScaleChart(d.date))
        .attr('cy', (d) => yScaleChart(d.value));

      focus.select('.axis--x').call(xAxisChart);
      focus.select('.axis--y').call(yAxisChart);
      // focus.selectAll('.dot').attr('cx', (d) => xScaleChart(d[0]));
    }
    // function zoomed() {
    //   if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    //   var t = d3.event.transform;
    //
    //   xScaleChart.domain(t.rescaleX(xScaleRange).domain());
    //
    //   focus.selectAll('.line').attr('d', (d) => line(d.values));
    //   focus.select(".axis--x").call(xAxisChart);
    //   focus.select('.axis--y').call(yAxisChart);
    //   // focus.selectAll('.dot').attr('cx', (d) => xScaleChart(d[0]));
    //
    //   context.select(".brush").call(brush.move, xScaleChart.range().map(t.invertX, t));
    // }
    // function type(d) {
    //   d[0] = parseDate(d[0]);
    //   d[1] = +d[1];
    //   return d;
    // }
  }

  downloadData(processData, renderCharts);

  // let chartData = processData(data.indicators);
}

const animateAnchor = (target) => $('body').animate({ scrollTop: $(target).offset().top }, 500);

const scale = () => {
  function Domain(min, max) {
    return function(val) {
      return (val - min) / (max - min);
    };
  }
  function Range(min, max, clamp) {
    return function(val) {
      val = min + (max - min) * val;

      return clamp ? Math.min(Math.max(val, min), max) : val;
    };
  }

  var domain = Domain(0, 1),
      range = Range(0, 1),
      s = function(val) { return range(domain(val)); };

  s.domain = function(min, max) {
    if (!arguments.length) { return domain; }

    domain = Domain(min, max);

    return s;
  };
  s.range = function(min, max, clamp) {
    if (!arguments.length) { return range; }

    range = Range(min, max, clamp);

    return s;
  };

  return s;
};

const parseFormatDate = (format, date) => {
  switch (format) {
    case 'R/P1Y': return moment(date).format('YYYY');
    case 'R/P6M':
      let semester = scale().domain(1,12).range(1,2);
          semester = Math.round(semester(moment(date).format('M')));

      return `${ semester }º semestre de ${ moment(date).format('YYYY') }`;
    case 'R/P3M':
      let trimester = scale().domain(1,12).range(1,4);
          trimester = Math.round(trimester(moment(date).format('M')));

      return `${ trimester }º trimestre de ${ moment(date).format('YYYY') }`;
    case 'R/P1M': return moment(date).format('MMMM [de] YYYY');
    case 'R/P1D': return moment(date).format('D [de] MMMM [de] YYYY');
  }
};

const parseValueIndicator = (format, value) => {
  value = value.toFixed(2);

  if (format === '%') {
    return `${ value }%`;
  } else {
    return value / format;
  }

};

const downloadFile = (path, name) => {

  let promise = new Promise((success) => {
    d3.json(path, (data) => {

      gdata[name] = data;

      success();
    });
  });

  return promise;
};

const generateCardsModal = () => {
  let modalComponent = [];

  gdata.cards.forEach((v, k) => {

    downloadFile(`./public/data/series/${ v.id }.json`, v.id)
      .then(() => {
        let dato = gdata[v.id][gdata[v.id].length - 1];

        let card = Modal.add.subContainer({
          settings: {type: 'card'},
          attr:     {class: 'mod-col-col strictCenter'},
          styles:   {width: '30%', minWidth: '250px', marginBottom: '20px', padding: '0px 10px'},
          childrens: [
            Modal.add.space({settings: {type: 'allways', quantity: 2}}),
            Modal.add.title({
              settings: {type: 'title3', text: v.title},
              styles:   {color: Modal.variables.colors.gobar_dark, textAlign: 'center'}
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 2}}),
            Modal.add.link({
              settings:   {type: 'block', text: ''},
              attr:       {href: v.download, download: ''},
              styles:     {width: '100%'},
              childrens:  [
                Modal.add.button({
                  settings: {type: 'roundSmall', text: 'Descargar archivo excel'},
                  styles:   {border: `1px solid ${ Modal.variables.colors.base }`, backgroundColor: 'white', color: Modal.variables.colors.base}
                })
              ]
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 2}, styles: {borderBottom: `1px solid ${ Modal.variables.colors.base }`}}),
            Modal.add.space({settings: {type: 'allways', quantity: 2}}),
            Modal.add.title({
              settings: {type: 'title4', text: v.indicator},
              styles:   {color: Modal.variables.colors.base_contraste}
            }),
            Modal.add.paragraph({
              settings: {type: 'default', text: parseFormatDate(v.formatDate, dato[0])},
              styles:   {textAlign: 'center'}
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 2}}),
            Modal.add.paragraph({
              settings: {type: 'big', text: parseValueIndicator(v.unitIndicator, dato[1])},
              styles:   {color: Modal.variables.colors.gobar_dark}
            }),
            Modal.add.paragraph({
              settings: {type: 'default', text: v.description},
              styles:   {textAlign: 'center'}
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 1}}),
            Modal.add.image({
              styles: {height: '70px', width: '100%'}
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 1}}),
            Modal.add.link({
              settings:   {type: 'block', text: ''},
              styles:     {width: '100%'},
              childrens:  [
                Modal.add.button({
                  settings: {type: 'roundSmall', text: 'Ver más graficos'},
                  attr:     {id: v.id, onclick: 'generateCharts(this); animateAnchor("#chartsContainer");'}
                })
              ]
            }),
            Modal.add.space({settings: {type: 'allways', quantity: 2}}),
          ]
        });

        window.document.getElementById('cardsContainer').appendChild(card);
      });
  });

  return modalComponent;
};

function renderAlgo() {
  const modulos = [
    {name: 'cards', render: () => Modal.add.subContainer({
      settings:  {type: 'default'},
      attr:      {id: 'cardsContainer', class: 'mod-line-line'},
      styles:    {flexWrap: 'wrap', justifyContent: 'space-around', border: '1px solid silver'}
    })},
    {name: 'charts', render: () => Modal.add.subContainer({
      settings: {type: 'default'},
      attr:     {id: 'chartsContainer', class: 'mod-col-col strictCenter'},
      styles:   {width: '100%', border: '1px solid red', boxSizing: 'border-box'},
    })}
  ];

  modulos.forEach((modulo) => {
    window.document.querySelector('#modal_contenido').appendChild(modulo.render());
  });
}

// Render App
function start() {
  let cardChildrens;

  downloadFile('./public/data/cards.json', 'cards')
    .then(renderAlgo)
    .then(generateCardsModal);
}

// // Is Document Ready
// ////////////////////////////////////////////////////////////////////////////////

window.document.onload = start();
