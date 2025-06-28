const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'stations_service',
    password: process.env.DB_PASSWORD || 'steve',
    port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🔄 Setting up database...');
        
        // Vérifier si PostGIS est installé
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
        await client.query('CREATE EXTENSION IF NOT EXISTS postgis_topology;');
        console.log('✅ PostGIS extensions verified');
        
        // Créer les index spatiaux s'ils n'existent pas
        try {
            await client.query('CREATE INDEX IF NOT EXISTS stations_geom_idx ON stations USING GIST (geom);');
            await client.query('CREATE INDEX IF NOT EXISTS route_geom_idx ON route USING GIST (geom);');
            console.log('✅ Spatial indexes created');
        } catch (error) {
            console.log('⚠️  Indexes may already exist:', error.message);
        }
        
        // Créer la vue buffer_zone si elle n'existe pas
        try {
            await client.query(`
                CREATE VIEW IF NOT EXISTS buffer_zone AS
                SELECT ST_Buffer(ST_Union(geom), 0.005) AS geom
                FROM route;
            `);
            console.log('✅ Buffer zone view created');
        } catch (error) {
            console.log('⚠️  Buffer zone view may already exist:', error.message);
        }
        
        // Vérifier les données
        const stationsCount = await client.query('SELECT COUNT(*) FROM stations WHERE amenity = \'fuel\'');
        const routeCount = await client.query('SELECT COUNT(*) FROM route');
        
        console.log(`📊 Database statistics:`);
        console.log(`   - Fuel stations: ${stationsCount.rows[0].count}`);
        console.log(`   - Route segments: ${routeCount.rows[0].count}`);
        
        // Test de requête spatiale
        const nearbyStations = await client.query(`
            SELECT COUNT(*) 
            FROM stations s, (SELECT ST_Union(geom) AS geom FROM route) r
            WHERE s.amenity = 'fuel' 
            AND ST_DWithin(s.geom, r.geom, 0.005)
        `);
        
        console.log(`   - Stations near route: ${nearbyStations.rows[0].count}`);
        console.log('✅ Database setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Exécuter le setup si ce fichier est appelé directement
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('🎉 Setup finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { setupDatabase };