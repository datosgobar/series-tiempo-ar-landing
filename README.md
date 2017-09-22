# [Landing de Series de Tiempo](http://datosgobar.github.io/series-tiempo-landing)

Landing web modular y parametrizada para publicar datos y gráficos basados en bases de series de tiempo.

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

Los ejemplos utilizados en este repositorio para mostrar su uso y funcionalidades están basados en el rediseño de la landing de [Información Económica al Día](https://www.minhacienda.gob.ar/secretarias/politica-economica/programacion-macroeconomica/), primer caso de uso de este proyecto.

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

Para modificar el código, usar los archivos del directorio `./build/` y luego compilar con `Gulp`:

```bash
$ gulp compile
```

También se puede generar watches con el comando:

```bash
$ gulp watch
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
        "indicators": [
            {"id": "4.2_OGP_2004_T_17", "short_name": "PBI", "color": "#FF6100", "type": "solid"},
            {"id": "4.2_OGP_2004_T_18", "short_name": "PBI", "color": "#FF6100", "type": "solid"}
        ],
        "frequency": "R/P3M",
        "laps": "24"
    }, {
        "id": "chart_2",
        "title": "Oferta y Demanda Globales por componente.",
        "description": "En millones de pesos, a precios de 2004.",
        "type": "line",
        "indicators": [
            {"id": "4.2_OGP_2004_T_17", "short_name": "PBI", "color": "#FF6100", "type": "solid"},
            {"id": "4.2_OGP_2004_T_18", "short_name": "PBI", "color": "#FF6100", "type": "solid"}
        ],
        "frequency": "R/P3M",
        "laps": "24"
    }]
}]
```
[Ver ejemplo completo del archivo cards.json](https://github.com/datosgobar/landing-ied/blob/master/build/data/cards.json)

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
- **laps**: Define la cantidad de períodos a graficar en la tarjeta. Estos periodos se corresponden con la unidad de frecuencia y toman los datos más actualizados. Ej.: Una serie de frecuencia mensual (R/P1M) con un laps = 24 graficará los últimos 24 meses con datos disponibles.
- **button**: Permite definir un texto y una url personalizada para el botón de la tarjeta.
- **charts**: Es un `array` que contiene "objetos chart" que definen un conjunto de propiedades necesarias para generar un gráfico.

#### Composición de los gráficos (objetos `chart`)

```bash
{
    "id": "chart_1",
    "title": "Producto Bruto Interno.",
    "description": "En millones de pesos, a precios de 2004.",
    "type": "line",
    "frequency": "R/P3M",
    "laps": "24",
    "indicators": []
}
```

- **id**: Define un nombre único para representar el grafico.
- **title**: Representa el titulo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a 40.
- **description**: Representa el párrafo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a 90.
- **type**: Define el tipo de gráfico que se va a dibujar. Por el momento, `line` es el único valor disponible.
- **frequency**: Define la frecuencia de datos del gráfico bajo el estandar [ISO 8601]('https://www.iso.org/iso-8601-date-and-time-format.html'). Las opciones disponibles son:
    - "R/P1Y" para frecuencias anuales.
    - "R/P6M" para frecuencias semestrales.
    - "R/P3M" para frecuencias trimestrales.
    - "R/P1M" para frecuencias mensuales.
    - "R/P1D" para frecuencias diarias.
- **laps**: Define la cantidad de períodos a graficar en el gráfico. Estos periodos se corresponden con la unidad de frecuencia y toman los datos más actualizados. Ej.: Una serie de frecuencia mensual (R/P1M) con un laps = 24 graficará los últimos 24 meses con datos disponibles.
- **indicators**: Es un `array` que contiene "objetos indicator" que definen un conjunto de propiedades necesarias para generar un indicador.

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
    "credits": "",
    "credits_url": "",
    "path_files": "",
    "path_cards": "",
    "path_datasets": ""
}
```

- **credits**: Representa el texto del enlace que se muestra cuando se genera un iframe.
- **credits_url**: Contiene la url a la que apunta en enlace del iframe.
- **path_files**: Contiene la ruta de acceso a los archivos de indicadores (la fuente de los datos).
- **path_cards**: Contiene la ruta de acceso al archivo de configuración de las tarjetas.
- **path_datasets**: Contiene la ruta de acceso al archivo de configuración de los datasets.

### Datos (series de tiempo)

#### Fuente

La aplicación está programada para realizar 2 solicitudes `GET`.

* En primer instancia, busca el archivo del indicador en la ruta definida en el campo, `path_files` (se recomienda que sea una `URL` externa a la aplicación).
* Si la primer solicitud falla, genera una nueva solicitud al archivo local, por defecto `./public/data/series`. En caso de no encontrar el archivo en ambas solicitudes, devuelve un error en la vista.

Al solicitar un archivo de indicador se espera encontrar, al menos, que estén los siguientes campos:

#### Estructura

```bash
{
    "data": [
        ["2004-01-01T00:00:00.000Z", 49687.3421906],
        ["2004-04-01T00:00:00.000Z", 52072.2779573],
        ["2004-07-01T00:00:00.000Z", 53720.8162569]
    ],
    "metadata": {
        "field_units": "Millones de pesos a precios de 2004"
        "distribution_index_frequency": "R/P3M",
        "field_id": "4.2_DGCP_2004_T_30",
    }
}
```

[Ver ejemplo completo de un indicador](https://github.com/datosgobar/landing-ied/blob/master/build/data/cards.json).

#### Metadatos utilizados por la aplicación

- **data**: Es un `array` que contiene `arrays` con el formato `[fecha, valor]`. Estos datos son utilizados para renderizar el gráfico.
- **metadata**: Es un `array` que contiene información contextual del indicador.
    - *field_units*: Este campo se utiliza para mostrar el tipo de unidad del indicador.
    - *distribution_index_frequency*: Este campo se utiliza para definir la frecuencia del indicador.
    - *field_id*: Este campo se utiliza para referenciar al indicador dentro de la aplicación.

## Contacto

Te invitamos a [crearnos un issue](https://github.com/datosgobar/landing-ied/issues/new) en caso de que encuentres algún bug o tengas feedback de alguna parte del sitio de `landing-ied`.
Para todo lo demás, podés mandarnos tu comentario o consulta a [datos@modernizacion.gob.ar](mailto:datos@modernizacion.gob.ar).

## Licencia

MIT license
