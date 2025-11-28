import { APIGatewayProxyCallback } from 'aws-lambda';
import * as http from 'http';
import { ResponseStructure } from './types';
import { headers, InvalidItemError } from './constants';

export const handleError = (
    process: string,
    error: Error,
    callback: APIGatewayProxyCallback
) => {
    const errorMessage = error.message;
    console.log(process, 'caught error:', errorMessage);

    if (errorMessage === InvalidItemError) {
        return clientError(400, callback);
    }

    return serverError(callback);
};

export const clientError = (
    httpStatus: number,
    callback: APIGatewayProxyCallback
) => {
    console.log('send client error message');
    const errorMessage: string =
        http.STATUS_CODES[httpStatus] || 'Unknown Status';

    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return callback(null, {
        statusCode: httpStatus,
        body: JSON.stringify(response),
        headers,
    });
};

export const serverError = (callback: APIGatewayProxyCallback) => {
    console.log('send server error message');
    const errorMessage: string = http.STATUS_CODES[500] as string;

    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return callback(null, {
        statusCode: 500,
        body: JSON.stringify(response),
        headers,
    });
};
