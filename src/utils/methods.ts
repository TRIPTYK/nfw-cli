export enum Methods {
    GET,
    POST,
    PUT, 
    PATCH,
    DELETE,
    // OPTIONS,
    // HEAD,
    // CONNECT,
    // TRACE
}

export const methodList = Object.keys(Methods).splice(-Object.keys(Methods).length/2);