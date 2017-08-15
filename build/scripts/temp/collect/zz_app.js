// Se define una constante en donde se va a alojar toda la data.
////////////////////////////////////////////////////////////////////////////////

const STORAGE = {
  'charts': {} // Se guarda información correspondiente a cada gráfico
};

window.storage = STORAGE;

// Funciones Globales
////////////////////////////////////////////////////////////////////////////////

// Actualizado 04.08.2017 - Permite definir formato del número.
function formatNumberD3(number) {
  return d3.format((parseInt(number) === number)?(','):(',.2f'))(number);
}
function formatNumberJS(number, precision, miles, decimales) {
  let r = '\\d(?=(\\d{3})+' + (precision > 0 ? '\\D' : '$') + ')',
      v = number.toFixed(Math.max(0, precision));
  return (decimales ? v.replace('.', decimales) : v).replace(new RegExp(r, 'g'), '$&' + (miles || ','));
}
// Actualizado 04.08.2017 - Permite descargar un archivo y devolver una promesa.
function downloadFile(path, name) {
  return new Promise((success) => {
    d3.json(path, (data) => {
      STORAGE[name] = data;

      success();
    });
  });
}
// Actualizado 15.08.2017 - Permite renderizar un bloque de contenido y descargar una imagen.
function shareDownload(_element, _indicatorId) {
  let renderNode = _element.parentNode.parentNode,
      timestamp  = moment().format('x');

  domtoimage.toBlob(renderNode).then((blob) => {
    window.saveAs(blob, `indicator_${ _indicatorId }_chart_${ renderNode.getAttribute('id') }_${ timestamp }.png`);
  }).catch(function (error) {
    console.error('oops, algo sucedio mal!', error);
  });
}
// Actualizado 15.08.2017 - Permite generar una imagen para embeber ese bloque de contenido.
function shareEmbebed(_element, _indicatorId) {
  let renderNode = _element.parentNode.parentNode;
  console.log(_element);
  console.log(renderNode);
  console.log(_indicatorId);

  embebedContainerShow(renderNode);
}

// Render Iframe
function renderIframe(_indicator, _chart) {
  $(() => {
    // Se define el contenedor de los modulos
    let container = window.document.querySelector('#app');
        container.setAttribute('class', 'flex flex-column flex-align-end');
    // Se configurán estilos especiales
    window.document.querySelector('#chartsContainer').style.display = 'block';
    window.document.querySelector('#chartsContainer').style.position = 'relative';
    // Se eliminan contenedores innecesarios
    window.document.querySelector('#cardsContainer').remove();
    window.document.querySelector('.back-link').remove();
    // Se renderizan todos los modulos
    start(_indicator, _chart);
    // Si existe, se elimina boton para embeber
    // if (window.document.querySelector('.buttonEmbebed') !== null) {
    //   window.document.querySelector('.buttonEmbebed').remove();
    // }
    // Se crean créditos
    let creditos = window.document.createElement('span');
        creditos.innerHTML = 'Desarrollado por <a href="" class="link">destinatario</a>';
        creditos.style.opacity = '0.5';
    // Se agregan créditos
    container.appendChild(creditos);
  });
}
// Actualizado 15.08.2017 - Devuelve un array con todos los parametros GET.
function parseSearch(search) {
  let args       = search.substring(1).split('&'),
      argsParsed = {}, i, arg, kvp, key, value;

  for (i = 0; i < args.length; i++) {

    if (args[i].indexOf('=') === -1) {
      argsParsed[decodeURIComponent(args[i]).trim()] = true;
    } else {
      kvp   = args[i].split('=');
      key   = decodeURIComponent(kvp[0]).trim();
      value = decodeURIComponent(kvp[1]).trim();
      argsParsed[key] = value;
    }
  }

  return argsParsed;
}
// Actualizado 15.08.2017 - Verifica si se está solicitando embeber el código.
function checkGetRequest() {
  let parametros = parseSearch(window.location.search);

  if (parametros.hasOwnProperty('indicator') && parametros.hasOwnProperty('chart')) {
    renderIframe(parametros.indicator, parametros.chart);
  } else {
    start();
  }
}

function addContainerEmbebed(_container, _indicator, _chart) {
  console.log(_container);
  console.log(_indicator);
  console.log(_chart);

  let iframe = window.document.createElement('iframe');
      iframe.setAttribute('src', `${ window.location.origin }?indicator=${ _indicator }&chart=${ _chart }`);
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '100%');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');

  console.log(iframe);

  let background = window.document.createElement('div');
      background.classList.add('embebedContainer');
      background.style.opacity = 0;
      background.style.visibility = 'hidden';

  console.log(background);

  let exit = window.document.createElement('span');
      exit.classList.add('embebedExit');
      exit.setAttribute('onclick', 'embebedContainerHide(this)');
      exit.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';

  console.log(exit);

  let input = window.document.createElement('input');
      input.setAttribute('value', iframe.outerHTML);

  console.log(input);

  let button = window.document.createElement('button');
      button.setAttribute('onclick', 'copyText(this)');
      button.innerHTML = '<i class="fa fa-clone" aria-hidden="true"></i><span style="margin-left: 10px;">Copiar</span>';

  background.appendChild(exit);
  background.appendChild(input);
  background.appendChild(button);
  _container.querySelector(`#${ _chart }`).appendChild(background);

  return true;
}



