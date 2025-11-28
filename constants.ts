export const OriginURL = 'https://waterfall.phil-code.com';
// export const OriginURL = 'http://localhost:5173';

export const headers = {
    'Access-Control-Allow-Origin': OriginURL,
    'Access-Control-Allow-Headers':
        'Content-Type, x-amz-content-sha256, x-amz-date, X-Amz-Security-Token, Authorization',
    'Access-Control-Allow-Credentials': 'true',
};

export const InvalidItemError = 'invalid item objectID';

export const NUM_OF_ARTWORKS = 4;
