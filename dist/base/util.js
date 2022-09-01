"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Util {
    constructor() { }
    swapHyphenToUnderscore(value) {
        return value.replace(/-/g, '_');
    }
    swapBackslashToSlash(value) {
        return value.replace(/\\/g, '/');
    }
    isString(value) {
        return typeof value === 'string';
    }
    isObject(value) {
        return typeof value === 'object';
    }
}
exports.default = Util;
