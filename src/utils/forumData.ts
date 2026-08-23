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
    id: '100',
    title: '📢 Actualización v2.3 - Cola de reproducción',
    body: `🚀 ¡Nueva actualización disponible! Estos son los cambios desde la v2.2:

📌 ANTES (v2.2):
• Solo había cola de reproducción oculta en el reproductor
• No se podía ver qué canciones estaban en la cola
• No había forma de reorganizar la cola

📌 AHORA (v2.3):
✅ Cola de reproducción integrada en la página del reproductor
✅ Pestaña "Cola de reproducción" junto a "Canciones similares"
✅ Cola con lista de reproducción completa con highlights de la canción actual
✅ Poder borrar canciones de la cola individually
✅ Poder vaciar la cola completa
✅ Reorganizar canciones con botones arriba/abajo
✅ Acceso rápido desde el mini reproductor (botón de lista)

🎯 PRÓXIMAMENTE:
• ecualizador visual
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
    title: '📢 Actualización v2.2 - Reproductor mejorado y paginación',
    body: `🚀 ¡Nueva actualización disponible! Estos son los cambios desde la v2.1:

📌 ANTES (v2.1):
• El reproductor de música solo se veía en la barra inferior
• No había opción de ver el reproductor en pantalla completa
• Las imágenes de los posts no se podían ver en grande
• No había paginación en las páginas de películas/series
• Los favoritos del foro no se guardaban en la biblioteca
• No había selector de cuántos elementos mostrar por página

📌 AHORA (v2.2):
✅ Reproductor expandible con vista fullscreen para música
✅ Botón de maximizar para abrir reproductor completo
✅ Click en portada del reproductor abre vista ampliada
✅ Control de volumen disponible en móvil (popup)
✅ Lightbox para ver imágenes de posts en pantalla completa
✅ Paginación en página de inicio (canciones, películas, series, álbumes, playlists)
✅ Paginación en páginas de películas y series
✅ Selector de elementos por página (12, 18, 24, 36, 48)
✅ Favoritos del foro guardados en biblioteca持久化
✅ Sección "Hilos guardados" en la biblioteca
✅ Fotos de perfil de usuario para posts del foro

🎯 MEJORAS VISUALES:
• Reproductor fullscreen con gradiente de fondo
• Controles grandes y fáciles de usar en móvil
• Animaciones suaves al expandir/colapsar
• Volumen con popup flotante en móvil

🎯 PRÓXIMAMENTE:
• ecualizador visual
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
    title: '📢 Actualización v2.1 - Foro mejorado y subida de imágenes',
    body: `🚀 ¡Nueva actualización disponible! Estos son los cambios desde la v2.0:

📌 ANTES (v2.0):
• El botón de comentarios expandía los comentarios en la tarjeta
• No se podía comentar directamente desde la página principal
• Solo se podían agregar imágenes por URL
• Las denuncias no tenían campo de texto adicional
• No había opción de subir archivos desde el ordenador

📌 AHORA (v2.1):
✅ Botón de comentarios redirige a la vista completa del hilo
✅ Input de comentarios eliminado de la página principal (solo en hilo)
✅ Subida de imágenes desde el ordenador (drag & drop)
✅ Modal de nueva publicación con selector URL/Archivo
✅ Preview de imágenes antes de publicar
✅ Campo de texto opcional en denuncias para describir el problema
✅ Sección de "Música underground" agregada en página de inicio
✅ 5 páginas de contenido por categoría (antes solo 1)
✅ Artistas populares: 12 → 20
✅ Álbumes: 12 → 18
✅ Playlists: 12 → 18

🎯 CAMBIOS TÉCNICOS:
• Filtrado de contenido en español solo (original_language=es)
• Consultas a TMDB con parámetro with_original_language=es
• MultiEmbed como servidor predeterminado de video
• Changelog automático en el foro después de cada actualización

🎯 PRÓXIMAMENTE:
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
    title: '📢 Actualización v2.0 - Mejoras en el foro y contenido en español',
    body: `🚀 ¡Nueva actualización disponible! Estos son los cambios realizados:

