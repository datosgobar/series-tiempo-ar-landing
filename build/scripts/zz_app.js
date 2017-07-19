// Global Variables
////////////////////////////////////////////////////////////////////////////////
let gdata = {};

// Global Functions
////////////////////////////////////////////////////////////////////////////////

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
              attr:       {href: '#details'},
              styles:     {width: '100%'},
              childrens:  [
                Modal.add.button({
                  settings: {type: 'roundSmall', text: 'Ver más graficos'},
                  attr:     {id: v.id, onclick: 'generateCharts(this); animateAnchor("#details");'}
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

const animateAnchor = (target) => $('body').animate({ scrollTop: $(target).offset().top }, 500);

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
          styles:   {width: '100%', border: '1px solid red', height: '100vh', boxSizing: 'border-box'},
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
