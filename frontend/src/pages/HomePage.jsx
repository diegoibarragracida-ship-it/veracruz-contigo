import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "@/App";
import { useLanguage } from "@/i18n/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import MunicipioCard from "@/components/MunicipioCard";
import EventoCard from "@/components/EventoCard";
import PanicButton from "@/components/PanicButton";
import AlertBanner from "@/components/AlertBanner";
import { Link } from "react-router-dom";
import { MapPin, Calendar, Users, ShieldAlert, BookOpen, Star, ChevronRight, Shield, BadgeCheck, Heart, CloudSun, Thermometer, Droplets, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const { t } = useLanguage();
  const [municipios, setMunicipios] = useState([]);
  const [pueblosMagicos, setPueblosMagicos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [municipiosRes, pueblosRes, eventosRes, alertasRes] = await Promise.all([
          axios.get(`${API}/municipios`, { params: { estado: "publicado", limit: 8 } }),
          axios.get(`${API}/municipios`, { params: { pueblo_magico: true, limit: 6 } }),
          axios.get(`${API}/eventos`, { params: { publicado: true, limit: 6 } }),
          axios.get(`${API}/alertas`, { params: { activa: true } }),
        ]);
        
        setMunicipios(municipiosRes.data.municipios || []);
        setPueblosMagicos(pueblosRes.data.municipios || []);
        setEventos(eventosRes.data.eventos || []);
        setAlertas(alertasRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroImage = "https://static.prod-images.emergentagent.com/jobs/07c629d5-0a32-4a39-ad2b-56c36d398877/images/1dfbd1ccc2e730f1e11eae34660eec121d4642954de69a16ec66025b0dfad602.png";

  const quickLinks = [
    { href: "/explorar", labelKey: "nav.explore", icon: MapPin, color: "bg-[#1B5E20]" },
    { href: "/rutas", labelKey: "nav.routes", icon: BookOpen, color: "bg-[#6A1B9A]" },
    { href: "/emergencia", labelKey: "nav.emergencies", icon: ShieldAlert, color: "bg-[#D32F2F]" },
    { href: "/eventos", labelKey: "nav.events", icon: Calendar, color: "bg-[#0277BD]" },
    { href: "/prestadores", labelKey: "nav.providers", icon: Users, color: "bg-[#F9A825]" },
  ];

  const features = [
    { icon: Shield, titleKey: "features.safety", descKey: "features.safetyDesc" },
    { icon: BadgeCheck, titleKey: "features.verified", descKey: "features.verifiedDesc" },
    { icon: Heart, titleKey: "features.authentic", descKey: "features.authenticDesc" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]" data-testid="home-page">
      <Header />
      <AlertBanner alertas={alertas} />
      
      {/* Hero Section */}
      <section className="relative h-screen min-h-[700px] flex items-center justify-center">
        {/* Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 hero-overlay" />
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg"
            style={{ fontFamily: 'Playfair Display' }}
            data-testid="hero-title"
          >
            {t("hero.title")}
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar variant="hero" />
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-6 py-3 ${link.color} text-white rounded-xl font-medium hover:opacity-90 transition-opacity shadow-lg`}
                data-testid={`quick-link-${link.href.slice(1)}`}
              >
                <link.icon className="w-5 h-5" />
                {t(link.labelKey)}
              </Link>
            ))}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Pueblos Mágicos Section */}
      <section className="py-20 px-4" data-testid="pueblos-magicos-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-6 h-6 text-[#F9A825]" />
                <span className="text-[#F9A825] font-semibold uppercase tracking-wider text-sm">{t("sections.featuredDestinations")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display' }}>
                {t("sections.pueblosMagicos")}
              </h2>
            </div>
            <Link to="/explorar?filter=pueblo_magico" className="hidden md:flex items-center gap-2 text-[#1B5E20] font-medium hover:underline">
              {t("sections.viewAll")}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {pueblosMagicos.slice(0, 1).map((m) => (
              <div key={m.id} className="col-span-12 md:col-span-8 row-span-2">
                <MunicipioCard municipio={m} size="large" />
              </div>
            ))}
            {pueblosMagicos.slice(1, 3).map((m) => (
              <div key={m.id} className="col-span-12 md:col-span-4">
                <MunicipioCard municipio={m} />
              </div>
            ))}
          </div>
          
          {/* More Pueblos */}
          {pueblosMagicos.length > 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {pueblosMagicos.slice(3, 6).map((m) => (
                <MunicipioCard key={m.id} municipio={m} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Weather Section */}
      <section className="py-16 px-4 bg-white" data-testid="weather-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <CloudSun className="w-6 h-6 text-[#0277BD]" />
            <span className="text-[#0277BD] font-semibold uppercase tracking-wider text-sm">{t("sections.currentWeather")}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'Playfair Display' }}>
            {t("sections.weatherTitle")}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { ciudad: "Xalapa", temp: 18, condicionKey: "weather.cloudy", humedad: 78, viento: 12, color: "from-slate-500 to-slate-700" },
              { ciudad: "Veracruz", temp: 29, condicionKey: "weather.sunny", humedad: 65, viento: 18, color: "from-amber-400 to-orange-500" },
              { ciudad: "Orizaba", temp: 20, condicionKey: "weather.partlyCloudy", humedad: 60, viento: 8, color: "from-sky-400 to-blue-600" },
              { ciudad: "Coatepec", temp: 17, condicionKey: "weather.foggy", humedad: 82, viento: 6, color: "from-emerald-500 to-teal-700" },
            ].map((w) => (
              <div 
                key={w.ciudad}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${w.color} p-6 text-white shadow-lg`}
                data-testid={`weather-card-${w.ciudad.toLowerCase()}`}
              >
                <div className="absolute top-0 right-0 opacity-10">
                  <CloudSun className="w-32 h-32 -mt-6 -mr-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-white/80 text-sm font-medium mb-1">{w.ciudad}</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="text-5xl font-bold leading-none">{w.temp}°</span>
                    <span className="text-white/70 text-sm pb-1">C</span>
                  </div>
                  <p className="text-white/90 text-sm font-medium mb-4">{t(w.condicionKey)}</p>
                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5" />
                      {w.humedad}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5" />
                      {w.viento} km/h
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-20 px-4" data-testid="eventos-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-6 h-6 text-[#0277BD]" />
                <span className="text-[#0277BD] font-semibold uppercase tracking-wider text-sm">{t("sections.culturalAgenda")}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display' }}>
                {t("sections.upcomingEvents")}
              </h2>
            </div>
            <Link to="/eventos" className="hidden md:flex items-center gap-2 text-[#1B5E20] font-medium hover:underline">
              {t("sections.viewAll")}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.slice(0, 6).map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
          
          {eventos.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t("sections.comingSoonEvents")}</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Veracruz Contigo */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1B5E20] to-[#0D3311]" data-testid="features-section">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display' }}>
            {t("sections.whyUs")}
          </h2>
          <p className="text-white/80 mb-12 max-w-2xl mx-auto">
            {t("sections.whyUsSub")}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{t(feature.titleKey)}</h3>
                <p className="text-white/70">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Municipios Grid */}
      {municipios.length > 0 && (
        <section className="py-20 px-4" data-testid="municipios-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-6 h-6 text-[#1B5E20]" />
                  <span className="text-[#1B5E20] font-semibold uppercase tracking-wider text-sm">{t("sections.municipalities")}</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display' }}>
                  {t("sections.exploreVeracruz")}
                </h2>
              </div>
              <Link to="/explorar" className="hidden md:flex items-center gap-2 text-[#1B5E20] font-medium hover:underline">
                {t("sections.viewAll")}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {municipios.slice(0, 8).map((m) => (
                <MunicipioCard key={m.id} municipio={m} />
              ))}
            </div>
            
            <div className="text-center mt-10">
              <Link to="/explorar">
                <Button className="bg-[#1B5E20] hover:bg-[#145218] text-white px-8 py-6 text-lg rounded-xl">
                  <MapPin className="w-5 h-5 mr-2" />
                  {t("sections.exploreAll")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
      <PanicButton />
    </div>
  );
};

export default HomePage;