// Check 05.07.2017 - Muesta el contenedor para embeber el modulo
function embebedContainerShow(_component) {

  _component.querySelector('.embebedContainer').style.opacity = '';
  _component.querySelector('.embebedContainer').style.visibility = '';

  return true;
}
// Check 05.07.2017 - Oculta el contenedor para embeber el modulo
function embebedContainerHide(_component) {
  _component.parentNode.style.opacity = 0;
  _component.parentNode.style.visibility = 'hidden';

  return true;
}
// Check 05.07.2017 - Guarda en el portapapeles el texto de un elemento
function copyText(elemento) {
  let copy = elemento.parentNode.querySelector('input').select();

  window.document.execCommand('copy');

  return true;
};

// Esta función parsea el el formato de tipo de linea.
////////////////////////////////////////////////////////////////////////////////

function parseTypeLine(type) {

  switch (type) {
    case 'solid': return null;
    case 'dashed': return '5, 5';
    default: console.error(`El tipo de linea ${ type } no es válido.`); return null;
  }
}

// Esta función parsea el formato de tipo de fecha.
////////////////////////////////////////////////////////////////////////////////

function parseFormatDate(format, date, short = false) {
  date = moment(date);

  switch (format) {
    case 'R/P1Y':
      return date.format('YYYY');
    case 'R/P6M':
      let semester = d3.scaleLinear().domain([1, 12]).range([1, 2]);
          semester = Math.round(semester(date.format('M')));

      if (short) {
        return `${ semester }S ${ date.format('YY') }`;
      } else {
        return `${ semester }º semestre de ${ date.format('YYYY') }`;
      }

      break;
    case 'R/P3M':
      let trimester = d3.scaleLinear().domain([1, 12]).range([1, 4]);
          trimester = Math.round(trimester(date.format('M')));

      if (short) {
        return `${ trimester }T ${ date.format('YY') }`;
      } else {
        return `${ trimester }º trimestre de ${ date.format('YYYY') }`;
      }

      break;
    case 'R/P1M':
      return date.format('MMM YY');
    case 'R/P1D':
      return date.format('D MMM YY');
    default:
      return 'Frecuencia no soportada'; // TODO ##0001 - Definir valor por defecto
  }
}

// Esta función parsea el el formato de tipo de unidad.
////////////////////////////////////////////////////////////////////////////////

