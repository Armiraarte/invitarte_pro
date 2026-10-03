import logoIcono from './components/images/pet/logo.webp';
import logoBlanco from './components/images/pet/logo_blanco.webp';
import logoNegro from './components/images/pet/logo_negro.webp';
import logoArmirarte from './components/images/logo_armirarte.webp';
import logoIconoSmall from './components/images/pet/logo-96.webp';
import logoBlancoSmall from './components/images/pet/logo_blanco-320.webp';
import logoArmirarteSmall from './components/images/logo_armirarte-96.webp';
import cursorVisual from './components/images/pet/pet_volteado_cursor_visual.webp';
import mockupLeft from './components/images/mockup/mockup1.webp';
import mockupCenter from './components/images/mockup/mockup2.webp';
import mockupRight from './components/images/mockup/mockup3.webp';
import benefitTiempo from './components/images/beneficios/tiempo.webp';
import benefitAmbiente from './components/images/beneficios/ambiente.webp';
import benefitDifusion from './components/images/beneficios/difusion.webp';
import benefitInnovacion from './components/images/beneficios/innovacion.webp';
import benefitInvitados from './components/images/beneficios/invitados.webp';
import heroBackground from './components/images/Nueva carpeta/fondo3.webp';
import processBackground from './components/images/Nueva carpeta/fondo5.webp';
import stockPortadaPrincipal from './components/images/stock/portada-principal.webp';
import stockDatosEvento from './components/images/stock/datos-evento.webp';
import stockMapaUbicacion from './components/images/stock/mapa-ubicacion.webp';
import stockCuentaRegresiva from './components/images/stock/cuenta-regresiva.webp';
import stockAmbienteVestimenta from './components/images/stock/ambiente-vestimenta.webp';
import stockAgregarCalendario from './components/images/stock/agregar-calendario.webp';
import stockProcessSupport from './components/images/stock/process-support.webp';

const LOCAL_LANDING_IMAGES = {
  brand: {
    logoIcono,
    logoBlanco,
    logoNegro,
    logoArmirarte
  },
  heroMockups: {
    left: mockupLeft,
    center: mockupCenter,
    right: mockupRight
  },
  benefitImages: {
    updateOnce: benefitTiempo,
    environment: benefitAmbiente,
    shareability: benefitDifusion,
    modernImpact: benefitInnovacion,
    guestClarity: benefitInvitados
  }
} as const;

/*
  Archivo concentrado de imagenes del landing.
  Todas las rutas usadas por splash, navbar, hero, beneficios,
  experiencia y footer viven aqui.
*/
export const CONTROL_IMAGES = {
  brand: LOCAL_LANDING_IMAGES.brand,

  ui: {
    cursorVisual
  },

  landingSlots: {
    splashLogo: LOCAL_LANDING_IMAGES.brand.logoBlanco,
    // Versiones pequenas: el logo se muestra a menos de 100px, no hace falta el original de 480px.
    navbarLogo: logoIconoSmall,
    footerBrandLogo: logoBlancoSmall,
    footerCreatorLogo: logoArmirarteSmall
  },

  heroSection: {
    background: heroBackground,
    mockups: LOCAL_LANDING_IMAGES.heroMockups
  },

  benefitsSection: {
    updateOnce: LOCAL_LANDING_IMAGES.benefitImages.updateOnce,
    guestClarity: LOCAL_LANDING_IMAGES.benefitImages.guestClarity,
    environment: LOCAL_LANDING_IMAGES.benefitImages.environment,
    shareability: LOCAL_LANDING_IMAGES.benefitImages.shareability,
    modernImpact: LOCAL_LANDING_IMAGES.benefitImages.modernImpact
  },

  processSection: {
    main: processBackground,
    support: stockProcessSupport
  },

  optionalIncludesSection: {
    portadaPrincipal: stockPortadaPrincipal,
    datosEvento: stockDatosEvento,
    mapaUbicacion: stockMapaUbicacion,
    cuentaRegresiva: stockCuentaRegresiva,
    ambienteVestimenta: stockAmbienteVestimenta,
    agregarCalendario: stockAgregarCalendario
  }
} as const;
