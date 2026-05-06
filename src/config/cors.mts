export const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://localhost:5173',
        'https://localhost:4200',
        'https://localhost:5173',
    ],
    allowMethods: ['DELETE', 'GET', 'HEAD', 'POST', 'PUT'],
    allowedHeaders: [
        'Accept',
        'Authorization',
        'Content-Type',
        'If-Match',
        'If-None-Match',
        'Origin',
    ],
    exposedHeaders: [
        'Content-Type',
        'ETag',
        'Location',
        'Strict-Transport-Security',
        'X-Content-Type-Options',
    ],
    maxAge: 86_400,
};