function parseValueIndicator(format, value) {
  switch (format) {
    case '%':
      return `${ formatNumberD3(value * 100) }%`;
    default:
      return formatNumberD3(value);
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

// Esta función genera el efecto switch de los botones de rango.
////////////////////////////////////////////////////////////////////////////////





// Esta función renderiza los gráficos.
////////////////////////////////////////////////////////////////////////////////
  // OK - Esta función genera un preview de los gráficos.
  function renderPreviewCharts(_chartContiner, _id) {

    STORAGE.cards.forEach((_card) => {

      if (_card.id === _id) {
        let charts = _card.charts;

        charts.forEach((_chart, _index) => {
          let chartComponente = document.createElement('div');
              chartComponente.setAttribute('id', _chart.id);
              chartComponente.classList.add('chart');
              chartComponente.innerHTML = `<div class="head">
                                              <h3>${ _chart.title }</h3>
                                              <div class="break-line"><br></div>
                                              <p class="paragraph">${ _chart.description }</p>
                                              <div class="break-line"><br></div>
                                           </div>
                                           <div class="referenceContainer">
                                             <div class="break-line"><br></div>
                                             <span id="references"></span>
                                             <div class="break-line"><br></div>
                                           </div>
                                           <div class="rangeButton">
                                            <div class="break-line"><br></div>
                                            <div class="rangeButton-component">
                                              <div class="rangeButton-text">Escala:</div>
                                              <div class="rangeButton-button" state="off">
                                              <button onclick="changeSwitchPosition(this, ${ _chart.id })" state="active">Estática</button>
                                              <button onclick="changeSwitchPosition(this, ${ _chart.id })" state="">Dinámica</button>
                                                <div class="switch-effect" style="left: 2px;"></div>
                                              </div>
                                            </div>
                                            <div class="break-line"><br></div>
                                           </div>
                                           <div class="chart-svg"></div>
                                           <div class="break-line"><br></div>
                                           <div class="modal-share">
                                              <input id="share-${ charts[_index].id }" type="checkbox" class="share-open">
                                              <label for="share-${ charts[_index].id }" class="share-open-button hamburger-dark">
                                                <span class="hamburger-1"></span>
                                                <span class="hamburger-2"></span>
                                                <span class="hamburger-3"></span>
                                              </label>
                                              <button class="share-item button buttonCircle" title="embeber" onclick="shareEmbebed(this, '${ _chart.id }')" style="background-color: gray; color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-code" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                              <button class="share-item button buttonCircle" title="descargar" onclick="shareDownload(this, '${ _chart.id }')" style="background-color: gray; color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-download" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                            </div>
                                            <div class="loading flex">
                                             <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                            </div>`;

          _chartContiner.append(chartComponente);
          addContainerEmbebed(_chartContiner, _card.id, _chart.id);

          STORAGE.charts[_chart.id] = { container:  chartComponente };

          downloadChart(_chart);
        });
      }
    });
  }
  // OK - Esta función descarga los paquetes de datos para renderizar el gráfico.
  function downloadChart(_chartData) {
    let indicators = _chartData.indicators,
        length = indicators.length - 1,
        count = 0, promises = [];

    indicators.forEach((_indicator) => {

      if (!STORAGE[_indicator.id]) {
        promises.push(
          downloadFile(`./public/data/series/${ _indicator.id }.json`, _indicator.id)
        );
      }
    });

    jQuery.when(...promises).then(() => { processData(_chartData); });
  }
  // TODO - Esta función transforma el formato de la data para renderizar el gráfico.
  function processData(_chartData) {
    let group = {}, dataset = [], index;

    _chartData.indicators.forEach((_indicator) => {
      STORAGE[_indicator.id].data.forEach((_value) => {
        index = group[_value[0]];
        if (index === undefined) {
          group[_value[0]] = { date: new Date(_value[0]) };
        }
        group[_value[0]][_indicator.short_name] = _value[1];
      });
    });

    // TODO - Utilziar otro método que no sea "for in"
    for (let _item in group) {
      dataset.push(group[_item]);
    }

    return renderCharts(_chartData, dataset);
  }
  // Esta función renderiza el gráfico.
  function renderCharts(_chartData, _data) {
    let containerChart = STORAGE.charts[_chartData.id].container;
        containerChart.querySelector('.loading').remove();

    // Funciones Complementarias
    ////////////////////////////////////////////////////////////////////////////
    function addReferences(_chartData, _container) {
      _chartData.indicators.forEach((_value) => {
        let container = document.querySelector(`#${ _chartData.id } #references`),
            reference = document.createElement('p');
            reference.innerHTML = `<div class="reference-circle" style="background-color: ${ _value.color }"></div> ${ _value.short_name }`;
            container.append(reference);
      });
    }

    ////////////////////////////////////////////////////////////////////////////
    // Render LineChart
    ////////////////////////////////////////////////////////////////////////////

    // variables
    ////////////////////////////////////////////////////////////////////////////
    let totalHeight = 410,
        chartMargin = {top: 0, right: 50, bottom: 112, left: 75},
        rangeMargin = {top: 350, right: 50, bottom: 20, left: 75};

    // parámetros
    ////////////////////////////////////////////////////////////////////////////
    let dataset = _chartData.indicators.map((d) => {
      return {
        name: d.short_name,
        values: _data.filter((c) => c[d.short_name] !== undefined).map((c) => {
          return {
            date: c.date,
            value: +c[d.short_name]
          };
        })
      };
    });

    STORAGE.charts[_chartData.id]['data'] = dataset;
    STORAGE.charts[_chartData.id]['data_chart'] = _data;
    STORAGE.charts[_chartData.id]['data_range'] = dataset;

    let totalWidth = containerChart.getBoundingClientRect().width,
        minDate = d3.min(STORAGE.charts[_chartData.id].data, (c) => d3.min(c.values, (v) => v.date)),
        maxDate = d3.max(STORAGE.charts[_chartData.id].data, (c) => d3.max(c.values, (v) => v.date));

    let indice = STORAGE.charts[_chartData.id].data[0].values.length - 1 - _chartData.laps;
        indice = (indice < 0) ? (0) : (indice);

    let date = STORAGE.charts[_chartData.id].data[0].values[indice].date;

    // console.log('breakpoint_1', STORAGE.charts[_chartData.id]);

    // parámetros del gráfico
    ////////////////////////////////////////////////////////////////////////////

    let chartWidth  = totalWidth - chartMargin.left - chartMargin.right,
        chartHeight = totalHeight - chartMargin.top - chartMargin.bottom,
        chartScaleX = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(_data, (d) => d.date)),
        chartScaleY = d3.scaleLinear().range([chartHeight, 0]).domain(generateRangeYStatic(_chartData.id)),
        chartAxisX  = d3.axisBottom(chartScaleX),
        chartAxisY  = d3.axisLeft(chartScaleY);

    // console.log('breakpoint_2');

    // parámetros del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let rangeWidth  = totalWidth - rangeMargin.left - rangeMargin.right,
        rangeHeight = totalHeight - rangeMargin.top - rangeMargin.bottom,
        rangeScaleX = d3.scaleTime().range([0, rangeWidth]).domain(chartScaleX.domain()),
        rangeScaleY = d3.scaleLinear().range([rangeHeight, 0]).domain(chartScaleY.domain()),
        rangeAxisX  = d3.axisBottom(rangeScaleX).tickValues([new Date(minDate), new Date(maxDate)]).tickFormat((d) => parseFormatDate(_chartData.frequency, d, true)),
        rangeAxisY  = d3.axisLeft(rangeScaleY);

    // console.log('breakpoint_3');

    // brush
    ////////////////////////////////////////////////////////////////////////////

    let brush = d3.brushX().extent([[0, 0], [rangeWidth, rangeHeight]]).on('brush', brushed);

    // console.log('breakpoint_4');

    // se definen lineas
    ////////////////////////////////////////////////////////////////////////////

    let chartLine = d3.line().curve(d3.curveMonotoneX).x((d) => chartScaleX(d.date)).y((d) => chartScaleY(d.value)),
        rangeLine = d3.line().curve(d3.curveMonotoneX).x((d) => rangeScaleX(d.date)).y((d) => rangeScaleY(d.value));

    // console.log('breakpoint_5');

    // se crea SVG
    ////////////////////////////////////////////////////////////////////////////
    let svg, defs, background;

    svg = d3.select(`#${ _chartData.id } .chart-svg`).append('svg')
      .attr('width', chartWidth + chartMargin.left + chartMargin.right)
      .attr('height', chartHeight + chartMargin.top + chartMargin.bottom);

    defs = svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      // .attr('transform', `translate(${ chartMargin.left }, 0)`)
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    background = svg.append('rect')
      .attr('class', 'chart-background')
      .attr('width', chartWidth + chartMargin.left + chartMargin. right)
      .attr('height', chartHeight + chartMargin.top + 30);

    STORAGE.charts[_chartData.id]['svg'] = svg;

    // console.log('breakpoint_6');

    // se crea contenedor del gráfico
    ////////////////////////////////////////////////////////////////////////////
    let chartContainer, chartLines, dots;

    chartContainer = svg.append('g')
      .attr('class', 'chart-container')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);
    chartContainer.append('g')
      .attr('class', 'chart-line-0')
      .append('line')
      .attr('x1', 0)
      .attr('x2', chartWidth)
      .attr('y1', chartScaleY(0))
      .attr('y2', chartScaleY(0));
    chartContainer.append('g')
      .attr('class', 'chart-axis-x')
      .attr('transform', `translate(0, ${ chartHeight })`)
      .call(chartAxisX);
    chartContainer.append('g')
      .attr('class', 'chart-axis-y')
      .call(chartAxisY);

    chartLines = chartContainer.selectAll('.chart-line')
      .data(STORAGE.charts[_chartData.id].data)
      .enter().append('g')
      .attr('class', 'chart-line');
    chartLines.append('path')
      .attr('stroke-dasharray', (d, i) => { return parseTypeLine(_chartData.indicators[i].type); })
      .attr('d', (d) => chartLine(d.values))
      .style('stroke', (d, i) => _chartData.indicators[i].color)
      .attr('clip-path', 'url(#clip)');

    // dots = chartContainer.selectAll('.chart-dots')
    //   .data(STORAGE.charts[_chartData.id].data)
    //   .enter().append('g')
    //   .attr('class', 'chart-dots')
    //   .style('fill', 'black')
    //   .selectAll('circle')
    //   .data((d) => d.values)
    //   .enter().append('circle')
    //   .attr('clip-path', 'url(#clip)')
    //   .attr('cx', (d) => chartScaleX(d.date))
    //   .attr('cy', (d) => chartScaleY(d.value));

    // console.log('breakpoint_7');

    // se crea contenedor del rango dinámico
    ////////////////////////////////////////////////////////////////////////////
    let rangeContainer, rangeLines, startBrush, endBrush;

    rangeContainer = svg.append('g')
      .attr('class', 'range-container')
      .attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);

    rangeContainer.append('g')
      .attr('class', 'range-axis-x')
      .attr('transform', `translate(0, ${ rangeHeight })`)
      .call(rangeAxisX);

    startBrush = rangeContainer.append('g')
      .attr('class', 'start-brush-date')
      .attr('text-anchor', 'end')
      .attr('transform', `translate(${ rangeScaleX(date) }, ${ rangeHeight + 15 })`);
    startBrush.append('rect')
      .attr('height', '20px')
      .attr('transform', 'translate(0, -15)')
      .attr('fill', 'white');
    startBrush.append('text');

    endBrush = rangeContainer.append('g')
      .attr('class', 'end-brush-date')
      .attr('text-anchor', 'start')
      .attr('transform', `translate(${ chartWidth }, ${ rangeHeight + 15 })`);
    endBrush.append('rect')
      .attr('height', '20px')
      .attr('transform', 'translate(-7.5, -15)')
      .attr('fill', 'white');
    endBrush.append('text');

    rangeLines = rangeContainer.selectAll('.range-line')
      .data(STORAGE.charts[_chartData.id].data)
      .enter().append('g')
      .attr('class', 'range-line');
    rangeLines.append('path')
      .attr('d', (d) => rangeLine(d.values))
      .style('stroke', (d, i) => _chartData.indicators[i].color);

    rangeContainer.append('g')
      .attr('class', 'range-brush')
      .call(brush)
      .call(brush.move, [rangeScaleX(date), chartWidth]);
    // console.log('breakpoint_8');

    // se crea tooltip de linea vertical
    ////////////////////////////////////////////////////////////////////////////

    let tooltipLine = svg.append('g')
      .attr('class', 'chart-tooltip')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

    tooltipLine.append('path')
      .attr('class', 'tooltip-line')
      .style('opacity', 0);

    let tooltipIndicator = tooltipLine.selectAll('.tooltip-indicator')
      .data(STORAGE.charts[_chartData.id].data)
      .enter().append('g')
      .attr('class', 'tooltip-indicator')
      .style('opacity', 0);

    tooltipIndicator.append('circle')
      .attr('transform', 'translate(0, 2)')
      .style('fill', (d, i) => _chartData.indicators[i].color);

    let boxText = tooltipIndicator.append('g')
      .attr('class', 'boxText');

    boxText.append('rect')
      .attr('rx', 15)
      .attr('ry', 15)
      .style('fill', (d, i) => _chartData.indicators[i].color);

    boxText.append('text');

    let tooltipDate = tooltipLine.append('g')
      .attr('class', 'tooltip-date')
      .attr('opacity', 0);

    tooltipDate.append('rect');

    tooltipDate.append('text');

    tooltipLine.append('rect')
      .attr('class', 'tooltip-rect-space')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .attr('pointer-events', 'all')
      .on('mouseover',  function() {
        d3.select(this.parentNode).select('.tooltip-line').transition().style('opacity', '1');
        d3.select(this.parentNode).selectAll('.tooltip-indicator').transition().style('opacity', '1');
        d3.select(this.parentNode).selectAll('.tooltip-date').transition().style('opacity', '1');
      })
      .on('mouseout',   function() {
        d3.select(this.parentNode).select('.tooltip-line').transition().style('opacity', 0);
        d3.select(this.parentNode).selectAll('.tooltip-indicator').transition().style('opacity', 0);
        d3.select(this.parentNode).selectAll('.tooltip-date').transition().style('opacity', 0);
      })
      .on('mousemove',  function() {
        let lines         = this.parentNode.parentNode.querySelectorAll('.chart-line path'),
            chart_tooltip = d3.select(this.parentNode),
            mouse         = d3.mouse(this),
            dateMouse     = moment(chartScaleX.invert(mouse[0])),
            date_event    = searchProximityPoint(dateMouse),
            datePoint     = chartScaleX(date_event),
            dateValues    = getValuesToDate(_data, date_event),
            spaceWidth    = d3.select('.tooltip-rect-space').attr('width');

        chart_tooltip.select('.tooltip-line')
          .attr('d', () => `M ${ datePoint }, 0 V ${ chartHeight }`);
        chart_tooltip.selectAll('.tooltip-indicator')
          .attr('transform', (d, i) => `translate(${ datePoint }, ${ chartScaleY((dateValues[i] === undefined)?(0):(dateValues[i])) })`);
        chart_tooltip.selectAll('.tooltip-indicator text')
          .text((d, i) => `${ formatNumberD3(dateValues[i]) } - ${ d.name }`)
          .attr('text-anchor', (datePoint < (spaceWidth / 2))?('start'):('end'))
          .attr('transform', (datePoint < (spaceWidth / 2))?('translate(25, 7)'):('translate(-25, 7)'));
        chart_tooltip.selectAll('.tooltip-indicator rect')
          .attr('width', (d, i) => this.parentNode.querySelectorAll('.tooltip-indicator text')[i].getBBox().width + 30)
          .attr('y', -10)
          .attr('x', (d, i) => (datePoint < (spaceWidth / 2))?(10):(-(10 + this.parentNode.querySelectorAll('.tooltip-indicator text')[i].getBBox().width + 30)));
        chart_tooltip.select('.tooltip-date')
          .attr('transform', `translate(${ datePoint }, ${ chartHeight + 5 })`);
        chart_tooltip.select('.tooltip-date text')
          .text(parseFormatDate(_chartData.frequency, date_event, true));
        chart_tooltip.select('.tooltip-date rect')
          .attr('width', this.parentNode.querySelector('.tooltip-date text').getBBox().width + 30)
          .attr('transform', `translate(-${ (this.parentNode.querySelector('.tooltip-date text').getBBox().width + 30) / 2}, -1)`);

        tooltipsCollapse(_chartData.id);
      });

    // console.log('breakpoint_9');

    // se agregan referencias
    ////////////////////////////////////////////////////////////////////////////

    addReferences(_chartData, containerChart);

    // console.log('breakpoint_10');

    function searchProximityPoint(date) {
      let distances = _data.map((v, k) => [Math.pow(moment(v.date).diff(date), 2), v.date]); // [diff, date]
          distances.sort((a, b) => { return (a[0] - b[0]); });

      return distances[0][1];
    }
    function getValuesToDate(data, date) {
      let values = d3.values(data.filter((d) => d.date === date)[0]);
          values.splice(0, 1);

      return values;
    }
    function tooltipsCollapse(chart) {
      // console.log(chart);
      function updateTranslatePositionY(element) {
        return element.getAttribute('transform').split('(')[1].split(')')[0].split(',').map((v) => parseFloat(v.trim()));
      }
      function orderAscPosition(a, b) {
        var aPosition = updateTranslatePositionY(a)[1],
            bPosition = updateTranslatePositionY(b)[1];

        if (aPosition < bPosition) {
          return 1;
        } else {
          return -1;
        }
      }
      function orderDescPosition(a, b) {
        var aPosition = updateTranslatePositionY(a)[1],
            bPosition = updateTranslatePositionY(b)[1];

        if (aPosition > bPosition) {
          return 1;
        } else {
          return -1;
        }
      }

      // se seleccionan todos los indicadores del gráfico
      var elements = document.querySelectorAll(`#${ chart } .tooltip-indicator`),
          elements_asc = [], elements_desc = [];

      document.querySelectorAll(`#${ chart } .tooltip-indicator .boxText`).forEach((v) => {
        v.setAttribute('transform', 'translate(0, 0)');
      });

      elements.forEach((v) => {
        elements_asc.push(v);
        elements_desc.push(v);
      });

      // se obtienen las posiciones de cada indicador
      elements_asc.sort(orderDescPosition);
      elements_desc.sort(orderAscPosition);

      // console.log(elements_asc);
      // console.log(elements_desc);

      // se hace pasada 1
      var count = 0;
      var force = 0;

      elements_asc.forEach((v, k) => {

        if (k !== elements_asc.length - 1) {
          let start         = elements_asc[k],
              startPosition = updateTranslatePositionY(start)[1],
              end           = elements_asc[k + 1],
              endPosition   = updateTranslatePositionY(end)[1],
              diff          = endPosition - startPosition,
              minHeight     = 30;

          // console.log('posicion original', startPosition, endPosition);
          // console.log('diferencia', diff, 'acumulado', count);
          // console.log('diferencia real', diff - count);
          // console.log('resultado', (diff - count) < minHeight);

          if ((diff - count) < minHeight) {
            count += (30 - diff);
            elements_asc[k + 1].querySelector('.boxText').setAttribute('transform', `translate(0, ${ count })`);
          }
        }
      });

      // console.log(count);

      // se hace pasada 2
      elements_desc.forEach((v, k) => {
        if (k !== elements_desc.length - 1) {
          let start         = elements_desc[k],
              startPosition = updateTranslatePositionY(start)[1],
              end           = elements_desc[k + 1],
              endPosition   = updateTranslatePositionY(end)[1],
              diff          = startPosition - endPosition,
              minHeight     = 30,
              minPosY       = 0,
              maxPosY       = document.querySelector(`#${ chart } .tooltip-rect-space`).getBoundingClientRect().height - minHeight / 2;

          // console.log(v);
          // console.log('limite', minPosY, maxPosY);
          // console.log('posicion original', startPosition + count, endPosition + count);

          if ((startPosition + count) > maxPosY) {
            force = (startPosition + count) - maxPosY;
          }

          // console.log('forzar', force);
          let transform = updateTranslatePositionY(elements_desc[k].querySelector('.boxText'));
          transform[1] -= force;

          elements_desc[k].querySelector('.boxText').setAttribute('transform', `translate(${ transform[0] }, ${ transform[1] })`);
        }
      });
    }
    function brushed() {
      let position, range, min, max, minExt, maxExt;
      // console.log('brush_1');
      if (d3.event.selection) {
        position = d3.event.selection;
        range = position.map(rangeScaleX.invert, rangeScaleX);
        // console.log('brush_2');
        // Se actualiza rango-x
        chartScaleX.domain(range);
        // console.log('brush_3');
        // Se actualizan fecha mínima y máxima del eje x en rangeContainer
        let startBrush = d3.select(this.parentNode)
          .select('.start-brush-date')
          .attr('transform', `translate(${ position[0] }, ${ rangeHeight + 15 })`);
        // console.log('brush_4');
        startBrush.select('.start-brush-date text')
          .text(parseFormatDate(_chartData.frequency, range[0], true));
        // console.log('brush_5');
        let widthStartBrush = this.parentNode.querySelector('.start-brush-date text').getBBox().width;
        // console.log('brush_6');
        startBrush.select('.start-brush-date rect')
            .attr('width', widthStartBrush + 15)
            .attr('x', -((widthStartBrush + 15) / 2) - (widthStartBrush / 2));
        // console.log('brush_7');
        let endBrush = d3.select(this.parentNode)
          .select('.end-brush-date')
          .attr('transform', `translate(${ position[1] }, ${ rangeHeight + 15 })`);
        // console.log('brush_8');
        endBrush.select('.end-brush-date text')
          .text(parseFormatDate(_chartData.frequency, range[1], true));
        // console.log('brush_9');
        let widthEndBrush = this.parentNode.querySelector('.end-brush-date text').getBBox().width;
        // console.log('brush_10');
        endBrush.select('.end-brush-date rect')
            .attr('width', widthEndBrush + 15);
        // console.log('brush_11');

        // Se actualizan fecha mínima y máxima del eje x en rangeContainer
        let dataFiltered = _data.filter((d) => (d.date < range[1] && d.date > range[0]));
        STORAGE.charts[this.parentNode.parentNode.parentNode.parentNode.getAttribute('id')].data_range = dataFiltered;

        // Si el switch esta en on, hace algo, sino, hace otra cosa.
        if (this.parentNode.parentNode.parentNode.parentNode.querySelector('.rangeButton-button').getAttribute('state') === 'on') {
          // console.log(dataFiltered.length);
          if (dataFiltered.length > 1) {

            // Se actualiza rango-y
            chartScaleY.domain(generateRangeYDinamic(this.parentNode.parentNode.parentNode.parentNode.getAttribute('id')));

            chartContainer.select('.chart-line-0 line').attr('y1', chartScaleY(0)).attr('y2', chartScaleY(0));
          }
        }
        // console.log('brush_12');
        chartContainer.selectAll('.chart-line path').attr('d', (d) => chartLine(d.values));
        // chartContainer.selectAll('.chart-dots circle').attr('cx', (d) => chartScaleX(d.date)).attr('cy', (d) => chartScaleY(d.value));
        chartContainer.select('.chart-axis-x').call(chartAxisX);
        chartContainer.select('.chart-axis-y').call(chartAxisY);
        // console.log('brush_13');
      }
    }
    function redraw() {
      let charts;
      // se actualiza ancho total
      totalWidth = document.querySelector('#chartsContainer').offsetWidth;
      // se actualiza ancho del gráfico
      chartWidth  = totalWidth - chartMargin.left - chartMargin.right;
      // se actualiza ancho del rango
      rangeWidth  = totalWidth - rangeMargin.left - rangeMargin.right;
      // se actualiza escala en x del gráfico
      chartScaleX.range([0, chartWidth]);
      // se actualiza escala en x del rango
      rangeScaleX.range([0, rangeWidth]);

      //chartAxisX = d3.axisBottom(chartScaleX);
      //rangeAxisX = d3.axisBottom(rangeScaleX);

      // se actualiza brush component
      brush.extent([[0, 0], [rangeWidth, rangeHeight]]);
      // se actualiza el ancho de todos los gráficos
      charts = d3.selectAll('.chart-svg svg');
      charts.attr('width', chartWidth + chartMargin.left + chartMargin.right);
      // se actualiza el ancho de todos los defs
      charts.select('defs').attr('width', chartWidth);
      // se actualiza el ancho de todos los background
      charts.select('.chart-background').attr('width', chartWidth + chartMargin.left + chartMargin. right);
      // se actualiza la posición del gráfico
      charts.select('.chart-container').attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);
      // se actualiza el ancho de la linea en la posición 0 del eje y
      charts.select('.chart-container').select('.chart-line-0 line').attr('x2', chartWidth);
      // se actualiza el ancho de la linea del gráfico
      charts.select('.chart-container').selectAll('.chart-line path').attr('d', (d) => chartLine(d.values));
      // se actualiza el ancho del axis en x del gráfico
      charts.select('.chart-container').select('.chart-axis-x').call(chartAxisX);
      // se actualiza la posición del rango
      charts.select('.range-container').attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);
      // se actualiza el ancho de la linea del rango
      charts.select('.range-container').selectAll('.range-line path').attr('d', (d) => rangeLine(d.values));
      // se actualiza el ancho del axis en x del rango
      charts.select('.range-container').select('.range-axis-x').call(rangeAxisX);
      // se actualiza la posición de la fecha inicial seleccionada en el rango
      charts.select('.range-container').select('.start-brush-date').attr('transform', `translate(${ rangeScaleX(date) }, ${ rangeHeight + 15 })`);
      // se actualiza la posición de la fecha final seleccionada en el rango
      charts.select('.range-container').select('.end-brush-date').attr('transform', `translate(${ chartWidth }, ${ rangeHeight + 15 })`);
      // se actualiza el ancho del brush
      charts.select('.range-container').select('.range-brush').call(brush).call(brush.move, [rangeScaleX(date), chartWidth]);
    }
    function changeSwitchPosition(activeButton, id) {
      let container = activeButton.parentNode,
          state = container.getAttribute('state');
      // console.log(state);

      if (state === 'on') {
        container.querySelectorAll('button')[0].setAttribute('state', 'active');
        container.querySelectorAll('button')[1].setAttribute('state', '');
        container.querySelector('.switch-effect').setAttribute('style', 'left: 2px;');
        container.setAttribute('state', 'off');

        updateAxisY(generateRangeYStatic(id.getAttribute('id')), id.getAttribute('id'));
      } else {
        container.querySelectorAll('button')[0].setAttribute('state', '');
        container.querySelectorAll('button')[1].setAttribute('state', 'active');
        container.querySelector('.switch-effect').setAttribute('style', 'left: calc(50% - 2px);');
        container.setAttribute('state', 'on');

        updateAxisY(generateRangeYDinamic(id.getAttribute('id')), id.getAttribute('id'));
      }
    }
    window.changeSwitchPosition = changeSwitchPosition;
    function updateAxisY(domain, id) {
      console.log('dominio', domain);
      chartScaleY.domain(domain);

      d3.select(`#${ id }`).select('.chart-line-0 line').attr('y1', chartScaleY(0)).attr('y2', chartScaleY(0));
      d3.select(`#${ id }`).select('.chart-axis-y').call(chartAxisY);
      d3.select(`#${ id }`).selectAll('.chart-line path').attr('d', (d) => {console.log(d);return chartLine(d.values);});
    }
    function generateRangeYStatic(chart_id) {
      let minValue = d3.min(STORAGE.charts[chart_id].data_chart, (c) => {
            let values = d3.values(c);
                values.splice(0, 1);

            return d3.min(values);
          }),
          maxValue = d3.max(STORAGE.charts[chart_id].data_chart, (c) => {
            let values = d3.values(c);
              values.splice(0, 1);

            return d3.max(values);
          }),
          minExtend = minValue - ((maxValue - minValue) / 15),
          maxExtend = maxValue + ((maxValue - minValue) / 15);
      console.log('se calculó el rango total', [minExtend, maxExtend]);
      return [minExtend, maxExtend];
    }
    function generateRangeYDinamic(chart_id) {
      let minValue = d3.min(STORAGE.charts[chart_id].data_range, (c) => {
            let values = d3.values(c);
                values.splice(0, 1);

            return d3.min(values);
          }),
          maxValue = d3.max(STORAGE.charts[chart_id].data_range, (c) => {
            let values = d3.values(c);
              values.splice(0, 1);

            return d3.max(values);
          }),
          minExtend = minValue - ((maxValue - minValue) / 15),
          maxExtend = maxValue + ((maxValue - minValue) / 15);
      console.log('se calculó el rango parcial', [minExtend, maxExtend]);
      return [minExtend, maxExtend];
    }

    window.addEventListener('resize', redraw);
  }
  // OK - Esta función ejecuta el proceso de renderizado de los gráficos.
  function generateCharts(_element) {
    let id = _element.parentNode.getAttribute('id'),
        chartsContainer = document.querySelector('#chartsContainer #charts');
        chartsContainer.innerHTML = '';

    renderPreviewCharts(chartsContainer, id);
  }

