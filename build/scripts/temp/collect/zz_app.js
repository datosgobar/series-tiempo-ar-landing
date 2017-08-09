// Se define una constante en donde se va a alojar toda la data.
////////////////////////////////////////////////////////////////////////////////

const STORAGE = {};

// Firebase
////////////////////////////////////////////////////////////////////////////////

function startFirebaseService() {
  firebase.initializeApp({
               apiKey: 'AIzaSyDbLZWG2xFkyP8BZz7dfJF5daK9F3KwJJ4',
           authDomain: 'analytical-park-149313.firebaseapp.com',
          databaseURL: 'https://analytical-park-149313.firebaseio.com',
            projectId: 'analytical-park-149313',
        storageBucket: 'analytical-park-149313.appspot.com',
    messagingSenderId: '215411573688'
  });

  return firebase.storage().ref();
}

var firebase_storage = startFirebaseService();

// Funciones Globales
////////////////////////////////////////////////////////////////////////////////

// Actualizado 04.08.2017 - Genera una cadena de texto aleatoria.
function generateToken(length) {
  let text = '',
      possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
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
// Actualizado 04.08.2017 - Permite compartir uns imagen en redes sociales
function share(social, element) {
  let renderNode = element.parentNode.parentNode,
      date = new Date();

  // Generar imagen Uint8Array
  let w = renderNode.offsetWidth,
      h = renderNode.offsetHeight,
      imgW = 1024,
      imgH = 512;

  domtoimage.toBlob(renderNode, {height: imgH, width: imgW}).then((file) => {

    console.log(file);

    let url = firebaseStorage.child(`${ date.getTime() }${ generateToken(10) }`)
      .put(file)
      .then((snapshot) => {
        let github = 'https://datosgobar.github.io/landing-ied/';
        let url = 'https%3A%2F%2Fdatosgobar.github.io%2Flanding-ied%2Fpublic%2Fimages%2Fmodule.png';
        // let url = snapshot.metadata.downloadURLs[0];

        console.log(`${ date.getTime() }${ generateToken(10) }`);

        console.log(url);

        switch (social) {
          case 'facebook': window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${ github }&picture=${ url }`, 'pop', 'width=600, height=260, scrollbars=no'); break;
          // case 'twitter': window.open(`https://twitter.com/share?save.snapshot.downloadURL=https://datosgobar.github.io/GDE&image=${ url }`, 'pop', 'width=600, height=260, scrollbars=no'); break;
        }
      });
  });
}

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

        charts.forEach((chart, index) => {

          let chartComponente = document.createElement('div');
              chartComponente.setAttribute('id', chart.id);
              chartComponente.classList.add('chart');
              chartComponente.innerHTML = `<div class="head">
                                              <h3>${ chart.title }</h3>
                                              <div class="break-line"><br></div>
                                              <p class="paragraph">${ chart.description }</p>
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
                                              <div>
                                                <button>Estática</button>
                                                <button>Dinámica</button>
                                              </div>
                                            </div>
                                            <div class="break-line"><br></div>
                                           </div>

                                           <div class="chart-svg"></div>
                                           <div class="break-line"><br></div>
                                           <div class="modal-share">
                                              <input id="share-${ charts[index].id }" type="checkbox" class="share-open">
                                              <label for="share-${ charts[index].id }" class="share-open-button hamburger-dark">
                                                <span class="hamburger-1"></span>
                                                <span class="hamburger-2"></span>
                                                <span class="hamburger-3"></span>
                                              </label>
                                              <button class="share-item buttonEmbebed button buttonCircle" title="Embeber sección" onclick="embebedContainerShow(this)" style="background-color: black; color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-code" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                              <button class="share-item button buttonCircle" title="Compartir en Twitter" onclick="share('twitter', this)" style="background-color: rgb(29, 161, 242); color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-twitter" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                              <button class="share-item button buttonCircle" title="Compartir en Facebook" onclick="share('facebook', this)" style="background-color: rgb(59, 89, 152); color: white; right: 0px;">
                                                <span class="buttonCircleSmall boton_efecto">
                                                  <i class="fa fa-facebook" aria-hidden="true"></i>
                                                </span>
                                              </button>
                                            </div>
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

        group[value[0]][indicator.short_name] = value[1];
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

    // Se agregan referencias en HTML
    ////////////////////////////////////////////////////////////////////////////
    chart.indicators.forEach((v) => {
      let container = document.querySelector(`#${ chart.id } #references`),
          reference = document.createElement('p');
          reference.innerHTML = `<div class="reference-circle" style="background-color: ${ v.color }"></div> ${ v.short_name }`;
          container.append(reference);
    });

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

    let dataset = chart.indicators.map((d) => {
      return {
        name: d.short_name,
        values: data.map((c) => {
          return {
            date: c.date,
            value: (c[d.short_name] !== undefined) ? (+c[d.short_name]) : (0)
          };
        })
      };
    }),
    totalWidth = chartsContainer.getBoundingClientRect().width,
    minValue = d3.min(dataset, (c) => d3.min(c.values, (v) => v.value)),
    maxValue = d3.max(dataset, (c) => d3.max(c.values, (v) => v.value)),
    minExtend = minValue - ((maxValue - minValue) / 15),
    // maxExtend = maxValue + ((maxValue - minValue) / 15),
    minDate = d3.min(dataset, (c) => d3.min(c.values, (v) => v.date)),
    maxDate = d3.max(dataset, (c) => d3.max(c.values, (v) => v.date));

    let indice = dataset[0].values.length - 1 - chart.laps;
        indice = (indice < 0) ? (0) : (indice);

    let date = dataset[0].values[indice].date;

    // parámetros del gráfico
    ////////////////////////////////////////////////////////////////////////////

    let chartWidth  = totalWidth - chartMargin.left - chartMargin.right,
        chartHeight = totalHeight - chartMargin.top - chartMargin.bottom,
        chartScaleX = d3.scaleTime().range([0, chartWidth]).domain(d3.extent(data, (d) => d.date)),
        chartScaleY = d3.scaleLinear().range([chartHeight, 0]).domain([minExtend, maxValue]),
        chartAxisX  = d3.axisBottom(chartScaleX),
        chartAxisY  = d3.axisLeft(chartScaleY);

    // parámetros del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let rangeWidth  = totalWidth - rangeMargin.left - rangeMargin.right,
        rangeHeight = totalHeight - rangeMargin.top - rangeMargin.bottom,
        rangeScaleX = d3.scaleTime().range([0, rangeWidth]).domain(chartScaleX.domain()),
        rangeScaleY = d3.scaleLinear().range([rangeHeight, 0]).domain(chartScaleY.domain()),
        rangeAxisX  = d3.axisBottom(rangeScaleX).tickValues([new Date(minDate), new Date(maxDate)]).tickFormat((d) => parseFormatDate(chart.frequency, d, true)),
        rangeAxisY  = d3.axisLeft(rangeScaleY);

    // brush
    ////////////////////////////////////////////////////////////////////////////

    let brush = d3.brushX()
      .extent([[0, 0], [rangeWidth, rangeHeight]])
      .on('brush', brushed);

    // escala de colores de lineas
    ////////////////////////////////////////////////////////////////////////////

    // let colorLines = d3.scaleOrdinal()
    //   .domain(chart.indicators.map((d) => d.short_name))
    //   .range(chart.indicators.map((d) => d.color));

    // se definen lineas
    ////////////////////////////////////////////////////////////////////////////

    let chartLine = d3.line().curve(d3.curveMonotoneX).x((d) => chartScaleX(d.date)).y((d) => chartScaleY(d.value)),
        rangeLine = d3.line().curve(d3.curveMonotoneX).x((d) => rangeScaleX(d.date)).y((d) => rangeScaleY(d.value));

    // se crea SVG
    ////////////////////////////////////////////////////////////////////////////

    let svg = d3.select(`#${ chart.id } .chart-svg`).append('svg')
      .attr('width', chartWidth + chartMargin.left + chartMargin.right)
      .attr('height', chartHeight + chartMargin.top + chartMargin.bottom);

    let defs = svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', chartWidth)
      .attr('height', chartHeight);

    let svg_background = svg.append('rect')
      .attr('class', 'chart-background')
      .attr('width', chartWidth + chartMargin.left + chartMargin. right)
      .attr('height', chartHeight + chartMargin.top + 30);

    // se crea contenedor del gráfico
    ////////////////////////////////////////////////////////////////////////////

    let chartContainer = svg.append('g')
      .attr('class', 'chart-container')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

    // TODO - La posición de la linea no esta siempre en la posición 0 del eje-y. Además, no se actualiza cuando de modifica el eje-x.
    let chart_line_0 = chartContainer.append('g')
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

    let chartLines = chartContainer.selectAll('.chart-line')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'chart-line');

    let chartLines_line = chartLines.append('path')
      .attr('stroke-dasharray', (d, i) => { return parseTypeLine(chart.indicators[i].type); })
      .attr('d', (d) => chartLine(d.values))
      .style('stroke', (d, i) => chart.indicators[i].color)
      .attr('clip-path', 'url(#clip)');

    let dots = chartContainer.selectAll('.chart-dots')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'chart-dots')
      .style('fill', 'black')
      .selectAll('circle')
      .data((d) => d.values)
      .enter().append('circle')
      .attr('clip-path', 'url(#clip)')
      .attr('cx', (d) => chartScaleX(d.date))
      .attr('cy', (d) => chartScaleY(d.value));

    // se crea contenedor del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    let rangeConteiner = svg.append('g')
      .attr('class', 'range-container')
      .attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);

    let rangeLines = rangeConteiner.selectAll('.range-line')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'range-line');

    rangeLines.append('path')
      .attr('d', (d) => rangeLine(d.values))
      .style('stroke', (d, i) => chart.indicators[i].color);

    rangeConteiner.append('g')
      .attr('class', 'range-axis-x')
      .attr('transform', `translate(0, ${ rangeHeight })`)
      .call(rangeAxisX);

    // TODO - Mover esto a D3
    let startBrush = rangeConteiner.append('g')
      .attr('class', 'start-brush-date')
      .attr('text-anchor', 'end')
      .attr('transform', `translate(${ rangeScaleX(date) }, ${ rangeHeight + 15 })`);

    startBrush.append('rect')
      .attr('height', '20px')
      .attr('transform', 'translate(0, -15)')
      .attr('fill', 'white');

    startBrush.append('text');

    // TODO - Mover esto a D3
    let endBrush = rangeConteiner.append('g')
      .attr('class', 'end-brush-date')
      .attr('text-anchor', 'start')
      .attr('transform', `translate(${ chartWidth }, ${ rangeHeight + 15 })`);

    endBrush.append('rect')
      .attr('height', '20px')
      .attr('transform', 'translate(-7.5, -15)')
      .attr('fill', 'white');

    endBrush.append('text');

    rangeConteiner.append('g')
      .attr('class', 'range-brush')
      .call(brush)
      .call(brush.move, [rangeScaleX(date), chartWidth]);

    // se crea contenedor del rango dinámico
    ////////////////////////////////////////////////////////////////////////////

    // let legend = svg.append('g')
    //   .attr('class', 'legends')
    //   .attr('transform', `translate(${ -chartWidth + 75 }, 10)`)
    //   .selectAll('.legend')
    //   .data(dataset)
    //   .enter().append('g')
    //   .attr('class', 'legend');
    //
    // legend.append('rect')
    //   .attr('x', chartWidth - 20)
    //   .attr('y', (d, i) => i * 20)
    //   .attr('width', 10)
    //   .attr('height', 10)
    //   .style('fill', (d) => colorLines(d.short_name));
    //
    // legend.append('text')
    //   .attr('x', chartWidth - 8)
    //   .attr('y', (d, i) => (i * 20) + 9)
    //   .text((d) => d.short_name);

    ////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////

    // Vertical Line
    let tooltipLine = svg.append('g')
      .attr('class', 'chart-tooltip')
      .attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

    tooltipLine.append('path')
      .attr('class', 'tooltip-line')
      .style('opacity', 0);

    let tooltipIndicator = tooltipLine.selectAll('.tooltip-indicator')
      .data(dataset)
      .enter().append('g')
      .attr('class', 'tooltip-indicator')
      .style('opacity', 0);

    tooltipIndicator.append('circle')
      .attr('transform', 'translate(0, 2)')
      .style('fill', (d, i) => chart.indicators[i].color);

    let boxText = tooltipIndicator.append('g')
      .attr('class', 'boxText');

    boxText.append('rect')
      .style('fill', (d, i) => chart.indicators[i].color);

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
        console.log('event action');
        let lines     = this.parentNode.parentNode.querySelectorAll('.chart-line path'),
            mouse     = d3.mouse(this),
            dateMouse = chartScaleX(mouse[0]),
            datePoint = '';

        console.log(mouse);
        console.log(dateMouse);
        console.log(datePoint);


        d3.select(this.parentNode).select('.tooltip-line').attr('d', () => `M ${ mouse[0] }, 0 V ${ chartHeight }`);
        d3.select(this.parentNode).selectAll('.tooltip-indicator')
          .attr('transform', (d, i) => {
            let xDate  = chartScaleX.invert(mouse[0]),
                bisect = d3.bisector((d) => d.date).right,
                idx    = bisect(d.values, xDate),
                spaceWidth = d3.select('.tooltip-rect-space').node().getBBox().width;

            let beginning = 0,
                end       = lines[i].getTotalLength(),
                target    = null,
                pos;

            while (true) {
              target = Math.floor((beginning + end) / 2);
              pos = lines[i].getPointAtLength(target);

              if ((target === end || target === beginning) && pos.x !== mouse[0]) {
                break;
              }

              if (pos.x > mouse[0]) {
                end = target;
              } else if (pos.x < mouse[0]) {
                beginning = target;
              } else {
                break;
              }
            }

            d3.select(this.parentNode).selectAll('.tooltip-indicator text').filter((v, k) => (k === i))
              .text((d) => `${ formatNumberD3(chartScaleY.invert(pos.y)) } - ${ d.name }`)
              .transition().duration(100)
              .attr('text-anchor', (d, i) => {

                if (pos.x < (spaceWidth / 2)) {
                  return 'start';
                } else {
                  return 'end';
                }
              })
              .attr('transform', (d, i) => {

                if (pos.x < (spaceWidth / 2)) {
                  return 'translate(25, 7)';
                } else {
                  return 'translate(-25, 7)';
                }
              });

            let widthBackgroundTooltip =
            d3.select(this.parentNode).selectAll('.tooltip-indicator rect')
              .transition().duration(100)
              .attr('x', (d, i) => {

                if (pos.x < (spaceWidth / 2)) {
                  return 10;
                } else {
                  return - (10 + this.parentNode.querySelectorAll('.tooltip-indicator text')[i].getBBox().width + 30);
                }
              })
              .attr('y', -10)
              .attr('width', (d, i) => this.parentNode.querySelectorAll('.tooltip-indicator text')[i].getBBox().width + 30);

            d3.select(this.parentNode).select('.tooltip-date')
              .attr('transform', `translate(${ pos.x }, ${ chartHeight + 5 })`);

            d3.select(this.parentNode).select('.tooltip-date text')
              .text(parseFormatDate(chart.frequency, chartScaleX.invert(pos.x), true));

            let w = this.parentNode.querySelector('.tooltip-date text').getBBox().width + 30;

            d3.select(this.parentNode).select('.tooltip-date rect')
              .attr('width', w)
              .attr('transform', `translate(-${w / 2}, -1)`);

            return `translate(${ mouse[0] }, ${ pos.y })`;
          });

        tooltipsCollapse(chart.id);
      });

      function tooltipsCollapse(chart) {
        function orderAscPosition(a, b) {
          var aPosition = a.transform.baseVal['0'].matrix.f,
              bPosition = b.transform.baseVal['0'].matrix.f;

          if (aPosition < bPosition) {
            return 1;
          } else {
            return -1;
          }
        }
        function orderDescPosition(a, b) {
          var aPosition = a.transform.baseVal['0'].matrix.f,
              bPosition = b.transform.baseVal['0'].matrix.f;

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
                startPosition = start.transform.baseVal['0'].matrix.f,
                end           = elements_asc[k + 1],
                endPosition   = end.transform.baseVal['0'].matrix.f,
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

        // se hace pasada 2
        elements_desc.forEach((v, k) => {
          if (k !== elements_desc.length - 1) {
            let start         = elements_desc[k],
                startPosition = start.transform.baseVal['0'].matrix.f,
                end           = elements_desc[k + 1],
                endPosition   = end.transform.baseVal['0'].matrix.f,
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

            elements_desc[k].querySelector('.boxText').transform.baseVal['0'].matrix.f -= force;
          }
        });
      }

    //create brush function redraw scatterplot with selection
    function brushed() {
      let position, range, min, max, minExt, maxExt;

      if (!d3.event.selection) {
        // selection = rangeScaleX.range();
        // console.log('sin seleccion');
        // chartScaleX.domain(selection);
      } else {
        position = d3.event.selection;
        range = position.map(rangeScaleX.invert, rangeScaleX);

        // Se actualiza rango-x
        chartScaleX.domain(range);

        // Se actualizan fecha mínima y máxima del eje x en rangeContainer
        let startBrush = d3.select(this.parentNode)
          .select('.start-brush-date')
          .attr('transform', `translate(${ position[0] }, ${ rangeHeight + 15 })`);

        startBrush.select('.start-brush-date text')
          .text(parseFormatDate(chart.frequency, range[0], true));

        let widthStartBrush = this.parentNode.querySelector('.start-brush-date text').getBBox().width;

        startBrush.select('.start-brush-date rect')
            .attr('width', widthStartBrush + 15)
            .attr('x', -((widthStartBrush + 15) / 2) - (widthStartBrush / 2));

        let endBrush = d3.select(this.parentNode)
          .select('.end-brush-date')
          .attr('transform', `translate(${ position[1] }, ${ rangeHeight + 15 })`);

        endBrush.select('.end-brush-date text')
          .text(parseFormatDate(chart.frequency, range[1], true));

        let widthEndBrush = this.parentNode.querySelector('.end-brush-date text').getBBox().width;

        endBrush.select('.end-brush-date rect')
            .attr('width', widthEndBrush + 15);

        // Se actualizan fecha mínima y máxima del eje x en rangeContainer
        let dataFiltered = data.filter((d) => (d.date < range[1] && d.date > range[0]));

        // console.log(dataFiltered.length);

        if (dataFiltered.length > 1) {

          // console.log('calcula');

          min = d3.min(dataFiltered, (c) => {
              let values = d3.values(c);
                  values.splice(0, 1);

              return d3.min(values);
            }
          );
          max = d3.max(dataFiltered, (c) => {
              let values = d3.values(c);
                  values.splice(0, 1);

              return d3.max(values);
            }
          );

          // maxExt = max + ((max - min) / 15);
          minExt = min - ((max - min) / 15);

          // Se actualiza rango-y
          chartScaleY.domain([minExt, max]);

          chartContainer.select('.chart-line-0 line').attr('y1', chartScaleY(0)).attr('y2', chartScaleY(0));
        }

        chartContainer.selectAll('.chart-line path').transition().duration(100).attr('d', (d) => chartLine(d.values));
        chartContainer.selectAll('.chart-dots circle').transition().duration(100).attr('cx', (d) => chartScaleX(d.date)).attr('cy', (d) => chartScaleY(d.value));
        chartContainer.select('.chart-axis-x').transition().duration(100).call(chartAxisX);
        chartContainer.select('.chart-axis-y').transition().duration(100).call(chartAxisY);
      }
    }

    function redraw() {
      // console.log(chartComponent);

      totalWidth = chartsContainer.getBoundingClientRect().width;

      chartWidth  = totalWidth - chartMargin.left - chartMargin.right;
      chartScaleX.range([0, chartWidth]);
      //chartAxisX = d3.axisBottom(chartScaleX);

      rangeWidth  = totalWidth - rangeMargin.left - rangeMargin.right;
      rangeScaleX.range([0, rangeWidth]);
      //rangeAxisX = d3.axisBottom(rangeScaleX);

      brush.extent([[0, 0], [rangeWidth, rangeHeight]]);

      svg.attr('width', chartWidth + chartMargin.left + chartMargin.right);

      defs.attr('width', chartWidth);

      svg_background.attr('width', chartWidth + chartMargin.left + chartMargin. right);

      chartContainer.attr('transform', `translate(${ chartMargin.left }, ${ chartMargin.top })`);

      chart_line_0.attr('x2', chartWidth);

      chartLines.selectAll('path').attr('d', (d) => chartLine(d.values));

      chartContainer.select('.chart-axis-x').call(chartAxisX);

      chartContainer.selectAll('.chart-dots circle').attr('cx', (d) => chartScaleX(d.date));

      rangeConteiner.attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);

      rangeLines.selectAll('path').attr('d', (d) => rangeLine(d.values));

      rangeConteiner.select('.range-axis-x').call(rangeAxisX);

      rangeConteiner = svg.selectAll('.range-container').attr('transform', `translate(${ rangeMargin.left }, ${ rangeMargin.top })`);

      rangeLines.selectAll('path').attr('d', (d) => rangeLine(d.values));

      rangeConteiner.select('.range-axis-x').call(rangeAxisX);

      startBrush.attr('transform', `translate(${ rangeScaleX(date) }, ${ rangeHeight + 15 })`);

      endBrush.attr('transform', `translate(${ chartWidth }, ${ rangeHeight + 15 })`);

      rangeConteiner.select('.range-brush').call(brush).call(brush.move, [rangeScaleX(date), chartWidth]);
    }

    window.addEventListener('resize', redraw);
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
                                   <h4>${ card.short_name }</h4>
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
      });
  });
}

// Esta función inicia la aplicación.
////////////////////////////////////////////////////////////////////////////////

function start() {
  downloadFile('./public/data/cards.json', 'cards').then(renderCards);
}

// Is Document Ready
////////////////////////////////////////////////////////////////////////////////

window.document.onload = start();