📌 ANTES:
• El foro solo permitía ver publicaciones sin poder interactuar
• No había opción de comentar directamente desde las tarjetas
• Las denuncias no permitían agregar detalles
• No se podían compartir ni guardar hilos
• El contenido de películas/series incluía todos los idiomas

📌 AHORA:
✅ Comentarios directos en cada tarjeta sin necesidad de expandir
✅ Botón de compartir hilos (copia link o usa API nativa)
✅ Botón de guardar/favorito para hilos importantes
✅ Denuncias con campo de texto para describir el problema
✅ Contenido filtrado solo en español (películas y series)
✅ Soporte para imágenes, videos y links externos en posts
✅ Respuestas anidadas a comentarios
✅ Emojis en publicaciones y comentarios
✅ Badge de Admin para identificar posts oficiales
✅ Sección de "Música underground" en la página de inicio
✅ 5 páginas de contenido por categoría (antes solo 1)

🎯 PRÓXIMAMENTE:
• Sistema de notificaciones
• Perfiles de usuario
• Tags y etiquetas en publicaciones`,
    author: 'Admin',
    category: 'general',
    date: 'Ahora mismo',
    likes: 0,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'],
    comments: [],
  },
  {
    id: '1',
    title: 'Bienvenido a Resona - Reglas de la plataforma 🎬🎵',
    body: `¡Hola! Bienvenidos a Resona, tu plataforma de música, películas y series. Antes de comenzar, por favor lee las reglas:

1️⃣ Respeta a los demás miembros del foro.
2️⃣ No publicar contenido ofensivo, spam o publicidad no relacionada.
3️⃣ Usa las categorías adecuadas para tus publicaciones (Películas, Series, Música, General).
4️⃣ No publicar enlaces a sitios maliciosos.
5️⃣ Disfruta del contenido y comparte con la comunidad.

El incumplimiento de estas reglas puede resultar en la eliminación de tu cuenta. 🚫`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 1 semana',
    likes: 89,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'],
    links: [
      { url: 'https://www.themoviedb.org/', label: '🌐 TMDB - Datos de películas' },
      { url: 'https://audius.co/', label: '🎵 Audius - Música gratuita' },
    ],
    comments: [
      { id: 'c1', author: 'Roka', text: '¡Excelente plataforma! Muy completa. 🔥', date: 'Hace 6 días', likes: 12, likedByMe: false },
      { id: 'c2', author: 'Luna_M', text: 'Me encanta la sección de películas en español. 👍', date: 'Hace 5 días', likes: 8, likedByMe: false, replyTo: 'c1', replies: [] },
    ],
  },
  {
    id: '2',
    title: 'Guía: Cómo usar el reproductor de películas y series 🎥',
    body: `Resona incluye un reproductor integrado para ver películas y series. Aquí te explicamos cómo usarlo:

1️⃣ Ve a la sección de Películas o Series desde el menú lateral.
2️⃣ Selecciona el contenido que quieras ver y haz click en "Ver".
3️⃣ El reproductor cargará automáticamente con MultiEmbed como servidor principal.
4️⃣ Si MultiEmbed no funciona, puedes cambiar de servidor usando el selector de la parte superior.
5️⃣ Para series, puedes seleccionar temporada y episodio antes de reproducir.
6️⃣ Tu progreso se guarda automáticamente en "Continuar viendo".

¿Tienes dudas? Pregunta en los comentarios. 💬`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 5 días',
    likes: 67,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80'],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comments: [
      { id: 'c3', author: 'Carlos_M', text: '¡Muy útil! No sabía que podía cambiar de servidor. 🙌', date: 'Hace 4 días', likes: 15, likedByMe: false },
      { id: 'c4', author: 'PedroX', text: '¿Se puede guardar el progreso de una serie? 🤔', date: 'Hace 4 días', likes: 6, likedByMe: false, replyTo: 'c3', replies: [] },
      { id: 'c5', author: 'Admin', text: '¡Sí! El progreso se guarda en "Continuar viendo" en la página de inicio. ✅', date: 'Hace 3 días', likes: 20, likedByMe: false, replyTo: 'c4', replies: [] },
    ],
  },
  {
    id: '3',
    title: 'Reglas del foro - Lee antes de publicar 📋',
    body: `Para mantener un foro ordenado y agradable, por favor sigue estas reglas:

