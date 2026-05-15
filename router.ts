import { APIGatewayProxyEventPathParameters } from 'aws-lambda';
import { headers, localMode } from './constants';
import { clientError, handleError, serverError } from './helpers';
import { Entity, LambdaHandlerParams, ResponseStructure } from './types';
import { getEntity, getRandomArtworks } from './apiUtils';

export const router = async (handlerParams: LambdaHandlerParams) => {
    const { event } = handlerParams;

    if (!localMode) {
        const awsCfToken = process.env.AWS_CF_TOKEN;

        if (awsCfToken === '') {
            return serverError('Error reading token');
        }

        const providedCfToken = event.headers['X-CF-Token'];

        if (!providedCfToken || providedCfToken !== awsCfToken) {
            return clientError(403, 'token mismatch');
        }
    }

    switch (event.httpMethod) {
        case 'GET':
            return processGet(
                event.pathParameters as APIGatewayProxyEventPathParameters,
            );
        case 'OPTIONS':
            return processOptions();
        default:
            return clientError(405, 'method not allowed');
    }
};

const processGet = async (
    pathParameters: APIGatewayProxyEventPathParameters,
) => {
    if ('departmentId' in pathParameters) {
        return processGetRandom(pathParameters);
    }

    if ('artworkId' in pathParameters) {
        return processGetEntityById(pathParameters);
    }

    return clientError(403, 'invalid request');
};

const processGetRandom = async (
    pathParameters: APIGatewayProxyEventPathParameters,
) => {
    try {
        const { departmentId } = pathParameters;

        const entities: Entity[] = await getRandomArtworks(
            parseInt(departmentId as string),
        );

        const response: ResponseStructure = {
            data: entities,
            errorMessage: null,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers,
        };
    } catch (err) {
        return handleError('processGetRandom', err as Error);
    }
};

const processGetEntityById = async (
    pathParameters: APIGatewayProxyEventPathParameters,
) => {
    try {
        const { artworkId } = pathParameters;

        const entity: Entity = (await getEntity(
            parseInt(artworkId as string),
        )) as Entity;

        const response: ResponseStructure = {
            data: entity,
            errorMessage: null,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers,
        };
    } catch (err) {
        return handleError('processGetEntityById', err as Error);
    }
};

const processOptions = async () => {
    const corsHeaders = {
        'Access-Control-Allow-Methods': 'OPTIONS, GET',
        'Access-Control-Max-Age': '3600',
    };

    return {
        statusCode: 200,
        body: '',
        headers: { ...headers, ...corsHeaders },
    };
};
