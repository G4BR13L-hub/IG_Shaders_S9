# Shader Generativo: Cimática y Figuras de Chladni

Shader de fragmentos en GLSL compatible con el editor de **The Book of Shaders**, desarrollado bajo la restricción *tiny code* (**477 bytes**).

---

## 1. Motivación

Esta propuesta se inspira en los experimentos acústicos de **Ernst Chladni (1787)** y el campo de la **cimática**. Al hacer vibrar una placa metálica cubierta de arena a distintas frecuencias de resonancia, los granos se desplazan hacia las **líneas nodales**, es decir, zonas donde la vibración es nula, revelando patrones geométricos simétricos.

El objetivo de este shader es trasladar ese fenómeno físico al plano digital en tiempo real. Sustituir la arena por filamentos de luz que mutan de forma continua y visualizar, al mismo tiempo, el campo de ondas que se propaga por las zonas vibrantes en el fondo.

---

## 2. Código del Shader

### Versión Minificada (*Tiny Code* — 477 bytes)
*Medido sobre el código completo, incluyendo la declaración de precisión y los `uniforms`, sin comentarios.*

```glsl
precision mediump float;uniform vec2 u_resolution;uniform float u_time;void main(){vec2 p=(gl_FragCoord.xy*2.-u_resolution)/u_resolution.y;float t=u_time*.5,n=2.+sin(t)*.8,m=5.+cos(t*.7)*1.5,k=3.1416,v=cos(n*p.x*k)*cos(m*p.y*k)-cos(m*p.x*k)*cos(n*p.y*k),r=length(p);vec3 b=(.5+.5*cos(6.283*(v*.25+r*.3-t*.3+vec3(.5,.65,.8))))*(.18+.12*sin(r*10.-t*4.+v*3.)),c=(.5+.5*cos(6.283*(r*.25-t*.2+vec3(0.,.18,.38))))*(.04/(abs(v)+.02))*exp(-r*.35)+b*exp(-r*.2);gl_FragColor=vec4(c,1.);}
```

### Versión Legible y Comentada

```glsl
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Centramos las coordenadas en pantalla
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

    float t = u_time * 0.5;

    // Frecuencias que cambian con el tiempo (sin llegar a coincidir)
    float n = 2.0 + sin(t) * 0.8;
    float m = 5.0 + cos(t * 0.7) * 1.5;

    // Fórmula de Chladni para crear el patrón simétrico
    float pi = 3.1416;
    float v = cos(n * p.x * pi) * cos(m * p.y * pi)
            - cos(m * p.x * pi) * cos(n * p.y * pi);

    // Distancia al centro
    float r = length(p);

    // Fondo animado con ondas que se expanden desde el centro
    float pulsoFondo = 0.18 + 0.12 * sin(r * 10.0 - t * 4.0 + v * 3.0);
    vec3 paletaFondo = 0.5 + 0.5 * cos(6.283 * (v * 0.25 + r * 0.3 - t * 0.3 + vec3(0.5, 0.65, 0.8)));
    vec3 fondo = paletaFondo * pulsoFondo;

    // Líneas brillantes principales
    float nodos = 0.04 / (abs(v) + 0.02);
    vec3 paletaNodos = 0.5 + 0.5 * cos(6.283 * (r * 0.25 - t * 0.2 + vec3(0.0, 0.18, 0.38)));

    // Mezclamos todo y oscurecemos un poco los bordes
    vec3 color = paletaNodos * nodos * exp(-r * 0.35) + fondo * exp(-r * 0.2);

    gl_FragColor = vec4(color, 1.0);
}
```

---

## 3. Desarrollo Técnico

1. **Normalización de coordenadas:**
   Se transforman las coordenadas de píxel (`gl_FragCoord.xy`) mediante `(gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y`. Esto sitúa el origen `(0.0, 0.0)` en el centro del lienzo y mantiene la relación de aspecto en cualquier resolución.

2. **Ecuación de Chladni y control de frecuencias:**
   La amplitud de la onda estacionaria en 2D se calcula con la expresión:
   `v = cos(n * p.x * pi) * cos(m * p.y * pi) - cos(m * p.x * pi) * cos(n * p.y * pi)`
   * Los parámetros `n` y `m` representan los modos de vibración y se animan con funciones seno y coseno de distinta velocidad (`t` y `t * 0.7`) para evitar repeticiones monótonas.
   * Sus rangos son disjuntos (`n` oscila entre `1.2` y `2.8`; `m` entre `3.5` y `6.5`). De este modo nunca se cumple `n == m`, evitando que la ecuación se anule en todo el plano y provoque un destello blanco uniforme.

3. **Extracción de líneas nodales (*glow*):**
   Las líneas nodales aparecen donde `v ≈ 0`. Al evaluar `0.04 / (abs(v) + 0.02)`, los valores cercanos a cero se convierten en picos de luz intensos, mientras que el término `+ 0.02` evita divisiones por cero y controla el grosor del halo luminoso.

4. **Fondo dinámico (campo de resonancia):**
   Para dar profundidad a las zonas entre nodos, se genera un fondo reactivo con ondas radiales expansivas (`sin(r * 10.0 - t * 4.0 + v * 3.0)`) deformadas por la propia vibración `v`. Se utiliza una intensidad baja (`0.18 ± 0.12`) y un desfase cromático distinto para no restar protagonismo a las líneas principales.

5. **Color procedural y composición:**
   Tanto las líneas nodales como el fondo emplean paletas paramétricas de cosenos (`0.5 + 0.5 * cos(6.283 * (...))`), generando transiciones suaves sin necesidad de definir colores estáticos. Por último, `exp(-r * 0.35)` y `exp(-r * 0.2)` aplican una atenuación radial tipo viñeta que concentra la atención en el centro.

6. **Optimización *Tiny Code*:**
   Para reducir el código a **477 bytes**:
   * Se agruparon declaraciones del mismo tipo (`float` y `vec3`).
   * Se eliminaron espacios, saltos de línea, comentarios y directivas `#ifdef GL_ES`.
   * Se usaron identificadores de una sola letra y literales flotantes compactos (`.5`, `2.`, `0.`).

---

## 4. Fuentes y Referencias

* **Chladni, E. F. F. (1787).** *Entdeckungen über die Theorie des Klanges*. Base física de las figuras nodales en placas vibrantes.
* **Bourke, P. (2001).** *Chladni Plate Mathematics*. Formulación matemática 2D aplicada a gráficos generativos.
* **Gonzalez Vivo, P., & Lowe, J. (2015).** *The Book of Shaders* ([thebookofshaders.com](https://thebookofshaders.com/)). Entorno de ejecución, `uniforms` estándar y normalización de coordenadas.
* **Quilez, I.** *Procedural Color Palettes* ([iquilezles.org/articles/palettes](https://iquilezles.org/articles/palettes/)). Referencia para las paletas de color basadas en funciones coseno.
