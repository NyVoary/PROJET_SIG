// server.js
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuration de la base de données PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stations_service',
    password: process.env.DB_PASSWORD || 'steve',
    port: process.env.DB_PORT || 5432,
});

// Middleware
app.use(cors());
app.use(express.json());

// Test de connexion à la base de données
pool.on('connect', () => {
    console.log('Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
    console.error('Erreur de connexion à la base de données:', err);
});

// Routes API

// 1. Récupérer toutes les stations
app.get('/api/stations', async (req, res) => {

    console.log("station fangatahana");
    
    try {
        const query = `
            SELECT 
                s.id,
                s.osm_id,
                s.amenity,
                s.brand,
                s.name,
                s.name_en,
                s.operator,
                s.shop,
                s.latitude as lat,
                s.longitude as lng,
                r.addr_city,
                r.highway,
                r.ref
            FROM stations s
            LEFT JOIN route r ON ST_DWithin(
                ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326),
                ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326),
                0.001
            )
            WHERE s.latitude IS NOT NULL 
            AND s.longitude IS NOT NULL
            ORDER BY s.name
        `;
        
        const result = await pool.query(query);
        
        // Transformer les données pour correspondre au frontend
        const stations = result.rows.map(row => ({
            id: row.id,
            osm_id: row.osm_id,
            name: row.name || row.name_en || 'Station sans nom',
            operator: row.operator || row.brand || 'Non spécifié',
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            address: row.highway || '',
            addr_city: row.addr_city || '',
            // Simulation des services basés sur amenity et shop
            services: getServicesFromData(row),
            // Simulation des carburants (adapté aux filtres frontend)
            fuel: getFuelTypes(row),
            type: getFuelTypes(row)[0] || 'gasoil', // Pour compatibilité avec le filtre initial
            // Simulation des horaires (vous pouvez adapter selon vos besoins)
            hours: ['6h-22h']
        }));

        res.json({
            success: true,
            data: stations,
            count: stations.length
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des stations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des stations',
            error: error.message
        });
    }
});

// 2. Rechercher des stations avec filtres
app.get('/api/stations/search', async (req, res) => {
    try {
        const { name, operator, services, fuel, hours } = req.query;
        
        let query = `
            SELECT 
                s.id,
                s.osm_id,
                s.amenity,
                s.brand,
                s.name,
                s.name_en,
                s.operator,
                s.shop,
                s.latitude as lat,
                s.longitude as lng,
                r.addr_city,
                r.highway,
                r.ref
            FROM stations s
            LEFT JOIN route r ON ST_DWithin(
                ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326),
                ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326),
                0.001
            )
            WHERE s.latitude IS NOT NULL 
            AND s.longitude IS NOT NULL
        `;
        
        const queryParams = [];
        let paramCounter = 1;
        
        // Filtre par nom
        if (name && name.trim()) {
            query += ` AND (LOWER(s.name) LIKE LOWER($${paramCounter}) OR LOWER(s.name_en) LIKE LOWER($${paramCounter}))`;
            queryParams.push(`%${name.trim()}%`);
            paramCounter++;
        }
        
        // Filtre par opérateur
        if (operator) {
            const operators = Array.isArray(operator) ? operator : operator.split(',');
            const operatorConditions = operators.map(() => {
                const condition = `(LOWER(s.operator) = LOWER($${paramCounter}) OR LOWER(s.brand) = LOWER($${paramCounter}))`;
                paramCounter++;
                return condition;
            });
            query += ` AND (${operatorConditions.join(' OR ')})`;
            operators.forEach(op => queryParams.push(op.trim()));
        }
        
        // Filtre par amenity (services)
        if (services) {
            const servicesList = Array.isArray(services) ? services : services.split(',');
            if (servicesList.includes('service_station')) {
                query += ` AND s.amenity = 'fuel'`;
            }
        }
        
        query += ` ORDER BY s.name`;
        
        const result = await pool.query(query, queryParams);
        
        // Transformer les données
        let stations = result.rows.map(row => ({
            id: row.id,
            osm_id: row.osm_id,
            name: row.name || row.name_en || 'Station sans nom',
            operator: row.operator || row.brand || 'Non spécifié',
            lat: parseFloat(row.lat),
            lng: parseFloat(row.lng),
            address: row.highway || '',
            addr_city: row.addr_city || '',
            services: getServicesFromData(row),
            fuel: getFuelTypes(row),
            type: getFuelTypes(row)[0] || 'gasoil',
            hours: ['6h-22h']
        }));
        
        // Filtres post-traitement (pour fuel et hours)
        if (fuel) {
            const fuelTypes = Array.isArray(fuel) ? fuel : fuel.split(',');
            stations = stations.filter(station => 
                station.fuel.some(f => fuelTypes.includes(f))
            );
        }
        
        if (hours) {
            const hourTypes = Array.isArray(hours) ? hours : hours.split(',');
            stations = stations.filter(station => 
                station.hours.some(h => hourTypes.includes(h))
            );
        }
        
        res.json({
            success: true,
            data: stations,
            count: stations.length,
            filters: req.query
        });
    } catch (error) {
        console.error('Erreur lors de la recherche des stations:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la recherche',
            error: error.message
        });
    }
});

