// Se define una constante en donde se va a alojar toda la data.
////////////////////////////////////////////////////////////////////////////////

const STORAGE = {};

// Esta función parsea el el formato de tipo de linea.
////////////////////////////////////////////////////////////////////////////////

function parseTypeLine(type) {

  switch (type) {
    case 'solid': return null;
    case 'dashed': return '5, 5';
    default: console.error(`El tipo de linea ${ type } no es válido.`); return null;
  }
}

// Esta función descarga un archivo y devuelve una promesa.
////////////////////////////////////////////////////////////////////////////////

function downloadFile(path, name) {
  return new Promise((success) => {
    d3.json(path, (data) => {
      STORAGE[name] = data;

      success();
    });
  });
}

// Esta función parsea el formato de tipo de fecha.
////////////////////////////////////////////////////////////////////////////////

function parseFormatDate(format, date) {
  date = moment(date);

  switch (format) {
    case 'R/P1Y':
      return date.format('YYYY');
    case 'R/P6M':
      let semester = d3.scaleLinear().domain([1, 12]).range([1, 2]);
          semester = Math.round(semester(date.format('M')));

      return `${ semester }º semestre de ${ date.format('YYYY') }`;
    case 'R/P3M':
      let trimester = d3.scaleLinear().domain([1, 12]).range([1, 4]);
          trimester = Math.round(trimester(date.format('M')));

      return `${ trimester }º trimestre de ${ date.format('YYYY') }`;
    case 'R/P1M':
      return date.format('MMMM [de] YYYY');
    case 'R/P1D':
      return date.format('D [de] MMMM [de] YYYY');
    default:
      return 'Frecuencia no soportada'; // TODO ##0001 - Definir valor por defecto
  }
}

// Esta función parsea el el formato de tipo de unidad.
////////////////////////////////////////////////////////////////////////////////

function parseValueIndicator(format, value) {
  value = value.toFixed(2);

  switch (format) {
    case 'Porcentaje':
      return `${ value }%`;
    default:
      return value; // TODO ##0002 - Definir valor por defecto
  }
}

// Esta función cambia la vista a los gráficos.
////////////////////////////////////////////////////////////////////////////////

function changeView(container) {

  if (container === 'charts') {
    $('#chartsContainer').show();
    // $('#chartsContainer').fadeIn(250);
  } else {
    // $('#chartsContainer').hide();
    $('#chartsContainer').fadeOut(250);
  }
}

// Esta función renderiza los gráficos.
////////////////////////////////////////////////////////////////////////////////

