import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PanicButton from "@/components/PanicButton";
import { MapPin, Clock, Calendar, ChevronRight, Star, Mountain, Waves, Utensils, Landmark, TreePine, Sun, Moon, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const rutas = [
  {
    id: "escapada-express",
    nombre: "Escapada Express",
    duracion: "3 días",
    dificultad: "Fácil",
    icon: Sun,
    color: "from-amber-500 to-orange-600",
    tagColor: "bg-amber-100 text-amber-800",
    descripcion: "Perfecta para un fin de semana largo. Descubre la magia del café, cascadas y pueblos con encanto en la zona montañosa de Veracruz.",
    imagen: "https://images.unsplash.com/photo-1652015496419-58606c1b5d1c?w=1200&q=85",
    municipios: ["Xalapa", "Coatepec", "Xico"],
    tags: ["Café", "Cascadas", "Pueblos Mágicos"],
    dias: [
      {
        dia: 1,
        titulo: "Xalapa — La Atenas Veracruzana",
        actividades: [
          "Llegada a Xalapa y check-in en hotel del centro",
          "Visita al Museo de Antropología de Xalapa (el más importante fuera de CDMX)",
          "Recorrido por los Lagos del Dique y el Parque Juárez",
          "Cena en el centro histórico con café local"
        ],
        tip: "El Museo de Antropología cierra a las 5 PM. Llega temprano para disfrutarlo sin prisas.",
        municipio_slug: "xalapa"
      },
      {
        dia: 2,
        titulo: "Coatepec — Capital del Café",
        actividades: [
          "Desayuno con café de altura en Coatepec",
          "Tour por una finca cafetalera (reservar con anticipación)",
          "Visita a la Cascada Bola de Oro",
          "Recorrido por el centro histórico y mercado local",
          "Degustación de licores artesanales"
        ],
        tip: "Coatepec está a solo 15 minutos de Xalapa. Prueba el café de olla tradicional.",
        municipio_slug: "coatepec"
      },
      {
        dia: 3,
        titulo: "Xico — Cascadas y Mole",
        actividades: [
          "Mañana temprano: caminata a la Cascada de Texolo",
          "Desayuno con mole xiqueño, el más famoso de Veracruz",
          "Recorrido por las calles empedradas del pueblo",
          "Compra de artesanías y productos locales",
          "Regreso a Xalapa para vuelo/bus de retorno"
        ],
        tip: "Lleva zapatos cómodos para la caminata a Texolo. El mole de Xico es imperdible.",
        municipio_slug: "xico"
      }
    ]
  },
  {
    id: "ruta-magica",
    nombre: "Ruta de Pueblos Mágicos",
    duracion: "5 días",
    dificultad: "Moderada",
    icon: Star,
    color: "from-emerald-600 to-teal-700",
    tagColor: "bg-emerald-100 text-emerald-800",
    descripcion: "Recorre los Pueblos Mágicos más emblemáticos de Veracruz. Desde la montaña hasta la costa, vive la cultura, tradiciones y sabores que hacen único a este estado.",
    imagen: "https://images.unsplash.com/photo-1772551481564-78b4e46c5964?w=1200&q=85",
    municipios: ["Orizaba", "Coatepec", "Xico", "Papantla", "Tlacotalpan"],
    tags: ["Pueblos Mágicos", "Cultura", "Gastronomía"],
    dias: [
      {
        dia: 1,
        titulo: "Orizaba — Aguas Alegres y Montaña",
        actividades: [
          "Llegada a Orizaba, la Ciudad de las Aguas Alegres",
          "Subida al Teleférico con vistas al Pico de Orizaba",
          "Visita al Palacio de Hierro, diseñado por Gustave Eiffel",
          "Paseo por el Río Orizaba al atardecer",
          "Cena de pan artesanal y café orizabeño"
        ],
        tip: "El teleférico tiene mejor vista por la mañana cuando el Pico de Orizaba está despejado.",
        municipio_slug: "orizaba"
      },
      {
        dia: 2,
        titulo: "Coatepec y Xico — Café y Cascadas",
        actividades: [
          "Tour matutino por finca cafetalera en Coatepec",
          "Almuerzo con café de altura y pan local",
          "Traslado a Xico (20 min)",
          "Caminata a la Cascada de Texolo",
          "Cena con mole xiqueño tradicional"
        ],
        tip: "Ambos pueblos están muy cerca entre sí. Puedes recorrerlos en un día cómodo.",
        municipio_slug: "coatepec"
      },
      {
        dia: 3,
        titulo: "Traslado y Papantla — Voladores y Vainilla",
        actividades: [
          "Traslado a Papantla (4 horas aprox.)",
          "Llegada y check-in, almuerzo con comida totonaca",
          "Visita a la zona arqueológica de El Tajín",
          "Espectáculo de la Danza de los Voladores",
          "Recorrido nocturno por el centro de Papantla"
        ],
        tip: "El Tajín es Patrimonio de la Humanidad. Lleva agua, sombrero y protector solar.",
        municipio_slug: "papantla"
      },
      {
        dia: 4,
        titulo: "Papantla — Vainilla y Cultura Totonaca",
        actividades: [
          "Tour de vainilla: desde la orquídea hasta el extracto",
          "Taller de artesanías totonacas",
          "Visita al Mural Homenaje a la Cultura Totonaca",
          "Traslado vespertino a Tlacotalpan (5 horas)"
        ],
        tip: "La vainilla de Papantla es considerada la mejor del mundo. Compra directa al productor.",
        municipio_slug: "papantla"
      },
      {
        dia: 5,
        titulo: "Tlacotalpan — Patrimonio de la Humanidad",
        actividades: [
          "Paseo matutino en lancha por el Río Papaloapan",
          "Recorrido por las coloridas casas coloniales (UNESCO)",
          "Visita al Museo Agustín Lara",
          "Son jarocho en vivo en el portal",
          "Almuerzo de despedida con pescado a la veracruzana"
        ],
        tip: "Si visitas en febrero, coincidirás con la Fiesta de la Candelaria, una de las más grandes de México.",
        municipio_slug: "tlacotalpan"
      }
    ]
  },
  {
    id: "aventura-completa",
    nombre: "Aventura Veracruzana Completa",
    duracion: "7 días",
    dificultad: "Moderada-Alta",
    icon: Mountain,
    color: "from-blue-600 to-indigo-800",
    tagColor: "bg-blue-100 text-blue-800",
    descripcion: "La experiencia definitiva: desde las cumbres del Pico de Orizaba hasta las playas del Golfo, pasando por selva tropical, ríos y lagunas. Para quienes quieren conocer todas las caras de Veracruz.",
    imagen: "https://images.unsplash.com/photo-1648485716909-2636f8abb2cd?w=1200&q=85",
    municipios: ["Orizaba", "Xalapa", "Coatepec", "Veracruz", "Tlacotalpan", "Catemaco", "Los Tuxtlas"],
    tags: ["Aventura", "Naturaleza", "Playa", "Montaña", "Selva"],
    dias: [
      {
        dia: 1,
        titulo: "Orizaba — Montaña y Cultura",
        actividades: [
          "Llegada a Orizaba, recorrido por el centro histórico",
          "Visita al Palacio de Hierro y Catedral de San Miguel",
          "Subida en teleférico al Cerro del Borrego",
          "Paseo por el Río Orizaba al atardecer"
        ],
        tip: "Si eres aventurero, consulta sobre excursiones al Pico de Orizaba (requiere guía y equipo especializado).",
        municipio_slug: "orizaba"
      },
      {
        dia: 2,
        titulo: "Xalapa y Coatepec — Niebla y Café",
        actividades: [
          "Traslado a Xalapa (2 horas)",
          "Museo de Antropología de Xalapa",
          "Almuerzo en zona gastronómica de Xalapa",
          "Tour de café en Coatepec por la tarde",
          "Noche en Xalapa"
        ],
        tip: "La niebla de Xalapa es parte de su encanto. Lleva una chamarra ligera.",
        municipio_slug: "xalapa"
      },
      {
        dia: 3,
        titulo: "Veracruz Puerto — Sol y Malecón",
        actividades: [
          "Traslado al puerto de Veracruz (1.5 horas)",
          "Recorrido por el malecón y centro histórico",
          "Visita a San Juan de Ulúa, la fortaleza colonial",
          "Acuario de Veracruz",
          "Noche: portales del zócalo con son jarocho"
        ],
        tip: "Los portales del zócalo se llenan de música y vida por las noches. Pide un café lechero.",
        municipio_slug: "veracruz"
      },
      {
        dia: 4,
        titulo: "Tlacotalpan — El Río y los Colores",
        actividades: [
          "Traslado a Tlacotalpan (2.5 horas)",
          "Paseo en lancha por el Río Papaloapan",
          "Recorrido por casas coloniales (Patrimonio UNESCO)",
          "Almuerzo con pescado del río",
          "Son jarocho en vivo"
        ],
        tip: "Tlacotalpan es el lugar más fotogénico de Veracruz. Lleva cámara cargada.",
        municipio_slug: "tlacotalpan"
      },
      {
        dia: 5,
        titulo: "Catemaco — Laguna y Misticismo",
        actividades: [
          "Traslado a Catemaco (2 horas)",
          "Paseo en lancha por la Laguna de Catemaco",
          "Visita a la Isla de los Changos",
          "Centro ecoturístico Nanciyaga: temascal y selva",
          "Consulta con un brujo local (tradición de la zona)"
        ],
        tip: "Nanciyaga es mágico: selva, laguna, temascal y lodo volcánico. Reserva con anticipación.",
        municipio_slug: "catemaco"
      },
      {
        dia: 6,
        titulo: "Los Tuxtlas — Selva y Volcán",
        actividades: [
          "Senderismo por la Reserva de la Biosfera",
          "Observación de aves y flora tropical",
          "Visita a Sontecomapan y su laguna",
          "Playa de Monte Pío o Roca Partida",
          "Atardecer en la playa"
        ],
        tip: "La Reserva de Los Tuxtlas es uno de los últimos bosques tropicales del mundo. Respeta la naturaleza.",
        municipio_slug: "los-tuxtlas"
      },
      {
        dia: 7,
        titulo: "Regreso con el Alma Llena",
        actividades: [
          "Mañana libre para últimas compras en el mercado local",
          "Visita a la Cascada de Eyipantla (opcional)",
          "Almuerzo de despedida con mariscos",
          "Traslado al aeropuerto de Veracruz (3.5 horas)"
        ],
        tip: "La Cascada de Eyipantla tiene más de 800 escalones. Si tienes tiempo y energía, vale la pena.",
        municipio_slug: "catemaco"
      }
    ]
  },
  {
    id: "ruta-cultural",
    nombre: "Ruta Cultural y Arqueológica",
    duracion: "4 días",
    dificultad: "Fácil",
    icon: Landmark,
    color: "from-rose-600 to-red-800",
    tagColor: "bg-rose-100 text-rose-800",
    descripcion: "Para los amantes de la historia y la cultura. Recorre las civilizaciones prehispánicas, la herencia colonial y las tradiciones vivas que hacen de Veracruz un estado único en México.",
    imagen: "https://images.unsplash.com/photo-1666808982367-b9180dac5948?w=1200&q=85",
    municipios: ["Veracruz", "Papantla", "Xalapa", "Orizaba"],
    tags: ["Historia", "Arqueología", "Museos", "Cultura"],
    dias: [
      {
        dia: 1,
        titulo: "Veracruz — Donde Comenzó Todo",
        actividades: [
          "Visita a San Juan de Ulúa, la fortaleza más importante del virreinato",
          "Museo Naval México y Museo de la Ciudad",
          "Recorrido por el centro histórico y la Catedral",
          "Portales del zócalo: historia viva con música"
        ],
        tip: "Veracruz fue el primer ayuntamiento de América continental. Cada rincón tiene historia.",
        municipio_slug: "veracruz"
      },
      {
        dia: 2,
        titulo: "Papantla y El Tajín",
        actividades: [
          "Traslado a Papantla (4 horas)",
          "Zona Arqueológica de El Tajín: Pirámide de los Nichos",
          "Danza de los Voladores (Patrimonio Cultural de la Humanidad)",
          "Museo de Arte Totonaca",
          "Tour de vainilla artesanal"
        ],
        tip: "El Tajín fue capital del imperio totonaca. La Pirámide de los Nichos tiene 365 nichos, uno por cada día del año.",
        municipio_slug: "papantla"
      },
      {
        dia: 3,
        titulo: "Xalapa — Museos y Cultura",
        actividades: [
          "Traslado a Xalapa (4 horas)",
          "Museo de Antropología de Xalapa: cabezas olmecas, arte totonaca",
          "Pinacoteca Diego Rivera",
          "Galería de Arte Contemporáneo",
          "Paseo por el barrio de Los Lagos"
        ],
        tip: "El Museo de Antropología de Xalapa es el segundo más importante de México, después del de la CDMX.",
        municipio_slug: "xalapa"
      },
      {
        dia: 4,
        titulo: "Orizaba — Arquitectura y Tradición",
        actividades: [
          "Traslado a Orizaba (2.5 horas)",
          "Palacio de Hierro: diseñado por Gustave Eiffel",
          "Museo de Arte del Estado",
          "Ex-Fábrica de San Lorenzo: patrimonio industrial",
          "Despedida con pan tradicional orizabeño"
        ],
        tip: "El Palacio de Hierro de Orizaba es el único en América Latina y fue originalmente diseñado para Bélgica.",
        municipio_slug: "orizaba"
      }
    ]
  }
];

const RutaCard = ({ ruta, onSelect }) => (
  <div 
    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer"
    onClick={() => onSelect(ruta.id)}
    data-testid={`ruta-card-${ruta.id}`}
  >
    <div className="relative h-56 overflow-hidden">
      <img 
        src={ruta.imagen} 
        alt={ruta.nombre}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${ruta.color} opacity-60`} />
      <div className="absolute top-4 left-4 flex gap-2">
        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {ruta.duracion}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${ruta.tagColor}`}>
          {ruta.dificultad}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Playfair Display' }}>
          {ruta.nombre}
        </h3>
      </div>
    </div>
    <div className="p-5">
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{ruta.descripcion}</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ruta.tags.map(tag => (
          <span key={tag} className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <MapPin className="w-4 h-4" />
          <span>{ruta.municipios.length} municipios</span>
        </div>
        <span className="text-[#1B5E20] font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
          Ver itinerario <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </div>
  </div>
);

const RutaDetalle = ({ ruta, onBack }) => (
  <div className="space-y-8" data-testid={`ruta-detalle-${ruta.id}`}>
    {/* Hero */}
    <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden">
      <img src={ruta.imagen} alt={ruta.nombre} className="w-full h-full object-cover" />
      <div className={`absolute inset-0 bg-gradient-to-t ${ruta.color} opacity-70`} />
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <button 
          onClick={onBack}
          className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-800 hover:bg-white transition-colors"
        >
          Volver a rutas
        </button>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {ruta.duracion}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${ruta.tagColor}`}>
            {ruta.dificultad}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Playfair Display' }}>
          {ruta.nombre}
        </h1>
        <p className="text-white/90 mt-3 max-w-2xl text-sm md:text-base">{ruta.descripcion}</p>
      </div>
    </div>

    {/* Route Overview */}
    <div className="bg-white rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display' }}>
        Recorrido
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {ruta.municipios.map((m, i) => (
          <div key={m} className="flex items-center gap-2">
            <span className="px-4 py-2 bg-[#1B5E20]/10 text-[#1B5E20] rounded-lg font-medium text-sm">
              {m}
            </span>
            {i < ruta.municipios.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </div>

    {/* Day by Day Itinerary */}
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display' }}>
        Itinerario día a día
      </h2>
      {ruta.dias.map((dia) => (
        <div key={dia.dia} className="bg-white rounded-2xl overflow-hidden shadow-sm" data-testid={`dia-${dia.dia}`}>
          <div className={`bg-gradient-to-r ${ruta.color} px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">{dia.dia}</span>
              </div>
              <div>
                <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Día {dia.dia}</p>
                <h3 className="text-white font-bold text-lg">{dia.titulo}</h3>
              </div>
            </div>
            <Link 
              to={`/municipio/${dia.municipio_slug}`}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-colors"
            >
              Ver municipio
            </Link>
          </div>
          <div className="p-6">
            <ul className="space-y-3 mb-4">
              {dia.actividades.map((act, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#1B5E20]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#1B5E20]">{i + 1}</span>
                  </span>
                  <span className="text-gray-700 text-sm">{act}</span>
                </li>
              ))}
            </ul>
            {dia.tip && (
              <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <span className="font-semibold">Tip: </span>{dia.tip}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function RutasPage() {
  const [selectedRuta, setSelectedRuta] = useState(null);
  const ruta = rutas.find(r => r.id === selectedRuta);

  return (
    <div className="min-h-screen bg-[#F5F5F5]" data-testid="rutas-page">
      <Header />
      
      <section className="pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          {!selectedRuta ? (
            <>
              {/* Page Header */}
              <div className="text-center mb-12">
                <h1 
                  className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
                  style={{ fontFamily: 'Playfair Display' }}
                  data-testid="rutas-title"
                >
                  Rutas de Viaje
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto text-base">
                  Itinerarios cuidadosamente diseñados para que aproveches cada momento 
                  en Veracruz. Elige tu aventura según el tiempo que tengas.
                </p>
              </div>

              {/* Duration Quick Filters */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {rutas.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRuta(r.id)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-[#1B5E20] border border-transparent hover:border-[#1B5E20]/20"
                  >
                    <r.icon className="w-4 h-4" />
                    {r.nombre} ({r.duracion})
                  </button>
                ))}
              </div>

              {/* Route Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {rutas.map(r => (
                  <RutaCard key={r.id} ruta={r} onSelect={setSelectedRuta} />
                ))}
              </div>

              {/* Travel Tips Section */}
              <div className="mt-16 bg-white rounded-2xl p-8 md:p-12">
                <h2 
                  className="text-2xl font-bold text-gray-900 mb-6 text-center"
                  style={{ fontFamily: 'Playfair Display' }}
                >
                  Tips Generales para tu Viaje
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-[#1B5E20]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Mejor Época</h3>
                    <p className="text-sm text-gray-600">
                      Octubre a mayo es ideal. Evita temporada de lluvias (junio-septiembre) 
                      si planeas actividades al aire libre.
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#1B5E20]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Transporte</h3>
                    <p className="text-sm text-gray-600">
                      Renta un auto para mayor flexibilidad. Autobuses ADO conectan las 
                      ciudades principales con frecuencia.
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Utensils className="w-6 h-6 text-[#1B5E20]" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Gastronomía</h3>
                    <p className="text-sm text-gray-600">
                      No te vayas sin probar: café de Coatepec, mole xiqueño, mariscos del 
                      puerto y el pan de Orizaba.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : ruta ? (
            <RutaDetalle ruta={ruta} onBack={() => setSelectedRuta(null)} />
          ) : null}
        </div>
      </section>

      <Footer />
      <PanicButton />
    </div>
  );
}
