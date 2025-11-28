import { APIGatewayEvent, APIGatewayProxyCallback } from 'aws-lambda';

export interface Entity {
    palette: string[];
    objectID: number;
    primaryImage: string;
    primaryImageSmall: string;
    title: string;
    artistDisplayName: string;
    objectDate: string;
    country: string;
}

export interface LambdaHandlerParams {
    event: APIGatewayEvent;
    callback: APIGatewayProxyCallback;
}

export interface ResponseStructure {
    data: Entity[] | Entity | null;
    errorMessage: string | null;
}

export interface ArtworkPathParams {
    artworkId: number;
}

export interface DepartmentPathParams {
    departmentId: number;
}

export interface ArtworkList {
    total: number;
    objectIDs: number[];
}
