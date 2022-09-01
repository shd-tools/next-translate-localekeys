"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("node:path"));
const node_fs_1 = require("node:fs");
class FileSystem {
    constructor() { }
    readJSONFile(fromPath) {
        return this.readFile(fromPath).then((data) => JSON.parse(data));
    }
    async processDirectory(job, dir) {
        const entries = await node_fs_1.promises.readdir(dir);
        const jobs = [];
        for (const entry of entries) {
            jobs.push(this.getEntryStats(dir, entry).then((stats) => job({
                stats,
                name: entry,
                directory: dir,
                fromPath: this.join(dir, entry),
            })));
        }
        await this.waitForAllJobs(jobs);
    }
    async waitForAllJobs(...nestedJobs) {
        for (const nestedJob of nestedJobs) {
            if (Array.isArray(nestedJob)) {
                await this.waitForAllJobs(...nestedJob);
            }
            else {
                await nestedJob;
            }
        }
    }
    async appendFile(path, data) {
        await node_fs_1.promises.appendFile(path, new Uint8Array(Buffer.from(data)));
    }
    async writeFile(path, data) {
        await node_fs_1.promises.writeFile(path, new Uint8Array(Buffer.from(data)));
    }
    join(...paths) {
        return path.join(...paths);
    }
    readFile(fromPath) {
        return node_fs_1.promises.readFile(fromPath).then((data) => data.toString());
    }
    getEntryStats(dir, entry) {
        return node_fs_1.promises.stat(this.join(dir, entry));
    }
}
exports.default = FileSystem;
