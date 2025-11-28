import { createCanvas, Image } from 'canvas';

export interface RGBValue {
    r: number;
    g: number;
    b: number;
}

const MAX_DEPTH = 3;
const QUANTIZATION_DEFAULT_DEPTH = 0;

const fetchImageData = async (url: string): Promise<ImageData> => {
    const fetchResponse = await fetch(url);
    const buffer = await fetchResponse.arrayBuffer();

    const img = new Image();

    img.src = Buffer.from(buffer);

    const canvas = createCanvas(img.width, img.height);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);

    return ctx.getImageData(0, 0, img.width, img.height) as ImageData;
};

// credit https://github.com/zygisS22/color-palette-extraction
const buildRgb = (imageData: ImageData): RGBValue[] => {
    const imageDataArray = imageData.data;
    const rgbValues: RGBValue[] = [];
    for (let i = 0; i < imageDataArray.length; i += 4) {
        const rgb = {
            r: imageDataArray[i],
            g: imageDataArray[i + 1],
            b: imageDataArray[i + 2],
        };
        rgbValues.push(rgb);
    }
    return rgbValues;
};

//  Convert each pixel value ( number ) to hexadecimal ( string ) with base 16
const rgbToHex = (pixel: RGBValue): string => {
    const componentToHex = (c: number) => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return (
        '#' +
        componentToHex(pixel.r) +
        componentToHex(pixel.g) +
        componentToHex(pixel.b)
    ).toUpperCase();
};

// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues: RGBValue[]): 'r' | 'g' | 'b' => {
    /**
     * Min is initialized to the maximum value posible
     * from there we procced to find the minimum value for that color channel
     *
     * Max is initialized to the minimum value posible
     * from there we procced to fin the maximum value for that color channel
     */
    let rMin = Number.MAX_VALUE;
    let gMin = Number.MAX_VALUE;
    let bMin = Number.MAX_VALUE;

    let rMax = Number.MIN_VALUE;
    let gMax = Number.MIN_VALUE;
    let bMax = Number.MIN_VALUE;

    rgbValues.forEach((pixel) => {
        rMin = Math.min(rMin, pixel.r);
        gMin = Math.min(gMin, pixel.g);
        bMin = Math.min(bMin, pixel.b);

        rMax = Math.max(rMax, pixel.r);
        gMax = Math.max(gMax, pixel.g);
        bMax = Math.max(bMax, pixel.b);
    });

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    // determine which color has the biggest difference
    const biggestRange = Math.max(rRange, gRange, bRange);
    if (biggestRange === rRange) {
        return 'r';
    } else if (biggestRange === gRange) {
        return 'g';
    } else {
        return 'b';
    }
};

const quantization = (rgbValues: RGBValue[], depth: number): RGBValue[] => {
    /**
     * Color quantization
     * A process that reduces the number of colors used in an image
     * while trying to visually maintin the original image as much as possible
     */
    // Base case
    if (depth === MAX_DEPTH || rgbValues.length === 0) {
        const color = rgbValues.reduce(
            (prev, curr) => {
                prev.r += curr.r;
                prev.g += curr.g;
                prev.b += curr.b;

                return prev;
            },
            {
                r: 0,
                g: 0,
                b: 0,
            }
        );

        color.r = Math.round(color.r / rgbValues.length);
        color.g = Math.round(color.g / rgbValues.length);
        color.b = Math.round(color.b / rgbValues.length);

        return [color];
    }

    /**
     *  Recursively do the following:
     *  1. Find the pixel channel (red,green or blue) with biggest difference/range
     *  2. Order by this channel
     *  3. Divide in half the rgb colors list
     *  4. Repeat process again, until desired depth or base case
     */
    const componentToSortBy = findBiggestColorRange(rgbValues);
    rgbValues.sort((p1, p2) => {
        return p1[componentToSortBy] - p2[componentToSortBy];
    });

    const mid = rgbValues.length / 2;
    return [
        ...quantization(rgbValues.slice(0, mid), depth + 1),
        ...quantization(rgbValues.slice(mid + 1), depth + 1),
    ];
};

const orderByLuminance = (rgbValues: RGBValue[]): RGBValue[] => {
    const calculateLuminance = (rgbValue: RGBValue) => {
        return 0.2126 * rgbValue.r + 0.7152 * rgbValue.g + 0.0722 * rgbValue.b;
    };

    return rgbValues.sort((rgbValue1, rgbValue2) => {
        return calculateLuminance(rgbValue2) - calculateLuminance(rgbValue1);
    });
};

const getPalette = async (url: string): Promise<string[]> => {
    const imageData = await fetchImageData(url);

    if (
        !imageData ||
        typeof imageData.width !== 'number' ||
        typeof imageData.height !== 'number' ||
        !(imageData.data instanceof Uint8ClampedArray)
    ) {
        throw new Error('Unexpected imageData shape, expected ImageData');
    }

    const rgbArray = buildRgb(imageData);
    const quantColors = quantization(rgbArray, QUANTIZATION_DEFAULT_DEPTH);
    const orderedByLuminance = orderByLuminance(quantColors);
    const hexValues = orderedByLuminance.map((rgbElement) =>
        rgbToHex(rgbElement)
    );
    //////////////////////////////////////////////////////////////////////

    const isValidHexColor = (color: string): boolean => {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    };

    if (Array.isArray(hexValues)) {
        hexValues.forEach((value) => {
            if (!isValidHexColor(value)) {
                throw new Error(`Invalid hex color`);
            }
        });

        return hexValues;
    } else {
        throw new Error('Unexpected result type, expected string[]');
    }
};

export default getPalette;
