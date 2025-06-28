const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Middleware de sécurité
const securityMiddleware = () => {
    return [
        helmet({
            crossOriginEmbedderPolicy: false,
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'"]
                }
            }
        }),
        compression(),
        morgan('combined')
    ];
};

// Middleware de validation API Key (optionnel)
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;
    
    // Si pas de clé API configurée, passer
    if (!validApiKey) {
        return next();
    }
    
    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or missing API key'
        });
    }
    
    next();
};

// Middleware de limitation de taux (simple)
const rateLimiter = () => {
    const requests = new Map();
    
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        const windowMs = 15 * 60 * 1000; // 15 minutes
        const maxRequests = 100; // 100 requêtes par fenêtre
        
        if (!requests.has(ip)) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        const requestInfo = requests.get(ip);
        
        if (now > requestInfo.resetTime) {
            requests.set(ip, { count: 1, resetTime: now + windowMs });
            return next();
        }
        
        if (requestInfo.count >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests, please try again later'
            });
        }
        
        requestInfo.count++;
        next();
    };
};

// Middleware de validation des paramètres de recherche
const validateSearchParams = (req, res, next) => {
    const { name, services, fuel, hours } = req.query;
    
    // Validation du nom (longueur max)
    if (name && name.length > 100) {
        return res.status(400).json({
            success: false,
            message: 'Search name too long (max 100 characters)'
        });
    }
    
    // Validation des services
    const validServices = ['kiosk', 'boutique', 'service_station'];
    if (services) {
        const serviceArray = services.split(',').map(s => s.trim());
        const invalidServices = serviceArray.filter(s => !validServices.includes(s));
        if (invalidServices.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid services: ${invalidServices.join(', ')}. Valid services: ${validServices.join(', ')}`
            });
        }
    }
    
    // Validation des carburants
    const validFuels = ['gasoil', 'essence', 'premium'];
    if (fuel) {
        const fuelArray = fuel.split(',').map(f => f.trim());
        const invalidFuels = fuelArray.filter(f => !validFuels.includes(f));
        if (invalidFuels.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid fuels: ${invalidFuels.join(', ')}. Valid fuels: ${validFuels.join(', ')}`
            });
        }
    }
    
    // Validation des horaires
    const validHours = ['24h/24', '6h-22h'];
    if (hours) {
        const hourArray = hours.split(',').map(h => h.trim());
        const invalidHours = hourArray.filter(h => !validHours.includes(h));
        if (invalidHours.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Invalid hours: ${invalidHours.join(', ')}. Valid hours: ${validHours.join(', ')}`
            });
        }
    }
    
    next();
};

module.exports = {
    securityMiddleware,
    validateApiKey,
    rateLimiter,
    validateSearchParams
};