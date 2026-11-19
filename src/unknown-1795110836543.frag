#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    // Centramos las coordenadas en pantalla
    vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;

    float t = u_time * 0.5;

    // Frecuencias que cambian con el tiempo sin llegar a coincidir
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