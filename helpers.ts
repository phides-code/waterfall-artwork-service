import { ResponseStructure } from './types';
import { headers, InvalidItemError } from './constants';

export const handleError = (process: string, error: Error) => {
    const errorMessage = error.message;
    console.log(process, 'caught error:', errorMessage);

    if (errorMessage === InvalidItemError) {
        return clientError(400, 'Invalid item');
    }

    return serverError(errorMessage);
};

export const clientError = (httpStatus: number, errorMessage: string) => {
    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return {
        statusCode: httpStatus,
        body: JSON.stringify(response),
        headers,
    };
};

export const serverError = (errorMessage: string) => {
    const response: ResponseStructure = {
        data: null,
        errorMessage,
    };

    return {
        statusCode: 500,
        body: JSON.stringify(response),
        headers,
    };
};
