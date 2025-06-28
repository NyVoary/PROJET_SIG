const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Route de test de connexion
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            success: true,
            message: 'Database connected successfully',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Récupérer toutes les stations
app.get('/api/stations', async (req, res) => {
    try {
        const query = `
            SELECT 
                id,
                osm_id,
                name,
                brand AS operator,
                amenity,
                addr_city,
                addr_stree AS address,
                addr_postc AS postal_code,
                ST_Y(geom) AS lat,
                ST_X(geom) AS lng,
                CASE 
                    WHEN shop = 'kiosk' THEN ARRAY['kiosk']
                    WHEN shop = 'yes' THEN ARRAY['boutique']
                    ELSE ARRAY['service_station']
                END AS services,
                CASE 
                    WHEN brand = 'Total' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Shell' THEN ARRAY['gasoil', 'essence', 'premium']
                    WHEN brand = 'Galana' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Jovena' THEN ARRAY['gasoil', 'essence']
                    ELSE ARRAY['gasoil']
                END AS fuel,
                CASE 
                    WHEN brand IN ('Total', 'Shell') THEN ARRAY['24h/24']
                    ELSE ARRAY['6h-22h']
                END AS hours,
                'gasoil' AS type
            FROM stations 
            WHERE amenity = 'fuel'
            ORDER BY name
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Error fetching stations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching stations',
            error: error.message
        });
    }
});

// Rechercher des stations avec filtres
app.get('/api/stations/search', async (req, res) => {
    try {
        const { name, services, fuel, hours } = req.query;
        
        let whereConditions = ["amenity = 'fuel'"];
        let queryParams = [];
        let paramCounter = 1;

        // Filtre par nom
        if (name && name.trim()) {
            whereConditions.push(`name ILIKE $${paramCounter}`);
            queryParams.push(`%${name.trim()}%`);
            paramCounter++;
        }

        // Filtre par services (boutique, kiosk, etc.)
        if (services) {
            const serviceArray = services.split(',').map(s => s.trim());
            if (serviceArray.includes('kiosk')) {
                whereConditions.push(`shop = 'kiosk'`);
            }
            if (serviceArray.includes('boutique')) {
                whereConditions.push(`shop = 'yes'`);
            }
        }

        // Filtre par carburant (tous ont du gasoil, certains ont de l'essence/premium)
        if (fuel) {
            const fuelArray = fuel.split(',').map(f => f.trim());
            if (fuelArray.includes('premium')) {
                whereConditions.push(`brand IN ('Shell', 'Total')`);
            } else if (fuelArray.includes('essence')) {
                whereConditions.push(`brand IS NOT NULL`);
            }
        }

        // Filtre par horaires
        if (hours) {
            const hourArray = hours.split(',').map(h => h.trim());
            if (hourArray.includes('24h/24')) {
                whereConditions.push(`brand IN ('Total', 'Shell')`);
            }
        }

        const query = `
            SELECT 
                id,
                osm_id,
                name,
                brand AS operator,
                amenity,
                addr_city,
                addr_stree AS address,
                addr_postc AS postal_code,
                ST_Y(geom) AS lat,
                ST_X(geom) AS lng,
                CASE 
                    WHEN shop = 'kiosk' THEN ARRAY['kiosk']
                    WHEN shop = 'yes' THEN ARRAY['boutique']
                    ELSE ARRAY['service_station']
                END AS services,
                CASE 
                    WHEN brand = 'Total' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Shell' THEN ARRAY['gasoil', 'essence', 'premium']
                    WHEN brand = 'Galana' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Jovena' THEN ARRAY['gasoil', 'essence']
                    ELSE ARRAY['gasoil']
                END AS fuel,
                CASE 
                    WHEN brand IN ('Total', 'Shell') THEN ARRAY['24h/24']
                    ELSE ARRAY['6h-22h']
                END AS hours,
                'gasoil' AS type
            FROM stations 
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY name
        `;
        
        const result = await pool.query(query, queryParams);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
            filters_applied: req.query
        });
    } catch (error) {
        console.error('Error searching stations:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching stations',
            error: error.message
        });
    }
});

// Récupérer une station par ID
app.get('/api/stations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                id,
                osm_id,
                name,
                brand AS operator,
                amenity,
                addr_city,
                addr_stree AS address,
                addr_postc AS postal_code,
                ST_Y(geom) AS lat,
                ST_X(geom) AS lng,
                CASE 
                    WHEN shop = 'kiosk' THEN ARRAY['kiosk']
                    WHEN shop = 'yes' THEN ARRAY['boutique']
                    ELSE ARRAY['service_station']
                END AS services,
                CASE 
                    WHEN brand = 'Total' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Shell' THEN ARRAY['gasoil', 'essence', 'premium']
                    WHEN brand = 'Galana' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Jovena' THEN ARRAY['gasoil', 'essence']
                    ELSE ARRAY['gasoil']
                END AS fuel,
                CASE 
                    WHEN brand IN ('Total', 'Shell') THEN ARRAY['24h/24']
                    ELSE ARRAY['6h-22h']
                END AS hours,
                'gasoil' AS type
            FROM stations 
            WHERE id = $1 AND amenity = 'fuel'
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Station not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching station:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching station',
            error: error.message
        });
    }
});

// Récupérer les filtres disponibles
app.get('/api/stations/filters', async (req, res) => {
    try {
        const servicesQuery = `
            SELECT DISTINCT 
                CASE 
                    WHEN shop = 'kiosk' THEN 'kiosk'
                    WHEN shop = 'yes' THEN 'boutique'
                    ELSE 'service_station'
                END AS service
            FROM stations 
            WHERE amenity = 'fuel' AND shop IS NOT NULL
        `;
        
        const fuelsQuery = `
            SELECT DISTINCT 
                UNNEST(CASE 
                    WHEN brand = 'Total' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Shell' THEN ARRAY['gasoil', 'essence', 'premium']
                    WHEN brand = 'Galana' THEN ARRAY['gasoil', 'essence']
                    WHEN brand = 'Jovena' THEN ARRAY['gasoil', 'essence']
                    ELSE ARRAY['gasoil']
                END) AS fuel_type
            FROM stations 
            WHERE amenity = 'fuel'
        `;
        
        const hoursQuery = `
            SELECT DISTINCT 
                CASE 
                    WHEN brand IN ('Total', 'Shell') THEN '24h/24'
                    ELSE '6h-22h'
                END AS hour_type
            FROM stations 
            WHERE amenity = 'fuel'
        `;
        
        const [servicesResult, fuelsResult, hoursResult] = await Promise.all([
            pool.query(servicesQuery),
            pool.query(fuelsQuery),
            pool.query(hoursQuery)
        ]);
        
        res.json({
            success: true,
            data: {
                services: servicesResult.rows.map(row => row.service).filter(Boolean),
                fuels: fuelsResult.rows.map(row => row.fuel_type).filter(Boolean),
                hours: hoursResult.rows.map(row => row.hour_type).filter(Boolean)
            }
        });
    } catch (error) {
        console.error('Error fetching filters:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching filters',
            error: error.message
        });
    }
});

// Récupérer les stations le long d'un itinéraire
app.get('/api/itinerary', async (req, res) => {
    try {
        const query = `
            SELECT 
                s.id,
                s.osm_id,
                s.name,
                s.brand AS operator,
                s.amenity,
                s.addr_city,
                s.addr_stree AS address,
                s.addr_postc AS postal_code,
                ST_Y(s.geom) AS lat,
                ST_X(s.geom) AS lng,
                CASE 
                    WHEN s.shop = 'kiosk' THEN ARRAY['kiosk']
                    WHEN s.shop = 'yes' THEN ARRAY['boutique']
                    ELSE ARRAY['service_station']
                END AS services,
                CASE 
                    WHEN s.brand = 'Total' THEN ARRAY['gasoil', 'essence']
                    WHEN s.brand = 'Shell' THEN ARRAY['gasoil', 'essence', 'premium']
                    WHEN s.brand = 'Galana' THEN ARRAY['gasoil', 'essence']
                    WHEN s.brand = 'Jovena' THEN ARRAY['gasoil', 'essence']
                    ELSE ARRAY['gasoil']
                END AS fuel,
                CASE 
                    WHEN s.brand IN ('Total', 'Shell') THEN ARRAY['24h/24']
                    ELSE ARRAY['6h-22h']
                END AS hours,
                'gasoil' AS type,
                ST_Distance(s.geom, r.geom) AS distance_to_route
            FROM stations s
            CROSS JOIN (
                SELECT ST_Union(geom) AS geom FROM route
            ) r
            WHERE s.amenity = 'fuel'
            AND ST_DWithin(s.geom, r.geom, 0.005)
            ORDER BY distance_to_route
        `;
        
        const result = await pool.query(query);
        
        res.json({
            success: true,
            data: result.rows,
            count: result.rows.length,
            message: 'Stations along the N7 route'
        });
    } catch (error) {
        console.error('Error fetching itinerary stations:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching itinerary stations',
            error: error.message
        });
    }
});

// Route pour les statistiques
app.get('/api/stats', async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_stations,
                COUNT(DISTINCT brand) as total_brands,
                COUNT(CASE WHEN shop = 'kiosk' THEN 1 END) as kiosk_count,
                COUNT(CASE WHEN brand IN ('Total', 'Shell') THEN 1 END) as major_brands_count
            FROM stations 
            WHERE amenity = 'fuel'
        `;
        
        const brandQuery = `
            SELECT brand, COUNT(*) as count
            FROM stations 
            WHERE amenity = 'fuel' AND brand IS NOT NULL
            GROUP BY brand
            ORDER BY count DESC
        `;
        
        const [statsResult, brandResult] = await Promise.all([
            pool.query(statsQuery),
            pool.query(brandQuery)
        ]);
        
        res.json({
            success: true,
            data: {
                general: statsResult.rows[0],
                brands: brandResult.rows
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Gestion globale des erreurs
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;