function generateCharts(element) {
  let id = element.parentNode.getAttribute('id'),
      chartsContainer = document.querySelector('#chartsContainer #charts');
      chartsContainer.innerHTML = '';

  function renderPreviewCharts() {
    STORAGE.cards.forEach((card) => {

      if (card.id === id) {
        let charts = card.charts;

        charts.forEach((chart) => {

          let chartComponente = document.createElement('div');
              chartComponente.setAttribute('id', chart.id);
              chartComponente.classList.add('chart');
              chartComponente.innerHTML = `<div class="head">
                                              <h3>${ chart.title }</h3>
                                              <span id="references"></span>
                                           </div>
                                           <div class="break-line"><br></div>
                                           <p class="paragraph">${ chart.description }</p>
                                           <div class="break-line"><br></div>
                                           <div class="chart-svg"></div>
                                           <div class="break-line"><br></div>
                                           <div class="loading flex">
                                            <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                           </div>`;

          chartsContainer.append(chartComponente);

          downloadData(chart);
        });
      }
    });
  }

  function downloadData(chart) {
    let indicators = chart.indicators,
        length = indicators.length - 1,
        count = 0, promises = [];

    indicators.forEach((indicator, index) => { // Se guarda información de cada indicador

      if (!STORAGE[indicator.id]) {
        promises.push(
          downloadFile(`./public/data/series/${ indicator.id }.json`, indicator.id)
        );
      }
    });

    jQuery.when(...promises).then(() => { processData(chart); });
  }

  function processData(chart) {
    // console.log('Process data ...');
    let group = {}, dataset = [], index;

    // Se agrupan indicadores
    chart.indicators.forEach((indicator) => {
      // console.log(indicator);
      STORAGE[indicator.id].data.forEach((value) => {

        index = group[value[0]];

        if (index === undefined) {
          group[value[0]] = { date: new Date(value[0]) };
        }

        group[value[0]][indicator.name] = value[1];
      });
    });

    // Se define formato
    for (var item in group) {
      dataset.push(group[item]);
    }

    return renderCharts(chart, dataset);
  }

  function renderCharts(chart, data) {
    let chartComponent = document.getElementById(chart.id);
        chartComponent.querySelector('.loading').remove();

    ////////////////////////////////////////////////////////////////////////////
    // Render LineChart
    ////////////////////////////////////////////////////////////////////////////

    // variables
    ////////////////////////////////////////////////////////////////////////////

    let totalHeight = 500,
        diffRangeY  = 1.1,
        chartMargin = {top: 30, right: 50, bottom: 150, left: 50},
        rangeMargin = {top: 410, right: 50, bottom: 30, left: 50};

    // parámetros
    ////////////////////////////////////////////////////////////////////////////

    let dataset = chart.indicators.map((d) => {
      return {
        name: d.name,
        values: data.map((c) => {
          return {
            date: c.date,
            value: (c[d.name] !== undefined) ? (+c[d.name]) : (0)
          };
        })
      };
    }),
    totalWidth = chartsContainer.getBoundingClientRect().width,
    minValue   = d3.min(dataset, (c) => d3.min(c.values, (v) => v.value)) * diffRangeY,
    maxValue   = d3.max(dataset, (c) => d3.max(c.values, (v) => v.value)) * diffRangeY;


    let indice = dataset[0].values.length - 1 - chart.laps;
        indice = (indice < 0) ? (0) : (indice);

    let date = dataset[0].values[indice].date;


    // parámetros del gráfico
    ////////////////////////////////////////////////////////////////////////////

    let chartWidth  = totalWidth - chartMargin.left - chartMargin.right,
        chartHeight = totalHeight - chartMargin.top - chartMargin.bottom,
        chartScaleX = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(data, (d) => d.date)),
        chartScaleY = d3.scaleLinear().range([chartHeight, 0]).domain([minValue, maxValue]),
        chartAxisX  = d3.axisBottom(chartScaleX),
        chartAxisY  = d3.axisLeft(chartScaleY);

    // parámetros del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let rangeWidth  = totalWidth - rangeMargin.left - rangeMargin.right,
        rangeHeight = totalHeight - rangeMargin.top - rangeMargin.bottom,
        rangeScaleX = d3.scaleTime().range([0, rangeWidth]).domain(chartScaleX.domain()),
        rangeScaleY = d3.scaleLinear().range([rangeHeight, 0]).domain(chartScaleY.domain()),
        rangeAxisX  = d3.axisBottom(rangeScaleX),
        rangeAxisY  = d3.axisLeft(rangeScaleY);

    // brush
    ////////////////////////////////////////////////////////////////////////////

    let brush = d3.brushX()
      .extent([[0, 0], [rangeWidth, rangeHeight]])
      .on('brush', brushed);

    // escala de colores de lineas
    ////////////////////////////////////////////////////////////////////////////

    let colorLines = d3.scaleOrdinal()
      .domain(chart.indicators.map((d) => d.name))
      .range(chart.indicators.map((d) => d.color));

    // se definen lineas
    ////////////////////////////////////////////////////////////////////////////

    let chartLine = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => chartScaleX(d.date))
      .y((d) => chartScaleY(d.value));

    let rangeLine = d3.line()
      .curve(d3.curveMonotoneX)
      .x((d) => rangeScaleX(d.date))
      .y((d) => rangeScaleY(d.value));

    // se crea SVG
    ////////////////////////////////////////////////////////////////////////////

    let svg = d3.select(`#${ chart.id } .chart-svg`).append('svg')
      .attr('width', chartWidth + chartMargin.left + chartMargin.right)
      .attr('height', chartHeight + chartMargin.top + chartMargin.bottom);

    svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    svg.append('rect')
      .attr('class', 'zoom')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('fill', 'silver')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

    // se crea contenedor del gráfico
    ////////////////////////////////////////////////////////////////////////////

    let chartContainer = svg.append('g')
      .attr('class', 'chartContainer')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

    chartContainer.append('g')
      .attr('class', 'line-y-0')
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', chartScaleY(0))
      .attr('y2', chartScaleY(0))
      .style('fill', 'none')
      .style('stroke', 'black');

    chartContainer.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${ chartHeight })`)
      .call(chartAxisX);

    chartContainer.append('g')
      .attr('class', 'axis axis--y')
      .call(chartAxisY);

    let chartLines = chartContainer.selectAll('.lines')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'lines');

    chartLines.append('path')
      .attr('class', 'line')
      .attr('stroke-dasharray', (d, i) => { return parseTypeLine(chart.indicators[i].typeLine); })
      .attr('d', (d) => chartLine(d.values))
      .style('fill', 'none')
      .attr('clip-path', 'url(#clip)')
      .style('stroke', (d) => colorLines(d.name));

    let dots = chartContainer.selectAll('.dot')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'dot')
      .style('fill', (d) => colorLines(d.name))
      .selectAll('circle')
      .data((d) => d.values)
      .enter().append('circle')
      .attr('clip-path', 'url(#clip)')
      .attr('r', 2)
      .attr('cx', (d) => chartScaleX(d.date))
      .attr('cy', (d) => chartScaleY(d.value));

    // se crea contenedor del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let rangeConteiner = svg.append('g')
      .attr('class', 'rangeConteiner')
      .attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);

    rangeConteiner.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0, ${ rangeHeight })`)
      .call(rangeAxisX);

    rangeConteiner.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, [rangeScaleX(date), chartWidth]);

    let rangeLines = rangeConteiner.selectAll('.mini-lines')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'mini-lines');

    rangeLines.append('path')
      .attr('d', (d) => rangeLine(d.values))
      .style('stroke', 'black')
      .style('fill', 'none');

    // se crea contenedor del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let legend = svg.append('g')
      .attr('class', 'legends')
      .attr('transform', `translate(${ -chartWidth + 75 }, 10)`)
      .selectAll('.legend')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'legend');

    legend.append('rect')
      .attr('x', chartWidth - 20)
      .attr('y', (d, i) => i * 20)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d) => colorLines(d.name));

    legend.append('text')
      .attr('x', chartWidth - 8)
      .attr('y', (d, i) => (i * 20) + 9)
      .text((d) => d.name);

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    // Vertical Line
    var lineHover = svg.append('g').attr('class', 'lineHover').attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")");

    lineHover.append('path') // this is the black vertical line to follow mouse
      .attr('class', 'mouse-line')
      .style('stroke', 'red')
      .style('stroke-width', '1px')
      .style('opacity', '0');

    var mousePerLine = lineHover.selectAll('.mouse-per-line')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'mouse-per-line');

    mousePerLine.append('circle')
      .attr('r', 10)
      // .style('stroke', 'black')
      .style('stroke', function(d) { return colorLines(d.name); })
      .style('fill', 'none')
      .style('stroke-width', '2px')
      .style('opacity', '0');

    mousePerLine.append('text')
      .attr('transform', 'translate(10,3)');

    lineHover.append('svg:rect') // append a rect to catch mouse movements on canvas
      .attr('width', chartWidth) // can't catch mouse events on a g element
      .attr('height', chartHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .on('mouseover', function() { // on mouse in show line, circles and text

        d3.select(this.parentNode).select('.mouse-line').style('opacity', '1');
        d3.select(this.parentNode).selectAll('.mouse-per-line circle').style('opacity', '1');
        d3.select(this.parentNode).selectAll('.mouse-per-line text').style('opacity', '1');

      })
      .on('mouseout', function() { // on mouse out hide line, circles and text

        d3.select(this.parentNode).select('.mouse-line').style('opacity', '0');
        d3.select(this.parentNode).selectAll('.mouse-per-line circle').style('opacity', '0');
        d3.select(this.parentNode).selectAll('.mouse-per-line text').style('opacity', '0');

      })
      .on('mousemove', function() { // mouse moving over canvas
        // keep a reference to all our lines
        var lines = this.parentNode.parentNode.querySelectorAll('.line');

        var mouse = d3.mouse(this);

        d3.select(this.parentNode).select('.mouse-line').attr('d', function() {
          var d = 'M' + mouse[0] + ',' + chartHeight;
              d += ' ' + mouse[0] + ',' + 0;

          return d;
        });

        // position the circle and text
        d3.select(this.parentNode).selectAll(".mouse-per-line")
          .attr("transform", function(d, i) {

            // console.log(width/mouse[0]);

            var xDate = chartScaleX.invert(mouse[0]),
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
              .text(chartScaleY.invert(pos.y).toFixed(2));

            // return position
            return "translate(" + mouse[0] + "," + pos.y +")";
          });

      });

    //create brush function redraw scatterplot with selection
    function brushed() {
      let selection = d3.event.selection;

      chartScaleX.domain(selection.map(rangeScaleX.invert, rangeScaleX));

      chartContainer.selectAll('.line').attr('d', (d) => chartLine(d.values));
      chartContainer.selectAll('.dot circle').attr('cx', (d) => chartScaleX(d.date)).attr('cy', (d) => chartScaleY(d.value));
      chartContainer.select('.axis--x').call(chartAxisX);
      chartContainer.select('.axis--y').call(chartAxisY);
      // chartContainer.selectAll('.dot').attr('cx', (d) => chartScaleX(d[0]));
    }
  }

  renderPreviewCharts();
}

