# [Landing IED](http://datosgobar.github.io/landing-ied)

Lorem Ipsum es simplemente el texto de relleno de las imprentas y archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar de las industrias desde el año 1500, cuando un impresor (N. del T. persona que se dedica a la imprenta) desconocido usó una galería de textos y los mezcló de tal manera que logró hacer un libro de textos especimen.

## Instalación y Compilación
El sitio está hosteado en [GitHub Pages](https://pages.github.com/).

Para levantar un entorno, hace falta tener instalado [node](https://nodejs.org/es/) y [npm](https://www.npmjs.com/).

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

## Uso
En la ruta `./build/data` se encuentra el archivo `cards.json` que nos permite configurar todos los parametros de las tarjetas. El archivo contiene una estructura de `objetos` similar a la siguiente:

```bash
{
    "id": "",
    "title": "",
    "download_url": "",
    "short_name": "",
    "units_representation": "",
    "laps": "",
    "charts": [{
        "id": "",
        "title": "",
        "description": "",
        "type": "",
        "frequency": "",
        "laps": "",
        "indicators": [{
            "id": "",
            "short_name": "",
            "color": "",
            "type": ""
        }]
    }]
}
```
[Ver un ejemplo completo del archivo cards.json](https://github.com/datosgobar/landing-ied/blob/master/build/data/cards.json)

### Composición de las tarjetas:

```bash
{
    "id":                   "11.3_VIPAA_2004_M_31",
    "title":                "Nivel de actividad",
    "download_url":         "http://www.economia.gob.ar/download/infoeco/actividad_ied.xlsx",
    "short_name":           "EMAE",
    "units_representation": "1",
    "laps":                 "5",
    "charts":               []
}
```

- id: Define el indicador que se quiere mostrar en la tarjeta principal. IMPORTANTE: El id debe coincidir con el nombre del archivo.
- title: Representa el titulo que se muestra en la tarjeta principal. Se recomienda restringir la cantidad de caracteres a XXXX.
- download_url: Contiene la URL de descarga del archivo.
- short_name: Representa el nombre del indicador. Se recomienda restringir la cantidad de caracteres a XXXX.
- units_representation: Define la transformación del valor recibido por el indicador. Las opciones disponibles son:
    - "%" multiplica el valor * 100,
    - "1" no recibe ninguna transformación
- laps: Define la cantidad de per´íodos a graficar en la tarjeta. Estos periodos se corresponden con la unidad de frecuencia y toman los datos m´ás actualizados. Ej.: Una serie de frecuencia mensual (R/P1M) con un laps = 24 graficar´á los ´últimos 24 meses con datos disponibles.
- charts: Es un `array` que contiene "objetos chart" que definen un conjunto de propiedades necesarias para generar un gr´áfico. 

Gráfico

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

- id: Define un nombre único para representar el grafico. IMPORTANTE: El id debe ser único en todos los casos.
- title: Representa el titulo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a XXXX.
- description: Representa el párrafo que se muestra en la tarjeta del gráfico. Se recomienda restringir la cantidad de caracteres a XXXX.
- type: Define el tipo de gráfico que se va a dibujar. Por el momento, `line` es el único valor disponible.
- frequency: Define la frecuencia de datos del gráfico. Las opciones disponibles son [linkear a estandar iso 8601]:
    - "R/P1Y" para frecuencias anuales,
    - "R/P6M" para frecuencias semestrales,
    - "R/P3M" para frecuencias trimestrales,
    - "R/P1M" para frecuencias mensuales,
    - "R/P1D" para frecuencias diarias
- laps: Define la cantidad de per´íodos a graficar en la tarjeta. Estos periodos se corresponden con la unidad de frecuencia y toman los datos m´ás actualizados. Ej.: Una serie de frecuencia mensual (R/P1M) con un laps = 24 graficar´á los ´últimos 24 meses con datos disponibles.
- indicators: Contiene la información de los indicadores.

```bash
{
    "id": "4.2_OGP_2004_T_17",
    "short_name": "PBI",
    "color": "#FF6100",
    "type": "solid"
}
```

- id: Define el indicador que se quiere graficar. IMPORTANTE: El id debe coincidir con el nombre del archivo.
- short_name: Representa el nombre del indicador. Se recomienda restringir la cantidad de caracteres a XXXX.
- color: Define el color del indicador en el gráfico. Se recomienda utilizar la siguiente paleta de colores:
    - color 1
    - color 2
- type: Define el tipo de linea del indicador en el gráfico. Las opciones disponibles son:
    - "solid" para lineas solidas
    - "dashed" para lineas punteadas

En la ruta `./build/data` se encuentra el archivo `createdBy.json` que representa en un formato json, toda la información de configuración de los créditos del iframe.

A continuación vamos a ver algunos ejemplos de como configurar cada elemento del archivo:

```bash
{
  "name": "Ministerio de Hacienda",
  "redirect_url": "https://datosgobar.github.io/landing-ied/"
}
```

- name: Representa el texto del enlace que se muestra debajo del iframe.
- redirect_url: Contiene la url a la que apunta en enlace del iframe.



explicacion de url publica y url local

explicar estructura del archivo y que campos usa la app

## Contacto
Te invitamos a [crearnos un issue](https://github.com/datosgobar/landing-ied/issues/new) en caso de que encuentres algún bug o tengas feedback de alguna parte del sitio de `landing-ied`.
Para todo lo demás, podés mandarnos tu comentario o consulta a [datos@modernizacion.gob.ar](mailto:datos@modernizacion.gob.ar).

## Licencia
MIT license