📂 CATEGORÍAS:
• Películas 🎬: Para discusiones sobre cine, recomendaciones y críticas.
• Series 📺: Para todo lo relacionado con series de televisión.
• Música 🎵: Para hablar de canciones, artistas y álbumes.
• General 🔥: Para temas que no encajan en las otras categorías.

⚖️ REGLAS:
• Usa un título claro y descriptivo.
• No publiques el mismo tema varias veces (duplicados).
• Mantén los comentarios respetuosos.
• No uses el foro para solicitar contenido ilegal.
• Los posts de los admins son informativos - no los edites ni elimines.

¡Gracias por colaborar! 🤝`,
    author: 'Admin',
    category: 'general',
    date: 'Hace 3 días',
    likes: 56,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80'],
    comments: [
      { id: 'c6', author: 'Ana_L', text: 'Perfecto, todo muy claro. 👌', date: 'Hace 2 días', likes: 9, likedByMe: false },
    ],
  },
  {
    id: '4',
    title: '¿Cómo agregar contenido a favoritos? ❤️',
    body: `Resona te permite guardar tus canciones, películas y series favoritas. Aquí te explicamos cómo:

🎵 MÚSICA:
1. Busca la canción que te gusta.
2. Haz click en el icono de corazón ❤️.
3. Se guardará en tu sección de Favoritos.

🎬 PELÍCULAS Y SERIES:
1. Ve a la ficha de la película o serie.
2. Haz click en el icono de corazón ❤️.
3. Se guardará automáticamente.

📋 PLAYLISTS:
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
    title: 'Series coreanas: recomendaciones 🇰🇷',
    body: 'Acabo de terminar "Squid Game" y me dejó sin palabras. ¿Qué serie coreana me recomiendan para seguir? 🎮',
    author: 'Ana_L',
    category: 'tv',
    date: 'Hace 5 horas',
    likes: 18,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80'],
    comments: [
      { id: 'c7', author: 'PedroX', text: '"All of Us Are Dead" es increíble, ¡mírala! 🧟', date: 'Hace 3 horas', likes: 7, likedByMe: false },
      { id: 'c8', author: 'Luna_M', text: '"Parasite" también es muy buena, aunque es película. 🎬', date: 'Hace 2 horas', likes: 4, likedByMe: false, replyTo: 'c7', replies: [] },
    ],
  },
  {
    id: '6',
    title: '¿Cuál es la mejor película española de los últimos años? 🇪🇸',
    body: 'Personalmente creo que "El secreto de sus ojos" o "Mar adentro" están en otro nivel. ¿Qué opinan? 🎥',
    author: 'Carlos_M',
    category: 'movies',
    date: 'Hace 8 horas',
    likes: 24,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80'],
    comments: [
      { id: 'c9', author: 'Laura_S', text: '¡"El身躯padre no hay uno solo!" mejor película argentina 🇦🇷', date: 'Hace 6 horas', likes: 5, likedByMe: false },
      { id: 'c10', author: 'MiguelR', text: 'Para mí "El cuerpo" es la mejor thriller español. 🕵️', date: 'Hace 4 horas', likes: 3, likedByMe: false, replyTo: 'c9', replies: [] },
    ],
  },
  {
    id: '7',
    title: 'Conciertos en vivo que cambiaron la historia 🎸',
    body: 'Hay conciertos que quedan grabados para siempre. ¿Cuál es el concierto en vivo que más les ha impactado? 🎤',
    author: 'MusicFan99',
    category: 'music',
    date: 'Hace 1 día',
    likes: 42,
    likedByMe: false,
    images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'],
    video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comments: [
      { id: 'c11', author: 'Roka', text: 'Live Aid 1985, sin duda. 🎶', date: 'Hace 20 horas', likes: 18, likedByMe: false },
    ],
  },
];