// Esta función renderiza las tarjetas.
////////////////////////////////////////////////////////////////////////////////
function generateMiniChart(_cardData, _element) {
  let data = STORAGE[_cardData.id],
      container = d3.select(_element);

  ////////////////////////////////////////////////////////////////////////////
  // Render Mini-LineChart
  ////////////////////////////////////////////////////////////////////////////

  // variables
  ////////////////////////////////////////////////////////////////////////////
  let totalHeight = 50,
      totalWidth  = 100,
      chartMargin = {top: 10, right: 10, bottom: 10, left: 10};

  data = data.data.filter((d) => (d[1] !== null));
  let chartData = data.slice(-5);
  let dataDot = data.slice(-1);

  // parámetros del gráfico
  ////////////////////////////////////////////////////////////////////////////
  let minValue = d3.min(chartData, (d) => d[1]),
      maxValue = d3.max(chartData, (d) => d[1]);
      // minExtend = minValue - ((maxValue - minValue) / 15),
      // maxExtend = maxValue + ((maxValue - minValue) / 15);

  let chartWidth  = totalWidth - chartMargin.left - chartMargin.right,
      chartHeight = totalHeight - chartMargin.top - chartMargin.bottom,
      chartScaleX = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(chartData, (d) => new Date(d[0]))),
      chartScaleY = d3.scaleLinear().range([chartHeight, 0]).domain([minValue, maxValue]);

  // se definen lineas
  ////////////////////////////////////////////////////////////////////////////

  let chartLine = d3.line().curve(d3.curveMonotoneX).x((d) => chartScaleX(new Date(d[0]))).y((d) => chartScaleY(d[1]));

  // se crea SVG
  ////////////////////////////////////////////////////////////////////////////
  let svg, defs, background;

  svg = container.append('svg')
    .attr('width', chartWidth + chartMargin.left + chartMargin.right)
    .attr('height', chartHeight + chartMargin.top + chartMargin.bottom);

  // se crea contenedor del gráfico
  ////////////////////////////////////////////////////////////////////////////
  let chartContainer, chartLines, dots;

  chartContainer = svg.append('g')
    .attr('class', 'chart-container')
    .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);
  chartLines = chartContainer.append('g').attr('class', 'chart-line');
  chartLines.append('path')
    .attr('stroke-width', 3)
    .style('stroke', 'silver')
    .attr('d', (d) => chartLine(chartData));
  console.log(data);
  console.log(dataDot);
  let lastDot = chartContainer.append('g')
    .style('fill', Modal.variables.colors.gobar_dark)
    .selectAll('circle')
    .data(dataDot)
    .enter().append('circle')
    .attr('r', 4)
    .attr('cx', (d) => chartScaleX(new Date(d[0])))
    .attr('cy', (d) => chartScaleY(d[1]));
}

