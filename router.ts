import {
    APIGatewayProxyCallback,
    APIGatewayProxyEventPathParameters,
} from 'aws-lambda';
import { headers } from './constants';
import { clientError, handleError } from './helpers';
import {
    ArtworkPathParams,
    DepartmentPathParams,
    LambdaHandlerParams,
    ResponseStructure,
} from './types';
import { getRandomArtworks } from './apiUtils';

export const router = async (handlerParams: LambdaHandlerParams) => {
    const { event, callback } = handlerParams;

    switch (event.httpMethod) {
        case 'GET':
            return processGet(handlerParams);
        case 'OPTIONS':
            return processOptions(callback);
        default:
            // method not allowed
            return clientError(405, callback);
    }
};

const processGet = (handlerParams: LambdaHandlerParams) => {
    const { event, callback } = handlerParams;

    const pathParameters =
        event.pathParameters as APIGatewayProxyEventPathParameters;

    if ('departmentId' in pathParameters) {
        return processGetRandom(handlerParams);
    }

    if ('artworkId' in pathParameters) {
        return processGetEntityById(handlerParams);
    }

    return clientError(400, callback);
};

const processGetRandom = async (handlerParams: LambdaHandlerParams) => {
    const { callback, event } = handlerParams;
    try {
        const pathParameters =
            event.pathParameters as unknown as DepartmentPathParams;
        const { departmentId } = pathParameters;

        const entities = await getRandomArtworks(departmentId);

        const response: ResponseStructure = {
            data: entities,
            errorMessage: null,
        };

        return callback(null, {
            statusCode: 200,
            body: JSON.stringify(response),
            // body: 'OK',
            headers,
        });
    } catch (err) {
        handleError('processGetRandom', err as Error, callback);
    }
};

const processGetEntityById = async (handlerParams: LambdaHandlerParams) => {
    const { callback, event } = handlerParams;
    try {
        // const entity: Entity = (await getEntity(handlerParams)) as Entity;

        // const response: ResponseStructure = {
        //     data: entity,
        //     errorMessage: null,
        // };

        const pathParameters =
            event.pathParameters as unknown as ArtworkPathParams;

        return callback(null, {
            statusCode: 200,
            // body: JSON.stringify(response),
            body: 'OK',
            headers,
        });
    } catch (err) {
        handleError('processGetEntityById', err as Error, callback);
    }
};

const processOptions = async (callback: APIGatewayProxyCallback) => {
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
        'Access-Control-Max-Age': '3600',
    };

    return callback(null, {
        statusCode: 200,
        body: '',
        headers: { ...headers, ...corsHeaders },
    });
};