// 3. Récupérer les filtres disponibles
app.get('/api/stations/filters', async (req, res) => {
    try {
        const operatorsQuery = `
            SELECT DISTINCT 
                COALESCE(operator, brand) as operator
            FROM stations 
            WHERE COALESCE(operator, brand) IS NOT NULL
            ORDER BY operator
        `;
        
        const citiesQuery = `
            SELECT DISTINCT addr_city
            FROM route 
            WHERE addr_city IS NOT NULL
            ORDER BY addr_city
        `;
        
        const [operatorsResult, citiesResult] = await Promise.all([
            pool.query(operatorsQuery),
            pool.query(citiesQuery)
        ]);
        
        const filters = {
            operators: operatorsResult.rows.map(row => row.operator),
            cities: citiesResult.rows.map(row => row.addr_city),
            services: ['service_station'],
            fuel: ['essence', 'gasoil'],
            hours: ['6h-22h']
        };
        
        res.json({
            success: true,
            data: filters
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des filtres:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des filtres',
            error: error.message
        });
    }
});

// 4. Récupérer une station par ID
app.get('/api/stations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                s.*,
                r.addr_city,
                r.highway,
                r.ref
            FROM stations s
            LEFT JOIN route r ON ST_DWithin(
                ST_SetSRID(ST_MakePoint(s.longitude, s.latitude), 4326),
                ST_SetSRID(ST_MakePoint(r.longitude, r.latitude), 4326),
                0.001
            )
            WHERE s.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Station non trouvée'
            });
        }
        
        const row = result.rows[0];
        const station = {
            id: row.id,
            osm_id: row.osm_id,
            name: row.name || row.name_en || 'Station sans nom',
            operator: row.operator || row.brand || 'Non spécifié',
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            address: row.highway || '',
            addr_city: row.addr_city || '',
            services: getServicesFromData(row),
            fuel: getFuelTypes(row),
            hours: ['6h-22h']
        };
        
        res.json({
            success: true,
            data: station
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la station:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération de la station',
            error: error.message
        });
    }
});

// Route de test
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API des stations-service fonctionne correctement',
        timestamp: new Date().toISOString()
    });
});

// Ajoutez ces routes dans votre server.js après les routes existantes

// 5. Récupérer tous les points de la route
app.get('/api/route', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                addr_city,
                highway,
                oneway,
                ref,
                latitude,
                longitude
            FROM route 
            WHERE latitude IS NOT NULL 
            AND longitude IS NOT NULL
            ORDER BY id
        `;
        
        const result = await pool.query(query);
        
        // Transformer les données pour la carte
        const routePoints = result.rows.map(row => ({
            id: row.id,
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            addr_city: row.addr_city,
            highway: row.highway,
            oneway: row.oneway,
            ref: row.ref
        }));

        res.json({
            success: true,
            data: routePoints,
            count: routePoints.length
        });

        console.log("route fangatahana")
    } catch (error) {
        console.error('Erreur lors de la récupération de la route:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération de la route',
            error: error.message
        });
    }
});

// 6. Récupérer les informations de la route (métadonnées)
app.get('/api/route/info', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total_points,
                MIN(addr_city) as start_city,
                MAX(addr_city) as end_city,
                ARRAY_AGG(DISTINCT highway) as highways,
                ARRAY_AGG(DISTINCT ref) as refs
            FROM route 
            WHERE latitude IS NOT NULL 
            AND longitude IS NOT NULL
        `;
        
        const result = await pool.query(query);
        const info = result.rows[0];

        res.json({
            success: true,
            data: {
                totalPoints: parseInt(info.total_points),
                startCity: info.start_city,
                endCity: info.end_city,
                highways: info.highways.filter(h => h !== null),
                refs: info.refs.filter(r => r !== null),
                description: "Route d'Andoharanofotsy à Analakely"
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des infos de route:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de la récupération des infos de route',
            error: error.message
        });
    }
});

// Fonctions utilitaires
function getServicesFromData(row) {
    const services = [];
    
    if (row.amenity === 'fuel') {
        services.push('service_station');
    }
    
    if (row.shop) {
        services.push(row.shop);
    }
    
    return services.length > 0 ? services : ['service_station'];
}

function getFuelTypes(row) {
    // Logique pour déterminer les types de carburant
    // Vous pouvez adapter cette logique selon vos données
    const fuelTypes = [];
    
    // Par défaut, on assume que toutes les stations ont essence et gasoil
    fuelTypes.push('essence', 'gasoil');
    
    return fuelTypes;
}

// Middleware de gestion d'erreurs
app.use((error, req, res, next) => {
    console.error('Erreur non gérée:', error);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erreur interne'
    });
});


// Route 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint non trouvé',
        path: req.originalUrl
    });
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
    console.log(`API accessible sur http://localhost:${port}/api`);
    console.log(`Test de santé: http://localhost:${port}/api/health`);
});

module.exports = app;