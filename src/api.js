const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.XS2EVENT_API_KEY;
const DESC = process.env.XS2EVENT_MARKUP;

if (!API_KEY) {
  throw new Error('Missing XS2EVENT_API_KEY in environment variables.');
}

const apiClient = axios.create({
  //baseURL: 'https://testapi.xs2event.com/v1',
  baseURL: 'https://api.xs2event.com/v1',
  headers: {
    'X-API-Key': API_KEY,
    'Accept': 'application/json',
    'Accept-Language': 'es'
  }
});

apiClient.interceptors.request.use(request => request);

apiClient.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

// --- Helper: get date range (today -> 24 months later)
function getDateRange() {
  const today = new Date();
  const dateStart = today.toISOString().split('T')[0];

  const futureDate = new Date(today);
  futureDate.setMonth(futureDate.getMonth() + 24);
  const dateStop = futureDate.toISOString().split('T')[0];
  
  //console.log(`✅ date start: ${dateStart}`);
  //console.log(`✅ date stop: ${dateStop}`);

  return { dateStart, dateStop };
}

function filterTournamentsByDateRange(tournaments) {
  const today = new Date();
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(today.getFullYear() + 1);

  return tournaments.filter(tournament => {
    if (!tournament.date_start && !tournament.date_stop) return false;

    const startDate = tournament.date_start ? new Date(tournament.date_start) : null;
    const endDate = tournament.date_stop ? new Date(tournament.date_stop) : null;

    // Caso 1: empieza en el futuro
    if (startDate && startDate >= today && startDate <= oneYearFromNow) {
      return true;
    }

    // Caso 2: ya empezó pero todavía no terminó
    if (startDate && endDate && startDate <= today && endDate >= today) {
      return true;
    }

    return false;
  });
}

// --- Read destacados.json ---
// RENAMED: This function now reads the config objects directly
function getHighlightedEventConfig() {
  try {
    const filePath = path.join(__dirname, '../data/destacados.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const config = JSON.parse(raw);
    //console.log('💡 [apiClient.js] destacados.json content:', config); // Added for debugging
    return config; // This will now return [{id: "...", photo: "..."}, ...]
  } catch (e) {
    console.error('⚠️ [apiClient.js] Error reading destacados.json:', e.message);
    return [];
  }
}

// --- Eventos destacados ---
async function getHighlightedEvents() {
  try {
    // Call the new function to get the config objects (id and photo)
    const highlightedEventConfigs = getHighlightedEventConfig();
   // console.log('💡 [apiClient.js] Highlighted event configs received:', highlightedEventConfigs); // Added for debugging

    // Map each config object to an API request promise
    const promises = highlightedEventConfigs.map(config =>
      apiClient.get(`/events/${config.id}`).then(res => {
        const event = res.data;
        // Assign the 'photo' property from the config object to the fetched event
        event.photo = config.photo;
       // console.log(`💡 [apiClient.js] Fetched event ${config.id} and added photo '${config.photo}'. Resulting event object:`, event); // Added for debugging
        return event;
      }).catch(err => {
        // If a specific event fails to load, log the error but allow others to proceed
        console.error(`❌ [apiClient.js] Failed to fetch event ${config.id}:`, err.message);
        return null; // Return null for failed events
      })
    );

    // Wait for all promises to resolve, then filter out any failed events (nulls)
    const events = (await Promise.all(promises)).filter(event => event !== null);
   // console.log('✅ [apiClient.js] Final events array for template:', events); // Added for debugging

    return events;

  } catch (err) {
    console.error('❌ [apiClient.js] Failed to fetch highlighted events (outer catch):', err.message);
    return [];
  }
}

// --- Por deporte ---
async function fetchTournamentsBySport(sportType) {
  const { dateStart, dateStop } = getDateRange();
  console.log(`✅ sportType: ${sportType}`);
  try {
      const { data } = await apiClient.get('/tournaments', {
      params: {
        sport_type: sportType,
       page_size: 1000
      }
    });

    console.log(`✅ API devuelve ${data}`);
    console.log(`✅ Se encontraron ${data.tournaments.length} eventos para ${sportType}`);
    
    return data.tournaments || [];
  } catch (err) {
    console.error(`❌ [apiClient.js] Failed to fetch tournaments for ${sportType}:`, err.message); // Added logging
    return [];
  }
}

function groupTournamentIdsByYear(tournaments) {
  const byYear = {};
  tournaments.forEach(t => {
    const year = new Date(t.date_start).getFullYear();
    console.log(`✅ Año: ${year}`);
                      
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(t.tournament_id);
  });
  return byYear;
}

async function fetchEventsForTournaments(tournamentId) {
  const DESC = parseFloat(process.env.XS2EVENT_MARKUP || "1"); // markup

  try {
    const { data } = await apiClient.get('/events', {
      params: {
        tournament_id: tournamentId,
        page_size: 1000
      }
    });

    const formatPrice = (value) => {
      if (!value) return null;
      const priceWithMarkup = value * DESC;
      //ORIGINALMENTE const num = priceWithMarkup / 1000;
      const num = priceWithMarkup / 100;
      return Math.round(num).toLocaleString('de-DE', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      });
    };

    const events = (data.events || []).map((ev) => ({
      ...ev,
      min_ticket_price_eur: formatPrice(ev.min_ticket_price_eur),
      max_ticket_price_eur: formatPrice(ev.max_ticket_price_eur),
    }));

    return events;

  } catch (err) {
    console.error(
      `❌ Failed to fetch events for tournament ${tournamentId}:`,
      err.response?.data || err.message
    );
    return [];
  }
}


