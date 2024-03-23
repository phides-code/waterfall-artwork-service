import { NUM_OF_ARTWORKS } from './constants';
import getPalette from './getPalette';
import { ArtworkList, Entity } from './types';

const fetchArtwork = async (artworkId: number): Promise<Entity> => {
    console.log('fetch artworkId:', artworkId);

    const rawResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${artworkId}`
    );

    const response = (await rawResponse.json()) as Entity;

    return {
        artistDisplayName: response.artistDisplayName,
        country: response.country,
        objectDate: response.objectDate,
        objectID: response.objectID,
        palette: response.palette,
        primaryImage: response.primaryImage,
        primaryImageSmall: response.primaryImageSmall,
        title: response.title,
    } as Entity;
};

const fetchRandomArtworksFromList = async (
    artworkList: ArtworkList
): Promise<Entity[]> => {
    const { total, objectIDs } = artworkList;
    console.log('getting ' + NUM_OF_ARTWORKS + ' of ' + total + ' artworks...');
    const randomArtworks: Entity[] = [];

    while (randomArtworks.length < NUM_OF_ARTWORKS) {
        const randomIndex = Math.floor(Math.random() * total);

        const candidateRandomArtworkId = objectIDs[randomIndex];

        const candidateRandomArtwork = (await fetchArtwork(
            candidateRandomArtworkId
        )) as Entity;

        // if this candidateRandomArtwork has already been added or if doesn't have a valid primaryImageSmall url, pick again
        if (
            !randomArtworks.find(
                (artwork) => artwork.objectID === candidateRandomArtworkId
            ) &&
            candidateRandomArtwork.primaryImageSmall !== null &&
            typeof candidateRandomArtwork.primaryImageSmall === 'string' &&
            /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(
                candidateRandomArtwork.primaryImageSmall
            )
        ) {
            console.log(
                'adding random artwork to array: length is now',
                randomArtworks.length + 1
            );

            randomArtworks.push(candidateRandomArtwork);
        } else {
            console.log('*** redoing random selection ***');
        }
    }

    return randomArtworks;
};

export const getRandomArtworks = async (
    departmentId: number
): Promise<Entity[]> => {
    // get all objectIDs for given department
    const rawResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&departmentId=${departmentId}&q=""`
    );

    const artworkList = (await rawResponse.json()) as ArtworkList;

    return await fetchRandomArtworksFromList(artworkList);
};

export const getEntity = async (artworkId: number): Promise<Entity> => {
    const artwork: Entity = await fetchArtwork(artworkId);

    const palette: string[] = await getPalette(
        artwork.primaryImageSmall as string
    );

    artwork.palette = palette;

    return artwork;
};
