# [Landing de Series de Tiempo](http://datosgobar.github.io/series-tiempo-ar-landing)

Landing web modular y parametrizada para armar un dashboard de indicadores con datos y gráficos, basado en la [API de Series de Tiempo de la República Argentina](http://series-tiempo-ar-api.readthedocs.io/).

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Indice

- [Instalación y Compilación](#instalaci%C3%B3n-y-compilaci%C3%B3n)
- [Esquema](#esquema)
- [Uso](#uso)
  - [cards.json](#cardsjson)
    - [Composición de las tarjetas (objetos `card`)](#composici%C3%B3n-de-las-tarjetas-objetos-card)
    - [Composición de los gráficos (objetos `chart`)](#composici%C3%B3n-de-los-gr%C3%A1ficos-objetos-chart)
    - [Composición de los indicadores (objetos `indicator`)](#composici%C3%B3n-de-los-indicadores-objetos-indicator)
  - [datasets.json](#datasetsjson)
  - [params.json](#paramsjson)
  - [Datos (series de tiempo)](#datos-series-de-tiempo)
    - [Fuente](#fuente)
    - [Estructura](#estructura)
    - [Metadatos utilizados por la aplicación](#metadatos-utilizados-por-la-aplicaci%C3%B3n)
- [Contacto](#contacto)
- [Licencia](#licencia)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Los ejemplos utilizados en este repositorio para mostrar su uso y funcionalidades están basados en el rediseño de la landing del [Ministerio de Hacienda](https://www.minhacienda.gob.ar/datos/), primer caso de uso de este proyecto.

El proyecto debe considerarse en **beta** y puede sufrir modificaciones sustanciales en su funcionalidad, interfaz o parámetros de configuración en el futuro.

## Instalación y Compilación

La landing de ejemplo está hosteada en [GitHub Pages](https://pages.github.com/), activado sobre el branch `master`.

Para levantar un entorno local, hace falta tener instalado [node](https://nodejs.org/es/) y [npm](https://www.npmjs.com/).

Clonar el repositorio, y dentro de la carpeta raíz, instalar las dependencias del archivo `package.json`:

```bash
$ sudo npm install
```

Modificar la variable `entorno` del archivo `Gulpfile.js`:

```bash
let entorno = 'prod'; // Producción
let entorno = 'dev';  // Desarrollo
```

Iniciar el servidor:

```bash
$ gulp server
```

Para que los cambios se apliquen automáticamente, iniciar con:
```bash
$ gulp start
```


Para modificar el código, usar los archivos del directorio `./build/` y luego compilar con `Gulp`:

```bash
$ gulp app_compile
```

También se puede generar watches con el comando:

```bash
$ gulp app_watches
```

Los archivos compilados se guardan en el directorio `./public/`.

## Esquema

La landing tiene 2 partes diferentes:

* **Pantalla principal** (*cards.json* y *datasets.json*)
    - Se pueden configurar **tarjetas temáticas** que permiten:
        + *Visualizar una serie* representativa de una temática
        + *Descargar un archivo* con datos sobre la temática
        + *Ver más gráficos* basados en series de tiempo de esa temática
    - Se pueden vincular **datasets** publicados en catálogos de datos que estén en una URL pública que contenga un *data.json* según la especificación del [perfil de metadatos](http://paquete-apertura-datos.readthedocs.io/es/stable/guia_metadatos.html#otros-catalogos) del [Paquete de Apertura de Datos](https://github.com/datosgobar/paquete-apertura-datos). Estos muestran:
        + *Titulo*, *descripción* y *link de acceso* al dataset
        + *Titulo*, *descripción* y *link de descarga* de distribuciones seleccionadas del dataset

* **Pantalla de visualización de indicadores** (`charts` dentro de *cards.json*)
    - Se pueden configurar **gráficos de series de tiempo** lineales que permiten visualizar 1 o más indicadores de la misma frecuencia temporal y con valores en la misma escala de unidades.

## Uso

### cards.json

En la ruta `./build/data` se encuentra el archivo `cards.json` que nos permite configurar todos los parámetros de las tarjetas y sus gráficos.

Podrás crear tantas tarjetas, gráficos e indicadores como desees. El archivo contiene una estructura de `objetos` similar a la siguiente:

```bash
[{
    "id": "11.3_VIPAA_2004_M_31",
    "title": "Nivel de actividad",
    "download_url": "http://www.example.com/download/actividad_ied.xlsx",
    "short_name": "EMAE",
    "units_representation": "1",
    "laps": "5",
    "button": {
      "text": "Ver informes",
      "url": "http://www.prueba.com"
    },
    "charts": [{
        "id": "chart_1",
        "title": "Producto Bruto Interno.",
        "description": "En millones de pesos, a precios de 2004.",
        "type": "line",
        "units_representation": "1",
        "indicators": [
            {"id": "4.2_OGP_2004_T_17", "short_name": "PBI", "color": "#FF6100", "type": "solid"},
            {"id": "4.2_OGP_2004_T_18", "short_name": "PBI", "color": "#FF6100", "type": "solid"}
        ],
        "frequency": "quarter",
        "laps": "24"
    }, {
        "id": "chart_2",
        "title": "Oferta y Demanda Globales por componente.",
        "description": "En millones de pesos, a precios de 2004.",
        "type": "line",
        "units_representation": "1",
        "indicators": [
            {"id": "4.2_OGP_2004_T_17", "short_name": "PBI", "color": "#FF6100", "type": "solid"},
            {"id": "4.2_OGP_2004_T_18", "short_name": "PBI", "color": "#FF6100", "type": "solid"}
        ],
        "frequency": "quarter",
        "laps": "24"
    }]
}]
```
[Ver ejemplo completo del archivo cards.json](https://github.com/datosgobar/series-tiempo-ar-landing/blob/master/build/data/cards.json)

#### Composición de las tarjetas (objetos `card`)

```bash
{
    "id":                   "11.3_VIPAA_2004_M_31",
    "title":                "Nivel de actividad",
    "download_url":         "http://www.example.com/download/actividad_ied.xlsx",
    "short_name":           "EMAE",
    "units_representation": "1",
    "laps":                 "5",
    "button": {
      "text":               "Ver informes",
      "url":                "http://www.prueba.com"
    },
    "charts":               []
}
```

- **id**: Define el indicador que se quiere mostrar en la tarjeta principal. IMPORTANTE: El id hace referencia al nombre del archivo del indicador.
- **title**: Representa el titulo que se muestra en la tarjeta principal. Se recomienda restringir la cantidad de caracteres a 30.
- **download_url**: Contiene la URL de descarga del archivo.
- **short_name**: Representa el nombre del indicador. Se recomienda restringir la cantidad de caracteres a 20.
- **units_representation**: Define la transformación del valor recibido por el indicador. Las opciones disponibles son:
    - "%" multiplica el valor * 100.
    - "1" no recibe ninguna transformación.
- **laps**: Define la cantidad de períodos a graficar en la tarjeta. Estos periodos se corresponden con la unidad de frecuencia y toman los datos más actualizados. Ej.: Una serie de frecuencia mensual (month) con un laps = 24 graficará los últimos 24 meses con datos disponibles.
- **button**: Permite definir un texto y una url personalizada para el botón de la tarjeta.
- **charts**: Es un `array` que contiene "objetos chart" que definen un conjunto de propiedades necesarias para generar un gráfico.

#### Composición de los gráficos (objetos `chart`)

```bash
{
    "id": "chart_1",
    "title": "Producto Bruto Interno.",
    "description": "En millones de pesos, a precios de 2004.",
    "type": "line",
    "units_representation": "1",
    "frequency": "quarter",
    "laps": "24",
    "indicators": []
}
```

- **id**: Define un nombre único para representar el grafico.
- **title**: Representa el titulo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a 40.
- **description**: Representa el párrafo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a 90.
- **type**: Define el tipo de gráfico que se va a dibujar. Por el momento, `line` es el único valor disponible.
- **units_representation**: Define la transformación del valor recibido por el indicador. Las opciones disponibles son:
    - "%" multiplica el valor * 100.
    - "1" no recibe ninguna transformación.
- **frequency**: Define la frecuencia de datos del gráfico bajo el estandar [ISO 8601]('https://www.iso.org/iso-8601-date-and-time-format.html'). Las opciones disponibles son:
    - "year" para frecuencias anuales.
    - "semester" para frecuencias semestrales.
    - "trimester" para frecuencias trimestrales.
    - "month" para frecuencias mensuales.
    - "day" para frecuencias diarias.
- **laps**: Define la cantidad de períodos a graficar en el gráfico. Estos periodos se corresponden con la unidad de frecuencia y toman los datos más actualizados. Ej.: Una serie de frecuencia mensual (month) con un laps = 24 graficará los últimos 24 meses con datos disponibles.
- **indicators**: Es un `array` que contiene "objetos indicator" que definen un conjunto de propiedades necesarias para generar un indicador. Es importante tener en cuenta que todos los indicadores del gráfico, deben tener la misma unidad de medida.

#### Composición de los indicadores (objetos `indicator`)

```bash
{
    "id": "4.2_OGP_2004_T_17",
    "short_name": "PBI",
    "color": "#FF6100",
    "type": "solid"
}
```

- **id**: Define el indicador que se quiere graficar. IMPORTANTE: El id hace referencia al nombre del archivo del indicador.
- **short_name**: Representa el nombre del indicador. Se recomienda restringir la cantidad de caracteres a 25.
- **color**: Define el color del indicador en el gráfico. Se recomienda utilizar el siguiente criterio:
    - color 1
    - color 2
- **type**: Define el tipo de linea del indicador en el gráfico. Las opciones disponibles son:
    - "solid" para lineas solidas
    - "dashed" para lineas punteadas

### datasets.json

En la ruta `./build/data` se encuentra el archivo `datasets.json` que nos permite configurar todos los párametros ... ?. El archivo contiene una estructura de `objetos` similar a la siguiente:

```bash
[
    {
        "catalog_url": "",
        "dataset_identifier": "",
        "dataset_landingPage": "",
        "distribution": [
          {
            "identifier": "",
            "title": ""
          }
        ]
    }
]
```

### params.json

En la ruta `./build/data` se encuentra el archivo `params.json` que nos permite configurar todos los párametros de la aplicación. El archivo contiene una estructura de `objetos` similar a la siguiente:

```bash
{
  "credits": "Ministerio de Hacienda",
  "credits_url": "https://datosgobar.github.io/series-tiempo-ar-landing/",
  "path_files": "http://apis.datos.gob.ar/series/api/series/?ids={serie_id}&limit=1000&sort=desc",
  "path_cards": "./public/data/cards.json",
  "path_datasets": "./public/data/datasets.json"
}
```

- **credits**: Representa el texto del enlace que se muestra cuando se genera un iframe.
- **credits_url**: Contiene la url a la que apunta en enlace del iframe.
- **path_files**: Contiene la ruta de acceso a los archivos de indicadores (la fuente de los datos). Es importante mencionar que en la ruta de acceso, se debe reemplazar el ID del indicador por el string `{serie_id}`. Por ejemplo, `http://apis.datos.gob.ar/series/api/series/?ids={serie_id}&limit=1000&sort=desc`. 
- **path_cards**: Contiene la ruta de acceso al archivo de configuración de las tarjetas.
- **path_datasets**: Contiene la ruta de acceso al archivo de configuración de los datasets.

### Datos (series de tiempo)

#### Fuente

La aplicación está programada para realizar 2 solicitudes `GET`.

* En primer instancia, busca el archivo del indicador en la ruta definida en el campo, `path_files` (se recomienda que sea una `URL` externa a la aplicación).
* Si la primer solicitud falla, genera una nueva solicitud al archivo local, por defecto `./public/data/series`. En caso de no encontrar el archivo en ambas solicitudes, devuelve un error en la vista.

**Para evitar que se rompa la experiencia web porque la API o URL externa no está disponible, se recomienda actualizar con cierta periodicidad una copia local de las series que sirve de respaldo** incluso aunque no esté constantemente actualizado.

Una instancia de esta landing, podría consultar directamente a la [API de Series de Tiempo de la República Argentina](http://series-tiempo-ar-api.readthedocs.io/) pero también podría:

* Consultar un servidor local o externo diferente que contenga una [instancia propia de la API](https://github.com/datosgobar/series-tiempo-ar-api).
* Consultar un servidor local o externo diferente que contenga consultas cacheadas a la API.
* Consultar un servidor local o externo diferente que contenga archivos JSON generados por otro sistema con la misma estructura que la API.

Al solicitar un archivo de indicador se espera encontrar, al menos, que estén los siguientes campos:

#### Estructura

```bash
{
  "data": [
    ["2015-12-01", 0.05],
    ["2015-11-01", 0.05],
    ["2015-10-01", 0.05],
    ["2015-09-01", 0.05],
    ["2015-08-01", 0.05],
    ["2015-07-01", 0.05],
    ["2015-06-01", 0.05],
    ["2015-05-01", 0.05],
    ["2015-04-01", 0.05],
    ["2015-03-01", 0.05],
    ["2015-02-01", 0.05],
    ["2015-01-01", 0.05],
    ["2014-12-01", 0.05],
    ["2014-11-01", 0.05],
    ["2014-10-01", 0.05],
    ["2014-09-01", 0.05],
    ["2014-08-01", 0.15],
    ["2014-07-01", 0.15],
    ["2014-06-01", 0.15],
    ["2014-05-01", 0.25],
    ["2014-04-01", 0.25],
    ["2014-03-01", 0.25],
    ["2014-02-01", 0.25],
    ["2014-01-01", 0.25]
  ],
  "meta": [
    {
      "frequency": "month",
      "start_date": "2018-06-01",
      "end_date": "1998-12-01"
    },
    {
      "catalog": {
        "title": "Datos Programación Macroeconómica"
      },
      "dataset": {
        "title": "Principales Tasas de Interés de Referencia",
        "issued": "2017-09-28",
        "source": "Bancos Centrales",
        "description": "Principales Tasas de Interés de Referencia de las principales economías del mundo. Frecuencia Mensual"
      },
      "distribution": {
        "title": "Principales tasas de Interés de Referencia de las principales economías del mundo. Valores mensuales",
        "downloadURL": "http://infra.datos.gob.ar/catalog/sspm/dataset/131/distribution/131.1/download/principales-tasas-interes-referencia-principales-economias-mundo-frecuencia-mensual.csv"
      },
      "field": {
        "description": "MRO (Main Refinancing Operations) - Zona Euro - Tasa",
        "units": "Porcentaje",
        "id": "131.1_MZT_0_0_18"
      }
    }
  ],
  "params": {
    "ids": "131.1_MZT_0_0_18",
    "limit": "1000",
    "sort": "desc",
    "identifiers": [
      {
        "id": "131.1_MZT_0_0_18",
        "distribution": "131.1",
        "dataset": "131"
      }
    ]
  }
}
```

[Ver ejemplo completo de un indicador](https://github.com/datosgobar/series-tiempo-ar-landing/blob/master/build/data/series/131.1_MZT_0_0_18.json).

#### Metadatos utilizados por la aplicación

- **data**: Es un `array` que contiene `arrays` con el formato `[fecha, valor]`. Estos datos son utilizados para renderizar el gráfico.
- **meta**: Es un `array` que contiene información contextual del indicador y de su índice de tiempo.

## Contacto

Te invitamos a [crearnos un issue](https://github.com/datosgobar/series-tiempo-ar-landing/issues/new) en caso de que encuentres algún bug o tengas feedback de alguna parte del sitio de `series-tiempo-ar-landing`.
Para todo lo demás, podés mandarnos tu comentario o consulta a [datos@modernizacion.gob.ar](mailto:datos@modernizacion.gob.ar).

## Licencia

MIT license