async function getEventsBySportByYear(sportType) {
  const tournaments = await fetchTournamentsBySport(sportType);
  console.log(`✅ tournaments ${tournaments?.length || 0}`);

  // 🔹 Primero filtramos por fecha
  const filteredTournaments = filterTournamentsByDateRange(tournaments);
  console.log(`👉 TORNEOS A FUTURO: ${filteredTournaments?.length || 0}`);

  // 🔹 Después filtramos solo los que tengan eventos
  const tournamentsWithEvents = filteredTournaments.filter(t => t.number_events > 0);
  console.log(`👉 TORNEOS CON EVENTOS: ${tournamentsWithEvents?.length || 0}`);

  const allEvents = [];

  // Iteramos cada torneo filtrado
  for (const tournament of tournamentsWithEvents) {
    const events = await fetchEventsForTournaments(tournament.tournament_id);
    allEvents.push(...events);
  }

  //console.log('👉 EVENTOS:', JSON.stringify(allEvents, null, 2));
  return allEvents;
}
// --- Wrappers por deporte ---
async function getF1EventsByYear() {
  return getEventsBySportByYear('formula1');
}

async function getFutbolEventsByYear() {
  return getEventsBySportByYear('soccer');
}

async function getTenisEventsByYear() {
  return getEventsBySportByYear('tennis');
}

async function getBasketEventsByYear() {
  return getEventsBySportByYear('basketball');
}

// --- Búsqueda y detalles ---
async function getEvents(query) {
  const { dateStart, dateStop } = getDateRange();
  const fields = ['city', 'event_name', 'tournament_name'];
  const seen = new Set();
  const results = [];

  for (const field of fields) {
    try {
      const res = await apiClient.get('/events', {
        params: {
          [field]: `ilike:${query}`,
          date_start: dateStart,
          date_stop: dateStop,
          page_size: 20
        }
      });

      const items = res.data?.items || [];
      for (const event of items) {
        if (!seen.has(event.event_id)) {
          seen.add(event.event_id);
          results.push(event);
        }
      }
    } catch (err) {
      console.error(`❌ [apiClient.js] Error during search for ${query} on field ${field}:`, err.message); // Added logging
      // Skip errors
    }
  }

  return results;
}

async function getEventDetails(id) {
  const DESC = parseFloat(process.env.XS2EVENT_MARKUP || "1"); // fallback a 1

  try {
    // 🔹 Obtener datos del evento
    const res = await apiClient.get(`/events/${id}`);
    const event = res.data;

    if (!event) return null;

    // 🔹 Función para aplicar markup y formateo
    const formatPrice = (value) => {
      if (value === undefined || value === null) return null;
      // ORIGINALMENTE return Math.round(value * DESC / 1000);
      return Math.round(value * DESC / 100);
    };

    // 🔹 Formatear precios del evento
    const minPrice = formatPrice(event.min_ticket_price_eur);
    const maxPrice = formatPrice(event.max_ticket_price_eur);

    // 🔹 Traer tickets del evento
    let tickets = [];
    try {
      const { data: ticketData } = await apiClient.get('/tickets', {
        params: { event_id: id, page_size: 1000, stock:'gt:0'  }
      });

      tickets = (ticketData.tickets || []).map(t => ({
        ...t,
        price_eur: formatPrice(t.local_rates.net_rate_eur)
      }));
    } catch (err) {
      console.error(`❌ Failed to fetch tickets for event ${id}:`, err.message);
    }

    return {
      ...event,
      min_ticket_price_eur: minPrice,
      max_ticket_price_eur: maxPrice,
      tickets
    };

  } catch (err) {
    console.error(`❌ [apiClient.js] Failed to get details for event ${id}:`, err.message);
    return null;
  }
}


// --- Exports ---
module.exports = {
  getEvents,
  getEventDetails,
  getF1EventsByYear,
  getFutbolEventsByYear,
  getTenisEventsByYear,
  getBasketEventsByYear,
  getHighlightedEvents
};
