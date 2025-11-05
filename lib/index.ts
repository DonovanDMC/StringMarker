import Marker from "./Marker.js";
import type { PathLike } from "node:fs";

export { default as Marker } from "./Marker.js";
export function createMarker(file: string | URL | PathLike, startTag: string, endTag: string, separator = "\n"): Marker {
    return new Marker(file, startTag, endTag, separator);
}