// Esta función renderiza las tarjetas.
////////////////////////////////////////////////////////////////////////////////

function renderCards() {

  STORAGE.cards.forEach((card) => {

    let cardComponent = document.createElement('div');
        cardComponent.setAttribute('id', card.id);
        cardComponent.classList.add('card');
        cardComponent.innerHTML = `<h3>${ card.title }</h3>
                                   <div class="break-line"><br><br><hr><br><br></div>
                                   <h4>${ card.name }</h4>
                                   <div class="break-line"><br></div>
                                   <p id="frequency"></p>
                                   <div class="break-line"><br><br></div>
                                   <p id="units_representation"></p>
                                   <div class="break-line"><br></div>
                                   <p id="units"></p>
                                   <div class="break-line"><br></div>
                                   <img src="#" />
                                   <div class="break-line"><br><br><br></div>
                                   <button class="button" onclick="changeView('charts'); generateCharts(this);">
                                      <span class="button-waves">Ver más gráficos</span>
                                   </button>
                                   <div class="break-line"><br></div>
                                   <a href="${ card.download }" class="link" download><i class="fa fa-download" aria-hidden="true"></i> Descargar datos</a>
                                   <div class="loading flex">
                                    <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                   </div>`;

    document.querySelector('#cardsContainer #cards').append(cardComponent);

    downloadFile(`./public/data/series/${ card.id }.json`, card.id)
      .then(() => {
        let data     = STORAGE[card.id].data,
            metadata = STORAGE[card.id].metadata;

        // Se agrega data de la API
        ////////////////////////////////////////////////////////////////////////

        let cardComponent = document.getElementById(metadata.id);
            cardComponent.querySelector('#frequency').innerHTML = parseFormatDate(metadata.frequency, data[data.length - 1][0]);
            cardComponent.querySelector('#units_representation').innerHTML = parseValueIndicator(card.units_representation, data[data.length - 1][1]);
            cardComponent.querySelector('#units').innerHTML = metadata.units;
            cardComponent.querySelector('.loading').remove();
      });
  });
}

// Esta función inicia la aplicación.
////////////////////////////////////////////////////////////////////////////////

function start() {
  downloadFile('./public/data/cards.json', 'cards').then(renderCards);
}

// // Is Document Ready
// ////////////////////////////////////////////////////////////////////////////////

window.document.onload = start();
