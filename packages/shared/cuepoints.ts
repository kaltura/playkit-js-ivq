
export type Cuepoint = {
    id: string;
    startTime: number;
    endTime?: number
    text: string
};

// Uncomment if you need to parse cuepoint partner data.
// see https://github.com/kaltura/playkit-js-hotspots/blob/1ea67250bd6ac488afc6212fdd589e36601bba05/packages/shared/cuepoints.ts
// function toObject(
//     jsonAsString: string,
//     defaultValue: { [key: string]: any } = {}
// ): { error?: Error; result?: { [key: string]: any } } {
//     if (!jsonAsString) {
//         return defaultValue;
//     }
//
//     try {
//         return { result: JSON.parse(jsonAsString) };
//     } catch (e) {
//         return { error: e };
//     }
// }

export function convertToCuepoints(response: any): Cuepoint[] {
    const result: Cuepoint[] = [];

    (response.objects || []).forEach((cuepoint: any) => {
        result.push({
            id: cuepoint.id,
            startTime: cuepoint.startTime,
            endTime: cuepoint.endTime,
            text: cuepoint.text
        });
    });

    return result;
}
