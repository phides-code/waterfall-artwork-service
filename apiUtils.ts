import { NUM_OF_ARTWORKS } from './constants';
import getPalette from './getPalette';
import { ArtworkList, Entity } from './types';

const fetchArtwork = async (artworkId: number): Promise<Entity> => {
    console.log('fetch artworkId:', artworkId);

    const rawResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${artworkId}`
    );

    return await rawResponse.json();
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

        const result = (await fetchArtwork(candidateRandomArtworkId)) as Entity;

        // if this result has already been added or if doesn't have a valid primaryImageSmall url, pick again
        if (
            !randomArtworks.find(
                (artwork) => artwork.objectID === candidateRandomArtworkId
            ) &&
            result.primaryImageSmall !== null &&
            typeof result.primaryImageSmall === 'string' &&
            /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/.test(
                result.primaryImageSmall
            )
        ) {
            console.log(
                'adding random artwork to array: length is now',
                randomArtworks.length + 1
            );

            randomArtworks.push(result);
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
