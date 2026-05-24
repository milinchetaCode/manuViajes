-- =====================================================================
-- SUPABASE / POSTGRESQL SCHEMA FOR MANUVIAJES
-- =====================================================================
-- Puedes ejecutar estos comandos en el "SQL Editor" de tu panel de Supabase.

-- ---------------------------------------------------------------------
-- OPCIÓN RECOMENDADA (ESTILO GIST / CONFIG - ROBUSTO Y SIN ALTERACIONES)
-- Esta tabla almacena los paquetes y los destacados en formato JSONB.
-- Es ideal porque si agregas campos en el panel de administración en el futuro,
-- no necesitas modificar la estructura de la base de datos PostgreSQL.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mv_settings (
    key TEXT PRIMARY KEY,
    value JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE mv_settings ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso:
-- 1. Permitir lectura pública a cualquier visitante (para ver paquetes y destacados)
CREATE POLICY "Permitir lectura pública en mv_settings" ON mv_settings
    FOR SELECT USING (true);

-- 2. Permitir control total a la clave de servicio (service_role) o rol de administrador
CREATE POLICY "Permitir control total al rol del sistema" ON mv_settings
    FOR ALL USING (true);


-- ---------------------------------------------------------------------
-- DATOS INICIALES SEMILLA (OPCIONAL)
-- Ejecuta esto si quieres rellenar tu base de datos con paquetes iniciales si está vacía.
-- ---------------------------------------------------------------------

INSERT INTO mv_settings (key, value) VALUES 
('packages', '[
  {
    "id": "f1-monaco-pack",
    "eventName": "Paquete Gran Premio de Mónaco 2026",
    "ticketPrice": 1450,
    "flightInfo": "Vuelo ida y vuelta Buenos Aires / Niza con escalas",
    "hotelInfo": "Estadía de 4 noches en Hotel Best Western Laffayette Monaco",
    "description": "El paquete más espectacular del año para disfrutar de la carrera más legendaria de la F1 en vivo en el circuito callejero de Mónaco.",
    "availabilityDates": "Del 21 al 25 de mayo 2026",
    "visible": true,
    "foto": "f1",
    "photoUrl": ""
  },
  {
    "id": "futbol-clasico-pack",
    "eventName": "Paquete El Clásico - Real Madrid vs Barcelona",
    "ticketPrice": 890,
    "flightInfo": "Vuelo directo Madrid ida y vuelta",
    "hotelInfo": "Hotel Tryp Gran Vía de 3 estrellas, céntrico",
    "description": "Vive la máxima rivalidad del fútbol mundial con entradas garantizadas de Categoría 2 para el Estadio Santiago Bernabéu.",
    "availabilityDates": "Del 23 al 26 de octubre 2026",
    "visible": true,
    "foto": "futbol",
    "photoUrl": ""
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO mv_settings (key, value) VALUES 
('destacados', '[
  {
    "id": "f1-monaco",
    "photo": "/images/button/f1.jpeg"
  },
  {
    "id": "fb-clasico",
    "photo": "/images/button/futbol.jpeg"
  },
  {
    "id": "tn-roland",
    "photo": "/images/button/tenis.jpeg"
  }
]'::jsonb)
ON CONFLICT (key) DO NOTHING;
