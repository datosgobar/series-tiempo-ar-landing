// Global Variables
////////////////////////////////////////////////////////////////////////////////

let gdata = {};

// Esta función parsea el el formato de tipo de linea.
////////////////////////////////////////////////////////////////////////////////

function proccessTypeLine(type) {
  switch (type) {
    case 'solid': return null;
    case 'dashed': return '5, 5';
    default: return null;
  }
}

// Esta renderiza los gráficos.
////////////////////////////////////////////////////////////////////////////////

function generateCharts(element) {
  // console.log('Se solicita generación de graficos ...');

  let id = element.getAttribute('id'),
      chartsContainer = window.document.querySelector('#chartsContainer .charts');
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

          // var promises = [];
          indicators.forEach((indicator, index) => { // Se guarda información de cada indicador
            // console.log(indicator);
            if (!gdata[indicator.id]) {
              // console.log('download');
              /*var promise = */downloadFile(`./public/data/series/${ indicator.id }.json`, indicator.id).then(() => {
                // console.log('finish download');
                // console.log(count);
                // console.log(length);
                if (length === count) { console.log('render');processData(chart, renderChart); } else { count++; console.log(count, '/', length);}
              });
              // promises.push(promise)
            } else {
              // console.log('not download');
              if (length === count) { processData(chart, renderChart); } else { count++; /*console.log(count, '/', indicators.length); */}
            }
          });
          // $.when.call(promises)
        });
      }
    });
  }

  function processData(chart, renderCallback) {
    // console.log('Process data ...');
    let group = {}, dataset = [], index;

    console.log(chart);
    // Se agrupan indicadores
    chart.indicators.forEach((indicator) => {
      // console.log(indicator);
      gdata[indicator.id].data.forEach((value) => {

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

    return renderCallback(chart, dataset);
  }

  function renderCharts(chart, data) {
    // Se agrega titulo
    let modulo = Modal.add.title({
      settings: {type: 'title2', text: chart.title},
      styles:   {color: Modal.variables.colors.gobar_dark, textAlign: 'center'}
    });
    chartsContainer.appendChild(modulo);

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

    let svg = d3.select('#chartsContainer .charts').append('svg')
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
      .attr('stroke-dasharray', (d, i) => { return proccessTypeLine(chart.indicators[i].typeLine); })
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

  downloadData(processData, renderCharts);
}

// Esta función inicia la aplicación.
////////////////////////////////////////////////////////////////////////////////

function start() {
  downloadFile('./public/data/cards.json', 'cards').then(() => {  // Se renderiza cardsContainer y chartsContainer
    let modules = [
      {name: 'cards', render: () => Modal.add.subContainer({
        settings:  {type: 'section'},
        attr:      {id: 'cardsContainer'},
        styles:   {width: '100%', zIndex: 1},
        childrens: [
          Modal.add.title({
            settings:  {type: 'title2', text: 'Categorías'},
            styles:    {display: 'none'}
          }),
          Modal.add.subContainer({
            settings: {type: 'default'},
            attr:     {class: 'mod-line-line cards'},
            styles:   {flexWrap: 'wrap', justifyContent: 'center', backgroundColor: 'white'}
          })
        ]
      })},
      {name: 'charts', render: () => Modal.add.subContainer({
        settings: {type: 'section'},
        attr:     {id: 'chartsContainer'},
        styles:   {width: '100%', zIndex: 3, display: 'none'},
        childrens: [
          Modal.add.title({
            settings:  {type: 'title2', text: 'Gráficos'},
            styles:    {display: 'none'},
          }),
          Modal.add.link({
            settings: {type: 'link', text: '<i class="fa fa-arrow-left" aria-hidden="true"></i> Volver'},
            attr:     {href: '#', onclick: 'changeView("cards");'}
          }),
          Modal.add.subContainer({
            settings: {type: 'default'},
            attr:     {class: 'mod-col-col strictCenter charts'},
            styles:   {width: '100%', backgroundColor: 'white', boxSizing: 'border-box'},
          })
        ]
      })}
    ];

    modules.forEach((module) => { document.querySelector('#modal_contenido').append(module.render()); });
  }).then(renderCards);
}

// Esta función descarga un archivo y devuelve una promesa.
////////////////////////////////////////////////////////////////////////////////

function downloadFile(path, name) {
  return new Promise((success) => {
    d3.json(path, (data) => {
      gdata[name] = data;

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

// function animateAnchor(target) {
//   $('body').animate({ scrollTop: $(target).offset().top }, 500);
// }

function changeView(container) {

  if (container === 'charts') {
    document.getElementById('chartsContainer').style.display = 'block';
  } else {
    document.getElementById('chartsContainer').style.display = 'none';
  }
}

// Esta función renderiza las tarjetas.
////////////////////////////////////////////////////////////////////////////////

function renderCards() {
  let modalComponent = [];

  gdata.cards.forEach((card) => {

    let cardComponent = Modal.add.subContainer({
      settings:  {type: 'card'},
      attr:      {id: card.id, class: 'mod-col-col strictCenter'},
      styles:    {width: '250px', margin: '0 10px 20px 10px', padding: '20px 20px', position: 'relative'},
      childrens: [
        Modal.add.title({
          settings: {type: 'title3', text: card.title},
          // attr:     {class: 'flex'},
          styles:   {color: Modal.variables.colors.gobar_dark, textAlign: 'center', height: 'calc((1.75rem * 1.2) * 2)'}
        }),
        Modal.add.space({settings: {type: 'allways', quantity: 1}, styles: {borderBottom: `1px solid ${ Modal.variables.colors.base }`}}),
        Modal.add.space({settings: {type: 'allways', quantity: 1}}),
        Modal.add.title({
          settings: {type: 'title4', text: card.name},
          // attr:     {class: 'flex'},
          styles:   {color: Modal.variables.colors.base_contraste, textAlign: 'center', height: 'calc((1.5rem * 1.2) * 2)'}
        }),
        Modal.add.paragraph({
          settings: {type: 'default', text: ''},
          attr:     {id: 'frequency'},
          styles:   {textAlign: 'center'}
        }),
        Modal.add.space({settings: {type: 'allways', quantity: 2}}),
        Modal.add.paragraph({
          settings: {type: 'big', text: ''},
          attr:     {id: 'units_representation'},
          styles:   {color: Modal.variables.colors.gobar_dark, lineHeight: '1'}
        }),
        Modal.add.paragraph({
          settings: {type: 'default', text: ''},
          attr:     {id: 'units'},
          styles:   {textAlign: 'center'}
        }),
        Modal.add.space({settings: {type: 'allways', quantity: 1}}),
        Modal.add.image({
          styles: {height: '40px', width: '50%'}
        }),
        Modal.add.space({settings: {type: 'allways', quantity: 2}}),
        Modal.add.link({
          settings:   {type: 'block', text: ''},
          styles:     {width: '100%'},
          childrens:  [
            Modal.add.button({
              settings: {type: 'roundSmall', text: 'Ver más gráficos'},
              attr:     {id: card.id, onclick: 'generateCharts(this); changeView("charts");'},
              styles:   {width: '100%'}
            })
          ]
        }),
        Modal.add.space({settings: {type: 'allways', quantity: 1}}),
        Modal.add.link({
          settings:   {type: 'link', text: '<i class="fa fa-download" aria-hidden="true"></i> Descargar datos'},
          attr:       {href: card.download, download: ''},
          styles:     {width: '100%', textAlign: 'center', margin: '0'}
        }),
        Modal.add.subContainer({
          settings:  {type: 'default'},
          attr:      {class: 'loading flex'},
          styles:    {position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', zIndex: 2, borderRadius: '4px'},
          childrens: [
            Modal.add.paragraph({
              settings: {type: 'default', text: '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>'}
            })
          ]
        })
      ]
    });

    document.querySelector('#cardsContainer .cards').appendChild(cardComponent);

    downloadFile(`./public/data/series/${ card.id }.json`, card.id)
      .then(() => {
        let data = gdata[card.id].data,
            metadata = gdata[card.id].metadata;

        // Se agrega data de la API
        ////////////////////////////////////////////////////////////////////////

        let cardComponent = document.getElementById(metadata.id);
            cardComponent.querySelector('#frequency').innerHTML = parseFormatDate(metadata.frequency, data[data.length - 1][0]);
            cardComponent.querySelector('#units_representation').innerHTML = parseValueIndicator(card.units_representation, data[data.length - 1][1]);
            cardComponent.querySelector('#units').innerHTML = metadata.units;
            cardComponent.querySelector('.loading').remove();
      });
  });

  return modalComponent;
}

// // Is Document Ready
// ////////////////////////////////////////////////////////////////////////////////

window.document.onload = start();
