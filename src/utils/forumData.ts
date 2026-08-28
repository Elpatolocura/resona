export interface ForumComment {
  id: string;
  author: string;
  text: string;
  date: string;
  likes: number;
  likedByMe: boolean;
  replyTo?: string;
  replies?: ForumComment[];
}

export interface ForumPost {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  date: string;
  likes: number;
  likedByMe: boolean;
  images?: string[];
  video?: string;
  links?: { url: string; label: string }[];
  comments: ForumComment[];
}

export const FORUM_CATEGORIES = [
  { id: 'all', label: 'Todo', icon: 'MessagesSquare' },
  { id: 'movies', label: 'Películas', icon: 'Film' },
  { id: 'tv', label: 'Series', icon: 'Tv' },
  { id: 'music', label: 'Música', icon: 'Music' },
  { id: 'general', label: 'General', icon: 'Flame' },
];

export const INITIAL_POSTS: ForumPost[] = [
  {
    id: '108',
    title: 'Actualización v3.2 - TV en Vivo con EPG y PWA',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v3.1:

AHORA (v3.2):
- Guía de programación (EPG) en TV en Vivo
- Muestra programa actual, siguiente y barra de progreso
- Datos de iptv-org con decompression gzip
- Búsqueda de canales por nombre de programa
- Botón "Instalar Resona" para instalar como PWA
- Compatible con Android, iOS y escritorio
- Barra de búsqueda superior removida (usar /search)

PRÓXIMAMENTE:
• Notificaciones push
• Modo offline completo
• Ecualizador visual`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'],
    comments: [],
  },
  {
    id: '107',
    title: 'Actualización v3.1 - Anime y TV en Vivo colombiana',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v3.0:

AHORA (v3.1):
- Sección de Anime completa (pipeline de datos, rutas, páginas)
- Filtro de idioma para anime: Todos / Japonés / Español
- Búsqueda de anime integrada
- Reproducción de video para anime con embed providers
- TV en Vivo con canales colombianos (iptv-org)
- Selector de categorías para canales
- Reproductor de video en vivo con controles
- Mini reproductor draggable en móvil (círculo flotante)
- Botón de play siempre visible en móvil
- Barra inferior eliminada en móvil para música

MEJORAS VISUALES:
- Círculo flotante con animación de spin
- Anillo de progreso circular SVG
- Efecto glow en mini reproductor
- Panel de cola con pestañas en móvil

PRÓXIMAMENTE:
• Guía EPG para TV en Vivo
• PWA (instalable)
• Notificaciones push`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
    comments: [],
  },
  {
    id: '106',
    title: 'Actualización v3.0 - Reproductor mejorado y cola de reproducción',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.8:

AHORA (v3.0):
- Página del reproductor con layout 50/50
- Panel de cola de reproducción con gestión completa
- Pestaña "Similares" y "Cola" en el reproductor
- Botón de cola con contador de canciones
- Eliminación individual y vaciar cola completa
- Navegación arriba/abajo para reorganizar
- Compartir e informar solo con iconos (sin texto)
- Botón de tres puntos eliminado del reproductor
- ConfirmDialog y Modal compactos en móvil
- Pantalla completa para video sin restricciones

MEJORAS TÉCNICAS:
- TrackMenu usa createPortal para evitar clipping
- ImageWithFallback para imágenes de songs/movies
- Fullscreen player rediseñado con vinyl spin
- Cola integrada inline en el reproductor

PRÓXIMAMENTE:
• Anime y TV en Vivo
• EPG (guía de programación)
• PWA (instalable)`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'],
    comments: [],
  },
  {
    id: '105',
    title: 'Actualización v2.8 - Registro y preferencias de usuario',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.7:

AHORA (v2.8):
- Registro de usuario con pasos múltiples
- Selección de géneros: música, películas, series, anime
- Selección de idioma preferido
- Selección de tema preferido
- Flujo de recuperación de contraseña
- Página de login-rediseñada con diseño limpio
- Cierre de sesión con confirmación
- Botón de login/logout con info del usuario

MEJORAS DE UX:
- Login móvil: altura completa sin scroll del body
- Tarjeta de login con scroll interno
- Utilidad CSS .no-scroll-mobile
- Animaciones suaves en transiciones

PRÓXIMAMENTE:
• Anime y TV en Vivo
• EPG (guía de programación)
• PWA (instalable)`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&q=80'],
    comments: [],
  },
  {
    id: '104',
    title: 'Actualización v2.7 - Navegación móvil y mejoras de UI',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.6:

AHORA (v2.7):
- Menú móvil rediseñado con botón flotante
- Botón hamburguesa en esquina inferior derecha
- Drawer deslizante con opciones de navegación
- Información del usuario y logout en el drawer
- Posición del botón ajustada (bottom-6 right-5)
- ConfirmDialog y Modal compactos en móvil
- Botones de compartir e informar solo iconos (sin texto)
- Menú de tres puntos eliminado del reproductor

MEJORAS DE UX:
- Botón flotante siempre accesible
- Drawer con animación slide-up
- Contenido del menú optimizado para móvil
- Espaciado y tipografía ajustados

PRÓXIMAMENTE:
• Anime y TV en Vivo
• EPG (guía de programación)
• PWA (instalable)`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'],
    comments: [],
  },
  {
    id: '103',
    title: 'Actualización v2.6 - Login y configuración completa',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.5:

ANTES (v2.5):
• No había sistema de inicio de sesión
• La configuración no guardaba cambios
• Los botones del menú no se deshabilitaban

AHORA (v2.6):
- Página de inicio de sesión completa
- Botón de "Iniciar sesión" en el sidebar
- Cierre de sesión con confirmación
- Configuración del reproductor funcional (autoplay, mezcla, calidad, volumen)
- Configuración de notificaciones funcional
- Configuración de apariencia funcional (animaciones, compacto)
- Los botones se deshabilitan cuando el contenido está OFF
- Todos los cambios se guardan en localStorage

PRÓXIMAMENTE:
• Ecualizador visual
• Notificaciones push
• Modo offline`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&q=80'],
    comments: [],
  },
  {
    id: '102',
    title: 'Actualización v2.5 - Multiidioma',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.4:

ANTES (v2.4):
• La interfaz estaba solo en español
• No se podía cambiar el idioma
• El idioma del sistema no se detectaba

AHORA (v2.5):
- Detección automática del idioma del sistema
- Opciones de idioma: Español, English, Português, Français
- La opción "Sistema" detecta el idioma del SO del usuario
- Cambio de idioma en Configuración > Idioma
- El contenido (películas/series) se filtra por español por defecto
- Changelog v2.4 integrado

PRÓXIMAMENTE:
• Ecualizador visual
• Notificaciones push
• Modo offline`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80'],
    comments: [],
  },
  {
    id: '101',
    title: 'Actualización v2.4 - Tema claro y más',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.3:

ANTES (v2.3):
• Solo existía tema oscuro
• No se podía cambiar la apariencia
• No había página de configuración

AHORA (v2.4):
- Tema claro disponible (Configuración > Apariencia)
- Opción Sistema para seguir preferencia del SO
- Página de configuración completa
- Imágenes de fallback cuando falla la carga
- Paginación en canciones similares (10 por página)
- Paginación en cola de reproducción (8 por página)
- Menú de opciones (tres puntos) en canciones
- El reproductor no invade el sidebar en desktop

PRÓXIMAMENTE:
• Ecualizador visual
• Notificaciones push
• Modo offline`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80'],
    comments: [],
  },
  {
    id: '100',
    title: 'Actualización v2.3 - Cola de reproducción',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.2:

ANTES (v2.2):
• Solo había cola de reproducción oculta en el reproductor
• No se podía ver qué canciones estaban en la cola
• No había forma de reorganizar la cola

AHORA (v2.3):
- Cola de reproducción integrada en la página del reproductor
- Pestaña "Cola de reproducción" junto a "Canciones similares"
- Cola con lista de reproducción completa con highlights de la canción actual
- Poder borrar canciones de la cola individualmente
- Poder vaciar la cola completa
- Reorganizar canciones con botones arriba/abajo
- Acceso rápido desde el mini reproductor (botón de lista)

PRÓXIMAMENTE:
• Ecualizador visual
• Modo oscuro/claro
• Notificaciones push
• Modo offline`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'],
    comments: [],
  },
  {
    id: '0',
    title: 'Actualización v2.2 - Reproductor mejorado y paginación',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.1:

ANTES (v2.1):
• El reproductor de música solo se veía en la barra inferior
• No había opción de ver el reproductor en pantalla completa
• Las imágenes de los posts no se podían ver en grande
• No había paginación en las páginas de películas/series
• Los favoritos del foro no se guardaban en la biblioteca
• No había selector de cuántos elementos mostrar por página

AHORA (v2.2):
- Reproductor expandible con vista fullscreen para música
- Botón de maximizar para abrir reproductor completo
- Click en portada del reproductor abre vista ampliada
- Control de volumen disponible en móvil (popup)
- Lightbox para ver imágenes de posts en pantalla completa
- Paginación en página de inicio (canciones, películas, series, álbumes, playlists)
- Paginación en páginas de películas y series
- Selector de elementos por página (12, 18, 24, 36, 48)
- Favoritos del foro guardados en biblioteca
- Sección "Hilos guardados" en la biblioteca
- Fotos de perfil de usuario para posts del foro

MEJORAS VISUALES:
- Reproductor fullscreen con gradiente de fondo
- Controles grandes y fáciles de usar en móvil
- Animaciones suaves al expandir/colapsar
- Volumen con popup flotante en móvil

PRÓXIMAMENTE:
• Ecualizador visual
• Modo oscuro/claro
• Notificaciones push
• Modo offline`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80'],
    comments: [],
  },
  {
    id: '1',
    title: 'Actualización v2.1 - Foro mejorado y subida de imágenes',
    body: `¡Nueva actualización disponible! Estos son los cambios desde la v2.0:

ANTES (v2.0):
• El botón de comentarios expandía los comentarios en la tarjeta
• No se podía comentar directamente desde la página principal
• Solo se podían agregar imágenes por URL
• Las denuncias no tenían campo de texto adicional
• No había opción de subir archivos desde el ordenador

AHORA (v2.1):
- Botón de comentarios redirige a la vista completa del hilo
- Input de comentarios eliminado de la página principal (solo en hilo)
- Subida de imágenes desde el ordenador (drag & drop)
- Modal de nueva publicación con selector URL/Archivo
- Preview de imágenes antes de publicar
- Campo de texto opcional en denuncias para describir el problema
- Sección de "Música underground" agregada en página de inicio
- 5 páginas de contenido por categoría (antes solo 1)
- Artistas populares: 12 -> 20
- Álbumes: 12 -> 18
- Playlists: 12 -> 18

CAMBIOS TÉCNICOS:
- Filtrado de contenido en español solo (original_language=es)
- Consultas a TMDB con parámetro with_original_language=es
- MultiEmbed como servidor predeterminado de video
- Changelog automático en el foro después de cada actualización

PRÓXIMAMENTE:
• Sistema de notificaciones
• Perfiles de usuario
• Tags y etiquetas en publicaciones`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'],
    comments: [],
  },
  {
    id: '1',
    title: 'Bienvenido a Resona - Reglas de la plataforma',
    body: `¡Hola! Bienvenidos a Resona, tu plataforma de música, películas y series. Antes de comenzar, por favor lee las reglas:

1. Respeta a los demás miembros del foro.
2. No publicar contenido ofensivo, spam o publicidad no relacionada.
3. Usa las categorías adecuadas para tus publicaciones (Películas, Series, Música, General).
4. No publicar enlaces a sitios maliciosos.
5. Disfruta del contenido y comparte con la comunidad.

El incumplimiento de estas reglas puede resultar en la eliminación de tu cuenta.`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 1 semana',
    likes: 89,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'],
    links: [
      { url: 'https://www.themoviedb.org/', label: 'TMDB - Datos de películas' },
      { url: 'https://audius.co/', label: 'Audius - Música gratuita' },
    ],
    comments: [
      { id: 'c1', author: 'Roka', text: '¡Excelente plataforma! Muy completa.', date: 'Hace 6 días', likes: 12, likedByMe: false },
      { id: 'c2', author: 'Luna_M', text: 'Me encanta la sección de películas en español.', date: 'Hace 5 días', likes: 8, likedByMe: false, replyTo: 'c1', replies: [] },
    ],
  },
  {
    id: '2',
    title: 'Guía: Cómo usar el reproductor de películas y series',
    body: `Resona incluye un reproductor integrado para ver películas y series. Aquí te explicamos cómo usarlo:

1. Ve a la sección de Películas o Series desde el menú lateral.
2. Selecciona el contenido que quieras ver y haz click en "Ver".
3. El reproductor cargará automáticamente con MultiEmbed como servidor principal.
4. Si MultiEmbed no funciona, puedes cambiar de servidor usando el selector de la parte superior.
5. Para series, puedes seleccionar temporada y episodio antes de reproducir.
6. Tu progreso se guarda automáticamente en "Continuar viendo".

¿Tienes dudas? Pregunta en los comentarios.`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 5 días',
    likes: 67,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80'],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comments: [
      { id: 'c3', author: 'Carlos_M', text: '¡Muy útil! No sabía que podía cambiar de servidor.', date: 'Hace 4 días', likes: 15, likedByMe: false },
      { id: 'c4', author: 'PedroX', text: '¿Se puede guardar el progreso de una serie?', date: 'Hace 4 días', likes: 6, likedByMe: false, replyTo: 'c3', replies: [] },
      { id: 'c5', author: 'Admin', text: '¡Sí! El progreso se guarda en "Continuar viendo" en la página de inicio.', date: 'Hace 3 días', likes: 20, likedByMe: false, replyTo: 'c4', replies: [] },
    ],
  },
  {
    id: '3',
    title: 'Reglas del foro - Lee antes de publicar',
    body: `Para mantener un foro ordenado y agradable, por favor sigue estas reglas:

CATEGORÍAS:
- Películas: Para discusiones sobre cine, recomendaciones y críticas.
- Series: Para todo lo relacionado con series de televisión.
- Música: Para hablar de canciones, artistas y álbumes.
- General: Para temas que no encajan en las otras categorías.

REGLAS:
- Usa un título claro y descriptivo.
- No publiques el mismo tema varias veces (duplicados).
- Mantén los comentarios respetuosos.
- No uses el foro para solicitar contenido ilegal.
- Los posts de los admins son informativos - no los edites ni elimines.

¡Gracias por colaborar!`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 3 días',
    likes: 56,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'],
    comments: [
      { id: 'c6', author: 'Ana_L', text: 'Perfecto, todo muy claro.', date: 'Hace 2 días', likes: 9, likedByMe: false },
    ],
  },
  {
    id: '4',
    title: '¿Cómo agregar contenido a favoritos?',
    body: `Resona te permite guardar tus canciones, películas y series favoritas. Aquí te explicamos cómo:

MÚSICA:
1. Busca la canción que te gusta.
2. Haz click en el icono de corazón.
3. Se guardará en tu sección de Favoritos.

PELÍCULAS Y SERIES:
1. Ve a la ficha de la película o serie.
2. Haz click en el icono de corazón.
3. Se guardará automáticamente.

PLAYLISTS:
También puedes crear playlists para organizar tu música favorita:
1. Ve a la sección de Playlists.
2. Haz click en "+" para crear una nueva playlist.
3. Añade canciones desde la búsqueda o desde la página de un artista.`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 2 días',
    likes: 43,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80'],
    comments: [],
  },
  {
    id: '5',
    title: 'Series coreanas: recomendaciones',
    body: 'Acabo de terminar "Squid Game" y me dejó sin palabras. ¿Qué serie coreana me recomiendan para seguir?',
    author: 'Ana_L',
    category: 'tv',
    date: 'Hace 5 horas',
    likes: 18,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
    comments: [
      { id: 'c7', author: 'PedroX', text: '"All of Us Are Dead" es increíble, ¡mírala!', date: 'Hace 3 horas', likes: 7, likedByMe: false },
      { id: 'c8', author: 'Luna_M', text: '"Parasite" también es muy buena, aunque es película.', date: 'Hace 2 horas', likes: 4, likedByMe: false, replyTo: 'c7', replies: [] },
    ],
  },
  {
    id: '6',
    title: '¿Cuál es la mejor película española de los últimos años?',
    body: 'Personalmente creo que "El secreto de sus ojos" o "Mar adentro" están en otro nivel. ¿Qué opinan?',
    author: 'Carlos_M',
    category: 'movies',
    date: 'Hace 8 horas',
    likes: 24,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80'],
    comments: [
      { id: 'c9', author: 'Laura_S', text: '¡"El padre no hay uno solo!" mejor película argentina', date: 'Hace 6 horas', likes: 5, likedByMe: false },
      { id: 'c10', author: 'MiguelR', text: 'Para mí "El cuerpo" es el mejor thriller español.', date: 'Hace 4 horas', likes: 3, likedByMe: false, replyTo: 'c9', replies: [] },
    ],
  },
  {
    id: '7',
    title: 'Conciertos en vivo que cambiaron la historia',
    body: 'Hay conciertos que quedan grabados para siempre. ¿Cuál es el concierto en vivo que más les ha impactado?',
    author: 'MusicFan99',
    category: 'music',
    date: 'Hace 1 día',
    likes: 42,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comments: [
      { id: 'c11', author: 'Roka', text: 'Live Aid 1985, sin duda.', date: 'Hace 20 horas', likes: 18, likedByMe: false },
    ],
  },
];
