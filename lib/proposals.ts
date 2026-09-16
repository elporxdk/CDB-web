import type { AreaBlock } from "./types";

export const areas: AreaBlock[] = [
  {
    id: "innovabosco",
    name: "INNOVABOSCO",
    blurb: "Lo que el estudiante aprende no se queda en el cuaderno, sino que se trabaje hasta volverse experiencia",
    proposals: [
      {
        title: "Plataforma Di Astrea",
        description:
          "Ecosistema digital exclusivo para estudiantes del colegio: metas del Consejo con su estado de avance, calendario enlazado a notificaciones, registro para torneos y eventos.",
        status: "aprobada",
        image: "/PlataformaDiAstrea.png",
      },
      {
        title: "Servicios técnicos estudiantiles",
        description:
          "Espacio formal para que estudiantes de las seis especialidades ofrezcan servicios a bajo costo, con respaldo docente, y ganen experiencia real en su campo.",
        status: "en-desarrollo",
        image: "/ServicioTecnico.jpg",
      },
    ],
  },
  {
    id: "carl-rogers",
    name: "CARL ROGERS",
    blurb: "Espacio para el talento que no cabe en el salón de clases.",
    proposals: [
      {
        title: "RED ASTREA",
        description:
          "Foro anónimo dentro de Di Astrea con moderación estudiantil y acompañamiento de un docente. Es un espacio para pedir consejo, compartir experiencias y hablar de lo que no se puede decir en voz alta.",
        status: "en-desarrollo",
        image: "/ForoAstra.jpg",
      },
      {
        title: "Club de refuerzos",
        description:
          "Tutorías entre pares organizadas por estudiantes en las materias que el propio estudiantado señale, con aval del docente de la materia.",
        status: "en-desarrollo",
        image: "/ClubDeRefuerzos.jpg",
      },
    ],
  },
  {
    id: "expres-arte",
    name: "EXPRÉS-ARTE",
    blurb: "El colegio también es un lugar donde se lee, se toca, se pinta y se juega. Este proyecto abre esos espacios y los sostiene todo el año, no solo en la semana cultural.",
    proposals: [
      {
        title: "Radio Don Bosco",
        description:
          "Cabina estudiantil activa durante los eventos institucionales, con entrevistas a invitados, muestra de talentos estudiantiles. La programación se anuncia en Di Astrea.",
        status: "en-desarrollo",
        image: "/RadioDonBosco.jpeg",
      },
      {
        title: "Museo de arte y fotografía",
        description:
          "Galería rotativa de Diseño Gráfico con pintura, fotografía, cortometrajes y animación producida por estudiantes.",
        status: "en-desarrollo",
        image: "/MuseoArte.jpg",
      },
      {
        title: "Zonas de lectura y ocio",
        description:
          "Renovación de la biblioteca con préstamo de libros interactivos, mangas y cómics. Se suman juegos de mesa y un club formal de ajedrez para los recesos.",
        status: "en-desarrollo",
        image: "/Lectura.jpg",
      },
      {
        title: "Murales y teatro",
        description:
          "Un mural temático por mes según la festividad vigente o los valores salesianos, y representaciones teatrales breves de obras o sagas vigentes para el Día del Libro.",
        status: "en-desarrollo",
        image: "/teatro.jpg",
      },
    ],
  },
  {
    id: "domingo-savio",
    name: "DOMINGO SAVIO",
    blurb: "Domingo Savio fue santo siendo estudiante, no siendo adulto. Los más pequeños no votan y suelen quedar fuera de los planes; aquí ocupan un proyecto entero, ejecutado por los estudiantes mayores: los grandes hacen para los pequeños.",
    proposals: [
      {
        title: "Aprendizaje sensorial",
        description:
          "Juguetes sensoriales integrados en las aulas y libros sensoriales diseñados por alumnos de niveles superiores como proyecto de módulo, con criterios de seguridad avalados por las docentes de Parvularia.",
        status: "en-desarrollo",
        image: "/AprendizajeSensorial.jpg",
      },
      {
        title: "Padrinos lectores",
        description:
          "Estudiantes de bachillerato leen a los más pequeños una vez al mes, dentro del programa de lectura.",
        status: "en-desarrollo",
        image: "/PadrinosLectores.jpg",
      },
      {
        title: "Festival de talentos",
        description:
          "Apoyo estudiantil en el montaje y la animación del Festival de Talentos de Primera Infancia.",
        status: "en-desarrollo",
        image: "/Talentos.jpg",
      },
    ],
  },
  {
    id: "adn-salesiano",
    name: "ADN SALESIANO",
    blurb: "Este proyecto convierte el año lectivo en algo que se juega y se sigue en conjunto con la comunidad educativa, y que se vive con alegría y sentido de pertenencia.",
    proposals: [
      {
        title: "Torneos de receso",
        description:
          "Fútbol, baloncesto, voleibol, balonmano y ajedrez por sección, dentro del puntaje de la Copa.",
        status: "aprobada",
        image: "/Torneos.jpg",
      },
      {
        title: "Retos académicos",
        description:
          "Olimpiadas internas y concursos de conocimiento de multiples rubros entre secciones, sumando puntaje para la Copa.",
        status: "en-desarrollo",
        image: "/RetoAcademico.jpg",
      },
      {
        title: "E-SPORTS",
        description:
          "Crear un espacio para torneos de distintos videojuegos en los recesos, con inscripción voluntaria, reglamento, un docente a cargo y una gran final en un evento del colegio.",
        status: "en-desarrollo",
        image: "/Esports.png",
      },
      {
        title: "Cuentas claras",
        description:
          "Informe trimestral público con el estado de cada acción, un delegado por sección con reunión mensual y acta de traspaso al siguiente Consejo.",
        status: "en-desarrollo",
        image: "/Cuentas.jpg",
      },
    ],
  },
];
