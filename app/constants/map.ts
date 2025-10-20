// Dimensiones del mapa en píxeles
// Estas deben coincidir con las dimensiones reales de la imagen en /public
// mapa_relieve_espana_peq.jpg: 736x523 píxeles
export const MAP_WIDTH = 736;
export const MAP_HEIGHT = 523;

// Proporción de aspecto del mapa
export const MAP_ASPECT_RATIO = MAP_WIDTH / MAP_HEIGHT; // ~1.407

// Altura recomendada del contenedor para mantener proporciones
// Si el ancho es 100%, la altura debe ajustarse proporcionalmente
export const CONTAINER_HEIGHT = 600; // Altura base en px
