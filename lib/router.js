"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
class Router {
    routes;
    constructor() {
        this.routes = [];
    }
    get(uri, callback) {
        // throw an error if the route uri already exists to avoid confilicting routes
        this.routes.forEach(route => {
            if (route.uri === uri) {
                throw new Error(`the uri ${route.uri} already exists`);
            }
        });
        this.routes.push({
            uri,
            callback
        });
    }
    init() {
        this.routes.some(route => {
            let regEx = new RegExp(`^${route.uri}$`);
            let path = window.location.pathname;
            if (path.match(regEx)) {
                return route.callback({ path });
            }
        });
    }
}
exports.Router = Router;