function renderAllCards() {

  STORAGE.cards.forEach((card) => {

    let cardComponent = document.createElement('div');
        cardComponent.setAttribute('id', card.id);
        cardComponent.classList.add('card');
        cardComponent.innerHTML = `<h3>${ card.title }</h3>
                                   <div class="break-line"><br><br><hr><br><br></div>
                                   <h4>${ card.short_name }</h4>
                                   <div class="break-line"><br></div>
                                   <p id="frequency"></p>
                                   <div class="break-line"><br><br></div>
                                   <p id="units_representation"></p>
                                   <div class="break-line"><br></div>
                                   <p id="units"></p>
                                   <div class="break-line"><br></div>
                                   <div id="mini-chart"></div>
                                   <div class="break-line"><br><br><br></div>
                                   <button class="button" onclick="changeView('charts'); generateCharts(this);">
                                      <span class="button-waves">Ver más gráficos</span>
                                   </button>
                                   <div class="break-line"><br></div>
                                   <a href="${ card.download_url }" class="link" download><i class="fa fa-download" aria-hidden="true"></i> Descargar datos</a>
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
            cardComponent.querySelector('#frequency').innerHTML = parseFormatDate(metadata.frequency, data[data.length - 1][0], true);
            cardComponent.querySelector('#units_representation').innerHTML = parseValueIndicator(card.units_representation, data[data.length - 1][1]);
            cardComponent.querySelector('#units').innerHTML = metadata.units;
            cardComponent.querySelector('.loading').remove();

        generateMiniChart(card, cardComponent.querySelector('#mini-chart'));
      });
  });
}
function renderOnlyCard(_cardId, _chartId) {
  console.log('render only card');
  STORAGE.cards.forEach((_card) => {
    if (_cardId === _card.id) {
      _card.charts.forEach((_chart) => {
        if (_chart.id === _chartId) {
          console.log(_chart);
          let chartComponente = document.createElement('div');
              chartComponente.setAttribute('id', _chart.id);
              chartComponente.classList.add('chart');
              chartComponente.innerHTML = `<div class="head">
                                              <h3>${ _chart.title }</h3>
                                              <div class="break-line"><br></div>
                                              <p class="paragraph">${ _chart.description }</p>
                                              <div class="break-line"><br></div>
                                           </div>
                                           <div class="referenceContainer">
                                             <div class="break-line"><br></div>
                                             <span id="references"></span>
                                             <div class="break-line"><br></div>
                                           </div>
                                           <div class="rangeButton">
                                            <div class="break-line"><br></div>
                                            <div class="rangeButton-component">
                                              <div class="rangeButton-text">Escala:</div>
                                              <div class="rangeButton-button" state="off">
                                              <button onclick="changeSwitchPosition(this, ${ _chart.id })" state="active">Estática</button>
                                              <button onclick="changeSwitchPosition(this, ${ _chart.id })" state="">Dinámica</button>
                                                <div class="switch-effect" style="left: 2px;"></div>
                                              </div>
                                            </div>
                                            <div class="break-line"><br></div>
                                           </div>
                                           <div class="chart-svg"></div>
                                           <div class="break-line"><br></div>
                                           <div class="modal-share">
                                              <input id="share-${ _chart.id }" type="checkbox" class="share-open">
                                              <label for="share-${ _chart.id }" class="share-open-button hamburger-dark">
                                                <span class="hamburger-1"></span>
                                                <span class="hamburger-2"></span>
                                                <span class="hamburger-3"></span>
                                              </label>
                                              <button class="share-item button buttonCircle" title="embeber" onclick="shareEmbebed(this, '${ _cardId }')" style="background-color: gray; color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-code" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                              <button class="share-item button buttonCircle" title="descargar" onclick="shareDownload(this, '${ _cardId }')" style="background-color: gray; color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-download" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                            </div>
                                            <div class="loading flex">
                                             <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
                                            </div>`;

          window.document.querySelector('#app #chartsContainer #charts').append(chartComponente);

          STORAGE.charts[_chart.id] = { container:  chartComponente };

          downloadChart(_chart);
        }
      })
    }
  });
}

// Esta función inicia la aplicación.
////////////////////////////////////////////////////////////////////////////////

function start(_card = null, _indicator = null) {
  if (_card === null || _indicator === null) {
    downloadFile('./public/data/cards.json', 'cards').then(renderAllCards);
  } else {
    downloadFile('./public/data/cards.json', 'cards').then(() => { renderOnlyCard(_card, _indicator); });
  }
}

// Is Document Ready
////////////////////////////////////////////////////////////////////////////////

window.document.onload = checkGetRequest();
