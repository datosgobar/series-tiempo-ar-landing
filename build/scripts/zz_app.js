// Global Variables
////////////////////////////////////////////////////////////////////////////////
let gdata = {};

// Global Functions
////////////////////////////////////////////////////////////////////////////////

const generateCharts = (element) => {
  console.log('Se solicita generación de graficos ...');

  let id = element.getAttribute('id'), // Se identifica el id de referencia para obtener la información
      chartsContainer = window.document.querySelector('#chartsContainer');
      chartsContainer.innerHTML = ''; // Se elimina contenido anterior

  // Functions
  const downloadData = (callback) => {
    console.log('Download data ...');
    let charts, indicators, length, count;

    gdata.cards.forEach((card) => {

      if (card.id === id) { // Se identifica la tarjeta seleccionada y se consulta data
        charts = card.charts;

        charts.forEach((chart) => {
          indicators = chart.indicators;
          count = 0;
          length = indicators.length - 1;
          // console.log('//////////////////// -- GRAFICO');
          // console.log('//////////////////// -- INDICADORES = ', indicators.length);
          indicators.forEach((indicator, index) => { // Se guarda información de cada indicador
            // console.log('//////////////////// -- INDICADOR');
            if (!gdata[indicator]) {
              // console.log('download');
              downloadFile(`./public/data/series/${ indicator }.json`, indicator).then(() => {
                // console.log('finish download');
                if (length === count) { callback(chart); } else { count++; /*console.log(count, '/', indicators.length); */}
              });
            } else {
              // console.log('not download');
              if (length === count) { callback(chart); } else { count++; /*console.log(count, '/', indicators.length); */}
            }
          });
        });
      }
    });
  };
  // const processData = (chart, renderCallback) => {
  //   console.log('Process data ...');
  //   let group = {}, format = [], index;
  //
  //   // Se agrupan indicadores
  //   chart.indicators.forEach((indicator) => {
  //     gdata[indicator].forEach((value) => {
  //       index = group[value[0]];
  //
  //       if (index === undefined) {
  //         group[value[0]] = { date: moment(value[0]).format('YYYYMMDD') };
  //       }
  //
  //       group[value[0]][indicator] = value[1];
  //     });
  //   });
  //
  //   // Se define formato
  //   for (var item in group) {
  //     format.push(group[item]);
  //   }
  //
  //   return renderCallback(chart, format);
  // };
  const renderCharts = (chart) => {
    console.log('Draw chart ...');

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

    let parseDate = d3.timeParse('%b %Y');

    let xScaleChart = d3.scaleTime().range([0, width]),
        xScaleRange = d3.scaleTime().range([0, width]),
        yScaleChart = d3.scaleLinear().range([heightChart, 0]),
        yScaleRange = d3.scaleLinear().range([heightRange, 0]);

    let xAxisChart = d3.axisBottom(xScaleChart),
        xAxisRange = d3.axisBottom(xScaleRange),
        yAxisChart = d3.axisLeft(yScaleChart);

    var zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [width, heightChart]])
      .extent([[0, 0], [width, heightChart]])
      .on("zoom", zoomed);

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

    svg.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", heightChart)
      .attr("transform", "translate(" + marginChart.left + "," + marginChart.top + ")")
      .call(zoom);

    let focus = svg.append('g')
        .attr('class', 'focus')
        .attr('transform', `translate(${ marginChart.left }, ${ marginChart.top })`);

    let context = svg.append('g')
        .attr('class', 'context')
        .attr('transform', `translate(${ marginRange.left }, ${ marginRange.top })`);

    let data;

    chart.indicators.forEach((indicator) => {
      data = gdata[indicator];
      data.forEach((v, k) => {
        v[0] = moment(v[0]);
        if (v[1] === null) { v[1] = 0 }
      });

      drawLine(data);
    });

    function drawLine (data) {
      console.log('etapa1');
      xScaleChart.domain(d3.extent(data, (d) => d[0]));
      yScaleChart.domain([0, d3.max(data, (d) => d[1])]);
      xScaleRange.domain(xScaleChart.domain());
      yScaleRange.domain(yScaleChart.domain());
      console.log('etapa2');
      // append scatter plot to main chart area
      var line = d3.line()
        .x((d) => {return xScaleChart(d[0])})
        .y((d) => {return yScaleChart(d[1])});
      var lineChart = focus.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1.5)
            .attr('d', line);
      console.log('etapa3');
      // var dots = focus.append('g');
      //     dots.attr('clip-path', 'url(#clip)');
      //     dots.selectAll('dot')
      //       .data(data)
      //       .enter().append('circle')
      //       .attr('class', 'dot')
      //       .attr('r',5)
      //       .style('opacity', .5)
      //       .attr('cx', (d) => xScaleChart(d[0]))
      //       .attr('cy', (d) => yScaleChart(d[1]));
      console.log('etapa4');
      focus.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${ heightChart })`)
        .call(xAxisChart);
      console.log('etapa5');
      focus.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxisChart);

      // append scatter plot to brush chart area
      var lineMini = d3.line()
        .x((d) => {return xScaleRange(d[0])})
        .y((d) => {return yScaleRange(d[1])});
      let lineChartMini = context.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 1.5)
            .attr('d', lineMini);
      // let dotsMini = context.append('g');
      //   dotsMini.attr('clip-path', 'url(#clip)');
      //   dotsMini.selectAll('dot')
      //     .data(data)
      //     .enter().append('circle')
      //     .attr('class', 'dotContext')
      //     .attr('r',3)
      //     .style('opacity', .5)
      //     .attr('cx', function(d) { return xScaleRange(d[0]); })
      //     .attr('cy', function(d) { return yScaleRange(d[1]); });

      context.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${ heightRange })`)
        .call(xAxisRange);
      context.append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, xScaleChart.range());
    };

    // d3.csv('./public/data/sp500.csv', type, function(error, data) {
    //   if (error) throw error;
    //
    //   xScaleChart.domain(d3.extent(data, (d) => d[0]));
    //   yScaleChart.domain([0, d3.max(data, (d) => d[1]) + 200]);
    //   xScaleRange.domain(xScaleChart.domain());
    //   yScaleRange.domain(yScaleChart.domain());
    //
    //   // append scatter plot to main chart area
    //   var line = d3.line()
    //     .x((d) => {return xScaleChart(d[0])})
    //     .y((d) => {return yScaleChart(d[1])});
    //   var lineChart = focus.append('path')
    //         .datum(data)
    //         .attr('class', 'line')
    //         .attr('fill', 'none')
    //         .attr('stroke', 'steelblue')
    //         .attr('stroke-linejoin', 'round')
    //         .attr('stroke-linecap', 'round')
    //         .attr('stroke-width', 1.5)
    //         .attr('d', line);
    //
    //   // var dots = focus.append('g');
    //   //     dots.attr('clip-path', 'url(#clip)');
    //   //     dots.selectAll('dot')
    //   //       .data(data)
    //   //       .enter().append('circle')
    //   //       .attr('class', 'dot')
    //   //       .attr('r',5)
    //   //       .style('opacity', .5)
    //   //       .attr('cx', (d) => xScaleChart(d[0]))
    //   //       .attr('cy', (d) => yScaleChart(d[1]));
    //
    //   focus.append('g')
    //     .attr('class', 'axis axis--x')
    //     .attr('transform', `translate(0, ${ heightChart })`)
    //     .call(xAxisChart);
    //   focus.append('g')
    //     .attr('class', 'axis axis--y')
    //     .call(yAxisChart);
    //
    //   // append scatter plot to brush chart area
    //   var lineMini = d3.line()
    //     .x((d) => {return xScaleRange(d[0])})
    //     .y((d) => {return yScaleRange(d[1])});
    //   let lineChartMini = context.append('path')
    //         .datum(data)
    //         .attr('fill', 'none')
    //         .attr('stroke', 'steelblue')
    //         .attr('stroke-linejoin', 'round')
    //         .attr('stroke-linecap', 'round')
    //         .attr('stroke-width', 1.5)
    //         .attr('d', lineMini);
    //   // let dotsMini = context.append('g');
    //   //   dotsMini.attr('clip-path', 'url(#clip)');
    //   //   dotsMini.selectAll('dot')
    //   //     .data(data)
    //   //     .enter().append('circle')
    //   //     .attr('class', 'dotContext')
    //   //     .attr('r',3)
    //   //     .style('opacity', .5)
    //   //     .attr('cx', function(d) { return xScaleRange(d[0]); })
    //   //     .attr('cy', function(d) { return yScaleRange(d[1]); });
    //
    //   context.append('g')
    //     .attr('class', 'axis axis--x')
    //     .attr('transform', `translate(0, ${ heightRange })`)
    //     .call(xAxisRange);
    //   context.append('g')
    //     .attr('class', 'brush')
    //     .call(brush)
    //     .call(brush.move, xScaleChart.range());
    // });

    //create brush function redraw scatterplot with selection
    function brushed() {
      let selection = d3.event.selection;

      xScaleChart.domain(selection.map(xScaleRange.invert, xScaleRange));

      var line = d3.line()
        .x((d) => {return xScaleChart(d[0])})
        .y((d) => {return yScaleChart(d[1])});
      focus.selectAll('.line').attr('d', line);
      focus.select('.axis--x').call(xAxisChart);
      focus.select('.axis--y').call(yAxisChart);
    }
    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
      var t = d3.event.transform;

      xScaleChart.domain(t.rescaleX(xScaleRange).domain());

      var line = d3.line()
        .x((d) => {return xScaleChart(d[0])})
        .y((d) => {return yScaleChart(d[1])});
      focus.selectAll(".line").attr("d", line);
      focus.select(".axis--x").call(xAxisChart);
      focus.select('.axis--y').call(yAxisChart);

      context.select(".brush").call(brush.move, xScaleChart.range().map(t.invertX, t));
    }
    function type(d) {
      d[0] = parseDate(d[0]);
      d[1] = +d[1];
      return d;
    }
  };




  downloadData(renderCharts);


  // let chartData = processData(data.indicators);



};

const animateAnchor = (target) => $('body').animate({ scrollTop: $(target).offset().top }, 500);

const scale = () => {
  function Domain(min, max) {
    return function(val) {
      return (val - min) / (max - min);
    }
  }
  function Range(min, max, clamp) {
    return function(val) {
      val = min + (max - min) * val;
      return clamp ? Math.min(Math.max(val, min), max) : val;
    }
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



// Render App
const start = () => {
  let cardChildrens;

  downloadFile('./public/data/cards.json', 'cards')
    .then(() => {

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

      return true;
    }).then(generateCardsModal);

  return true;
};

// // Is Document Ready
// ////////////////////////////////////////////////////////////////////////////////

window.document.onload = start();
