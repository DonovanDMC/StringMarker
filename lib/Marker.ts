import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { PathLike } from "node:fs";

const pathString = (path: PathLike): string => path instanceof URL ? fileURLToPath(path) : String(path);
export default class Marker {
    endTag: string;
    file: PathLike;
    separator: string;
    startTag: string;
    constructor(file: PathLike, startTag: string, endTag: string, separator = "\n") {
        this.endTag = endTag;
        this.file = file instanceof URL ? fileURLToPath(file) : file;
        this.separator = separator;
        this.startTag = startTag;
    }

    async create(empty = false): Promise<void> {
        const current = await this.getCurrent();

        if (current === null) {
            const lines = await this.getLines();
            if (lines.length !== 0 && !/^\s*$/.test(lines.at(-1)!)) lines.push("");
            lines.push(this.startTag, this.endTag);
            await this.write(lines.join(this.separator));
        } else {
            if (empty && (current[0] + 1) < current[1]) {
                const lines = await this.getLines();
                lines.splice(current[0] + 1, current[1] - (current[0] + 1));
                await this.write(lines.join(this.separator));
            }

            return;
        }
    }

    async getContents(): Promise<string> {
        return readFile(this.file, "utf8");
    }

    async getCurrent(): Promise<[start: number, end: number] | null> {
        const lines = await this.getLines();
        const startIndex = lines.indexOf(this.startTag);
        const endIndex = lines.indexOf(this.endTag);

        if (startIndex === -1) {
            if (endIndex === -1) return null;
            throw new Error(`Mismatched start-end in ${pathString(this.file)}: found start "${this.startTag}" at ${startIndex}, expected to find end "${this.endTag}" but did not.`);
        } else if (endIndex === -1) {
            throw new Error(`Mismatched start-end in ${pathString(this.file)}: found end "${this.endTag}" at ${endIndex}, expected to find start "${this.startTag}" but did not.`);
        } else if (startIndex > endIndex) {
            throw new Error(`Mismatched start-end in ${pathString(this.file)}: found start "${this.startTag}" at ${startIndex} and end "${this.endTag}" at ${endIndex}, end before start.`);
        }

        return [startIndex, endIndex];
    }

    async getLines(): Promise<Array<string>> {
        return (await this.getContents()).split(this.separator);
    }

    async remove(): Promise<void> {
        const current = await this.getCurrent();
        if (current === null) return;

        const lines = await this.getLines();
        lines.splice(current[0], (current[1] - current[0]) + 1);
        await this.write(lines.join(this.separator));
    }

    async update(values: string | Array<string>): Promise<void> {
        if (typeof values === "string") values = values.split(this.separator);

        await this.create(true);

        const lines = await this.getLines();
        const [start] = (await this.getCurrent())!;
        lines.splice(start + 1, 0, ...values);
        await this.write(lines.join(this.separator));
    }

    async write(contents: string): Promise<void> {
        await writeFile(this.file, contents);
    }
}
