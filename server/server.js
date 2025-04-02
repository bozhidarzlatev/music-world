(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('http'), require('fs'), require('crypto')) :
        typeof define === 'function' && define.amd ? define(['http', 'fs', 'crypto'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Server = factory(global.http, global.fs, global.crypto));
}(this, (function (http, fs, crypto) {
    'use strict';

    function _interopDefaultLegacy(e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
    var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
    var crypto__default = /*#__PURE__*/_interopDefaultLegacy(crypto);

    class ServiceError extends Error {
        constructor(message = 'Service Error') {
            super(message);
            this.name = 'ServiceError';
        }
    }

    class NotFoundError extends ServiceError {
        constructor(message = 'Resource not found') {
            super(message);
            this.name = 'NotFoundError';
            this.status = 404;
        }
    }

    class RequestError extends ServiceError {
        constructor(message = 'Request error') {
            super(message);
            this.name = 'RequestError';
            this.status = 400;
        }
    }

    class ConflictError extends ServiceError {
        constructor(message = 'Resource conflict') {
            super(message);
            this.name = 'ConflictError';
            this.status = 409;
        }
    }

    class AuthorizationError extends ServiceError {
        constructor(message = 'Unauthorized') {
            super(message);
            this.name = 'AuthorizationError';
            this.status = 401;
        }
    }

    class CredentialError extends ServiceError {
        constructor(message = 'Forbidden') {
            super(message);
            this.name = 'CredentialError';
            this.status = 403;
        }
    }

    var errors = {
        ServiceError,
        NotFoundError,
        RequestError,
        ConflictError,
        AuthorizationError,
        CredentialError
    };

    const { ServiceError: ServiceError$1 } = errors;


    function createHandler(plugins, services) {
        return async function handler(req, res) {
            const method = req.method;
            console.info(`<< ${req.method} ${req.url}`);

            // Redirect fix for admin panel relative paths
            if (req.url.slice(-6) == '/admin') {
                res.writeHead(302, {
                    'Location': `http://${req.headers.host}/admin/`
                });
                return res.end();
            }

            let status = 200;
            let headers = {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            };
            let result = '';
            let context;

            // NOTE: the OPTIONS method results in undefined result and also it never processes plugins - keep this in mind
            if (method == 'OPTIONS') {
                Object.assign(headers, {
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                    'Access-Control-Allow-Credentials': false,
                    'Access-Control-Max-Age': '86400',
                    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, X-Authorization, X-Admin'
                });
            } else {
                try {
                    context = processPlugins();
                    await handle(context);
                } catch (err) {
                    if (err instanceof ServiceError$1) {
                        status = err.status || 400;
                        result = composeErrorObject(err.code || status, err.message);
                    } else {
                        // Unhandled exception, this is due to an error in the service code - REST consumers should never have to encounter this;
                        // If it happens, it must be debugged in a future version of the server
                        console.error(err);
                        status = 500;
                        result = composeErrorObject(500, 'Server Error');
                    }
                }
            }

            res.writeHead(status, headers);
            if (context != undefined && context.util != undefined && context.util.throttle) {
                await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
            }
            res.end(result);

            function processPlugins() {
                const context = { params: {} };
                plugins.forEach(decorate => decorate(context, req));
                return context;
            }

            async function handle(context) {
                const { serviceName, tokens, query, body } = await parseRequest(req);
                if (serviceName == 'admin') {
                    return ({ headers, result } = services['admin'](method, tokens, query, body));
                } else if (serviceName == 'favicon.ico') {
                    return ({ headers, result } = services['favicon'](method, tokens, query, body));
                }

                const service = services[serviceName];

                if (service === undefined) {
                    status = 400;
                    result = composeErrorObject(400, `Service "${serviceName}" is not supported`);
                    console.error('Missing service ' + serviceName);
                } else {
                    result = await service(context, { method, tokens, query, body });
                }

                // NOTE: logout does not return a result
                // in this case the content type header should be omitted, to allow checks on the client
                if (result !== undefined) {
                    result = JSON.stringify(result);
                } else {
                    status = 204;
                    delete headers['Content-Type'];
                }
            }
        };
    }



    function composeErrorObject(code, message) {
        return JSON.stringify({
            code,
            message
        });
    }

    async function parseRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const tokens = url.pathname.split('/').filter(x => x.length > 0);
        const serviceName = tokens.shift();
        const queryString = url.search.split('?')[1] || '';
        const query = queryString
            .split('&')
            .filter(s => s != '')
            .map(x => x.split('='))
            .reduce((p, [k, v]) => Object.assign(p, { [k]: decodeURIComponent(v.replace(/\+/g, " ")) }), {});

        let body;
        // If req stream has ended body has been parsed
        if (req.readableEnded) {
            body = req.body;
        } else {
            body = await parseBody(req);
        }

        return {
            serviceName,
            tokens,
            query,
            body
        };
    }

    function parseBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk) => body += chunk.toString());
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (err) {
                    resolve(body);
                }
            });
        });
    }

    var requestHandler = createHandler;

    class Service {
        constructor() {
            this._actions = [];
            this.parseRequest = this.parseRequest.bind(this);
        }

        /**
         * Handle service request, after it has been processed by a request handler
         * @param {*} context Execution context, contains result of middleware processing
         * @param {{method: string, tokens: string[], query: *, body: *}} request Request parameters
         */
        async parseRequest(context, request) {
            for (let { method, name, handler } of this._actions) {
                if (method === request.method && matchAndAssignParams(context, request.tokens[0], name)) {
                    return await handler(context, request.tokens.slice(1), request.query, request.body);
                }
            }
        }

        /**
         * Register service action
         * @param {string} method HTTP method
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        registerAction(method, name, handler) {
            this._actions.push({ method, name, handler });
        }

        /**
         * Register GET action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        get(name, handler) {
            this.registerAction('GET', name, handler);
        }

        /**
         * Register POST action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        post(name, handler) {
            this.registerAction('POST', name, handler);
        }

        /**
         * Register PUT action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        put(name, handler) {
            this.registerAction('PUT', name, handler);
        }

        /**
         * Register PATCH action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        patch(name, handler) {
            this.registerAction('PATCH', name, handler);
        }

        /**
         * Register DELETE action
         * @param {string} name Action name. Can be a glob pattern.
         * @param {(context, tokens: string[], query: *, body: *)} handler Request handler
         */
        delete(name, handler) {
            this.registerAction('DELETE', name, handler);
        }
    }

    function matchAndAssignParams(context, name, pattern) {
        if (pattern == '*') {
            return true;
        } else if (pattern[0] == ':') {
            context.params[pattern.slice(1)] = name;
            return true;
        } else if (name == pattern) {
            return true;
        } else {
            return false;
        }
    }

    var Service_1 = Service;

    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    var util = {
        uuid
    };

    const uuid$1 = util.uuid;


    const data = fs__default['default'].existsSync('./data') ? fs__default['default'].readdirSync('./data').reduce((p, c) => {
        const content = JSON.parse(fs__default['default'].readFileSync('./data/' + c));
        const collection = c.slice(0, -5);
        p[collection] = {};
        for (let endpoint in content) {
            p[collection][endpoint] = content[endpoint];
        }
        return p;
    }, {}) : {};

    const actions = {
        get: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            return responseData;
        },
        post: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            // TODO handle collisions, replacement
            let responseData = data;
            for (let token of tokens) {
                if (responseData.hasOwnProperty(token) == false) {
                    responseData[token] = {};
                }
                responseData = responseData[token];
            }

            const newId = uuid$1();
            responseData[newId] = Object.assign({}, body, { _id: newId });
            return responseData[newId];
        },
        put: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens.slice(0, -1)) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined && responseData[tokens.slice(-1)] !== undefined) {
                responseData[tokens.slice(-1)] = body;
            }
            return responseData[tokens.slice(-1)];
        },
        patch: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            console.log('Request body:\n', body);

            let responseData = data;
            for (let token of tokens) {
                if (responseData !== undefined) {
                    responseData = responseData[token];
                }
            }
            if (responseData !== undefined) {
                Object.assign(responseData, body);
            }
            return responseData;
        },
        delete: (context, tokens, query, body) => {
            tokens = [context.params.collection, ...tokens];
            let responseData = data;

            for (let i = 0; i < tokens.length; i++) {
                const token = tokens[i];
                if (responseData.hasOwnProperty(token) == false) {
                    return null;
                }
                if (i == tokens.length - 1) {
                    const body = responseData[token];
                    delete responseData[token];
                    return body;
                } else {
                    responseData = responseData[token];
                }
            }
        }
    };

    const dataService = new Service_1();
    dataService.get(':collection', actions.get);
    dataService.post(':collection', actions.post);
    dataService.put(':collection', actions.put);
    dataService.patch(':collection', actions.patch);
    dataService.delete(':collection', actions.delete);


    var jsonstore = dataService.parseRequest;

    /*
     * This service requires storage and auth plugins
     */

    const { AuthorizationError: AuthorizationError$1 } = errors;



    const userService = new Service_1();

    userService.get('me', getSelf);
    userService.post('register', onRegister);
    userService.post('login', onLogin);
    userService.get('logout', onLogout);


    function getSelf(context, tokens, query, body) {
        if (context.user) {
            const result = Object.assign({}, context.user);
            delete result.hashedPassword;
            return result;
        } else {
            throw new AuthorizationError$1();
        }
    }

    function onRegister(context, tokens, query, body) {
        return context.auth.register(body);
    }

    function onLogin(context, tokens, query, body) {
        return context.auth.login(body);
    }

    function onLogout(context, tokens, query, body) {
        return context.auth.logout();
    }

    var users = userService.parseRequest;

    const { NotFoundError: NotFoundError$1, RequestError: RequestError$1 } = errors;


    var crud = {
        get,
        post,
        put,
        patch,
        delete: del
    };


    function validateRequest(context, tokens, query) {
        /*
        if (context.params.collection == undefined) {
            throw new RequestError('Please, specify collection name');
        }
        */
        if (tokens.length > 1) {
            throw new RequestError$1();
        }
    }

    function parseWhere(query) {
        const operators = {
            '<=': (prop, value) => record => record[prop] <= JSON.parse(value),
            '<': (prop, value) => record => record[prop] < JSON.parse(value),
            '>=': (prop, value) => record => record[prop] >= JSON.parse(value),
            '>': (prop, value) => record => record[prop] > JSON.parse(value),
            '=': (prop, value) => record => record[prop] == JSON.parse(value),
            ' like ': (prop, value) => record => record[prop].toLowerCase().includes(JSON.parse(value).toLowerCase()),
            ' in ': (prop, value) => record => JSON.parse(`[${/\((.+?)\)/.exec(value)[1]}]`).includes(record[prop]),
        };
        const pattern = new RegExp(`^(.+?)(${Object.keys(operators).join('|')})(.+?)$`, 'i');

        try {
            let clauses = [query.trim()];
            let check = (a, b) => b;
            let acc = true;
            if (query.match(/ and /gi)) {
                // inclusive
                clauses = query.split(/ and /gi);
                check = (a, b) => a && b;
                acc = true;
            } else if (query.match(/ or /gi)) {
                // optional
                clauses = query.split(/ or /gi);
                check = (a, b) => a || b;
                acc = false;
            }
            clauses = clauses.map(createChecker);

            return (record) => clauses
                .map(c => c(record))
                .reduce(check, acc);
        } catch (err) {
            throw new Error('Could not parse WHERE clause, check your syntax.');
        }

        function createChecker(clause) {
            let [match, prop, operator, value] = pattern.exec(clause);
            [prop, value] = [prop.trim(), value.trim()];

            return operators[operator.toLowerCase()](prop, value);
        }
    }


    function get(context, tokens, query, body) {
        validateRequest(context, tokens);

        let responseData;

        try {
            if (query.where) {
                responseData = context.storage.get(context.params.collection).filter(parseWhere(query.where));
            } else if (context.params.collection) {
                responseData = context.storage.get(context.params.collection, tokens[0]);
            } else {
                // Get list of collections
                return context.storage.get();
            }

            if (query.sortBy) {
                const props = query.sortBy
                    .split(',')
                    .filter(p => p != '')
                    .map(p => p.split(' ').filter(p => p != ''))
                    .map(([p, desc]) => ({ prop: p, desc: desc ? true : false }));

                // Sorting priority is from first to last, therefore we sort from last to first
                for (let i = props.length - 1; i >= 0; i--) {
                    let { prop, desc } = props[i];
                    responseData.sort(({ [prop]: propA }, { [prop]: propB }) => {
                        if (typeof propA == 'number' && typeof propB == 'number') {
                            return (propA - propB) * (desc ? -1 : 1);
                        } else {
                            return propA.localeCompare(propB) * (desc ? -1 : 1);
                        }
                    });
                }
            }

            if (query.offset) {
                responseData = responseData.slice(Number(query.offset) || 0);
            }
            const pageSize = Number(query.pageSize) || 10;
            if (query.pageSize) {
                responseData = responseData.slice(0, pageSize);
            }

            if (query.distinct) {
                const props = query.distinct.split(',').filter(p => p != '');
                responseData = Object.values(responseData.reduce((distinct, c) => {
                    const key = props.map(p => c[p]).join('::');
                    if (distinct.hasOwnProperty(key) == false) {
                        distinct[key] = c;
                    }
                    return distinct;
                }, {}));
            }

            if (query.count) {

                return responseData.length;
            }

            if (query.select) {
                const props = query.select.split(',').filter(p => p != '');
                responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                function transform(r) {
                    const result = {};
                    props.forEach(p => result[p] = r[p]);
                    return result;
                }
            }

            if (query.load) {
                const props = query.load.split(',').filter(p => p != '');
                props.map(prop => {
                    const [propName, relationTokens] = prop.split('=');
                    const [idSource, collection] = relationTokens.split(':');
                    console.log(`Loading related records from "${collection}" into "${propName}", joined on "_id"="${idSource}"`);
                    const storageSource = collection == 'users' ? context.protectedStorage : context.storage;
                    responseData = Array.isArray(responseData) ? responseData.map(transform) : transform(responseData);

                    function transform(r) {
                        const seekId = r[idSource];
                        const related = storageSource.get(collection, seekId);
                        delete related.hashedPassword;
                        r[propName] = related;
                        return r;
                    }
                });
            }

        } catch (err) {
            console.error(err);
            if (err.message.includes('does not exist')) {
                throw new NotFoundError$1();
            } else {
                throw new RequestError$1(err.message);
            }
        }

        context.canAccess(responseData);

        return responseData;
    }

    function post(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length > 0) {
            throw new RequestError$1('Use PUT to update records');
        }
        context.canAccess(undefined, body);

        body._ownerId = context.user._id;
        let responseData;

        try {
            responseData = context.storage.add(context.params.collection, body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function put(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.set(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function patch(context, tokens, query, body) {
        console.log('Request body:\n', body);

        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing, body);

        try {
            responseData = context.storage.merge(context.params.collection, tokens[0], body);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    function del(context, tokens, query, body) {
        validateRequest(context, tokens);
        if (tokens.length != 1) {
            throw new RequestError$1('Missing entry ID');
        }

        let responseData;
        let existing;

        try {
            existing = context.storage.get(context.params.collection, tokens[0]);
        } catch (err) {
            throw new NotFoundError$1();
        }

        context.canAccess(existing);

        try {
            responseData = context.storage.delete(context.params.collection, tokens[0]);
        } catch (err) {
            throw new RequestError$1();
        }

        return responseData;
    }

    /*
     * This service requires storage and auth plugins
     */

    const dataService$1 = new Service_1();
    dataService$1.get(':collection', crud.get);
    dataService$1.post(':collection', crud.post);
    dataService$1.put(':collection', crud.put);
    dataService$1.patch(':collection', crud.patch);
    dataService$1.delete(':collection', crud.delete);

    var data$1 = dataService$1.parseRequest;

    const imgdata = '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Td4DLneAwSddMiRH8tMU8nng/Yy+KQsM3AKBNbe35j5OH4A0dbV8AxwcAqMFyl73eHd3e2//nmn29wOGi3Kv+RixSgAAEkxpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDQuNC4wLUV4aXYyIj4KIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgIHhtbG5zOmlwdGNFeHQ9Imh0dHA6Ly9pcHRjLm9yZy9zdGQvSXB0YzR4bXBFeHQvMjAwOC0wMi0yOS8iCiAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiCiAgICB4bWxuczpwbHVzPSJodHRwOi8vbnMudXNlcGx1cy5vcmcvbGRmL3htcC8xLjAvIgogICAgeG1sbnM6R0lNUD0iaHR0cDovL3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjdjZDM3NWM3LTcwNmItNDlkMy1hOWRkLWNmM2Q3MmMwY2I4ZCIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NGY2YTJlYy04ZjA5LTRkZTMtOTY3ZC05MTUyY2U5NjYxNTAiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDoxMmE1NzI5Mi1kNmJkLTRlYjQtOGUxNi1hODEzYjMwZjU0NWYiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IldpbmRvd3MiCiAgIEdJTVA6VGltZVN0YW1wPSIxNjEzMzAwNzI5NTMwNjQzIgogICBHSU1QOlZlcnNpb249IjIuMTAuMTIiCiAgIGRjOkZvcm1hdD0iaW1hZ2UvcG5nIgogICBwaG90b3Nob3A6Q3JlZGl0PSJHZXR0eSBJbWFnZXMvaVN0b2NrcGhvdG8iCiAgIHhtcDpDcmVhdG9yVG9vbD0iR0lNUCAyLjEwIgogICB4bXBSaWdodHM6V2ViU3RhdGVtZW50PSJodHRwczovL3d3dy5pc3RvY2twaG90by5jb20vbGVnYWwvbGljZW5zZS1hZ3JlZW1lbnQ/dXRtX21lZGl1bT1vcmdhbmljJmFtcDt1dG1fc291cmNlPWdvb2dsZSZhbXA7dXRtX2NhbXBhaWduPWlwdGN1cmwiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjOTQ2M2MxMC05OWE4LTQ1NDQtYmRlOS1mNzY0ZjdhODJlZDkiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoV2luZG93cykiCiAgICAgIHN0RXZ0OndoZW49IjIwMjEtMDItMTRUMTM6MDU6MjkiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgcGx1czpMaWNlbnNvclVSTD0iaHR0cHM6Ly93d3cuaXN0b2NrcGhvdG8uY29tL3Bob3RvL2xpY2Vuc2UtZ20xMTUwMzQ1MzQxLT91dG1fbWVkaXVtPW9yZ2FuaWMmYW1wO3V0bV9zb3VyY2U9Z29vZ2xlJmFtcDt1dG1fY2FtcGFpZ249aXB0Y3VybCIvPgogICAgPC9yZGY6U2VxPgogICA8L3BsdXM6TGljZW5zb3I+CiAgIDxkYzpjcmVhdG9yPgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaT5WbGFkeXNsYXYgU2VyZWRhPC9yZGY6bGk+CiAgICA8L3JkZjpTZXE+CiAgIDwvZGM6Y3JlYXRvcj4KICAgPGRjOmRlc2NyaXB0aW9uPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5TZXJ2aWNlIHRvb2xzIGljb24gb24gd2hpdGUgYmFja2dyb3VuZC4gVmVjdG9yIGlsbHVzdHJhdGlvbi48L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzpkZXNjcmlwdGlvbj4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/PmWJCnkAAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAHdElNRQflAg4LBR0CZnO/AAAARHRFWHRDb21tZW50AFNlcnZpY2UgdG9vbHMgaWNvbiBvbiB3aGl0ZSBiYWNrZ3JvdW5kLiBWZWN0b3IgaWxsdXN0cmF0aW9uLlwvEeIAAAMxSURBVHja7Z1bcuQwCEX7qrLQXlp2ynxNVWbK7dgWj3sl9JvYRhxACD369erW7UMzx/cYaychonAQvXM5ABYkpynoYIiEGdoQog6AYfywBrCxF4zNrX/7McBbuXJe8rXx/KBDULcGsMREzCbeZ4J6ME/9wVH5d95rogZp3npEgPLP3m2iUSGqXBJS5Dr6hmLm8kRuZABYti5TMaailV8LodNQwTTUWk4/WZk75l0kM0aZQdaZjMqkrQDAuyMVJWFjMB4GANXr0lbZBxQKr7IjI7QvVWkok/Jn5UHVh61CYPs+/i7eL9j3y/Au8WqoAIC34k8/9k7N8miLcaGWHwgjZXE/awyYX7h41wKMCskZM2HXAddDkTdglpSjz5bcKPbcCEKwT3+DhxtVpJvkEC7rZSgq32NMSBoXaCdiahDCKrND0fpX8oQlVsQ8IFQZ1VARdIF5wroekAjB07gsAgDUIbQHFENIDEX4CQANIVe8Iw/ASiACLXl28eaf579OPuBa9/mrELUYHQ1t3KHlZZnRcXb2/c7ygXIQZqjDMEzeSrOgCAhqYMvTUE+FKXoVxTxgk3DEPREjGzj3nAk/VaKyB9GVIu4oMyOlrQZgrBBEFG9PAZTfs3amYDGrP9Wl964IeFvtz9JFluIvlEvcdoXDOdxggbDxGwTXcxFRi/LdirKgZUBm7SUdJG69IwSUzAMWgOAq/4hyrZVaJISSNWHFVbEoCFEhyBrCtXS9L+so9oTy8wGqxbQDD350WTjNESVFEB5hdKzUGcV5QtYxVWR2Ssl4Mg9qI9u6FCBInJRXgfEEgtS9Cgrg7kKouq4mdcDNBnEHQvWFTdgdgsqP+MiluVeBM13ahx09AYSWi50gsF+I6vn7BmCEoHR3NBzkpIOw4+XdVBBGQUioblaZHbGlodtB+N/jxqwLX/x/NARfD8ADxTOCKIcwE4Lw0OIbguMYcGTlymEpHYLXIKx8zQEqIfS2lGJPaADFEBR/PMH79ErqtpnZmTBlvM4wgihPWDEEhXn1LISj50crNgfCp+dWHYQRCfb2zgfnBZmKGAyi914anK9Coi4LOMhoAn3uVtn+AGnLKxPUZnCuAAAAAElFTkSuQmCC';
    const img = Buffer.from(imgdata, 'base64');

    var favicon = (method, tokens, query, body) => {
        console.log('serving favicon...');
        const headers = {
            'Content-Type': 'image/png',
            'Content-Length': img.length
        };
        let result = img;

        return {
            headers,
            result
        };
    };

    var require$$0 = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n    <meta charset=\"UTF-8\">\r\n    <meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <title>SUPS Admin Panel</title>\r\n    <style>\r\n        * {\r\n            padding: 0;\r\n            margin: 0;\r\n        }\r\n\r\n        body {\r\n            padding: 32px;\r\n            font-size: 16px;\r\n        }\r\n\r\n        .layout::after {\r\n            content: '';\r\n            clear: both;\r\n            display: table;\r\n        }\r\n\r\n        .col {\r\n            display: block;\r\n            float: left;\r\n        }\r\n\r\n        p {\r\n            padding: 8px 16px;\r\n        }\r\n\r\n        table {\r\n            border-collapse: collapse;\r\n        }\r\n\r\n        caption {\r\n            font-size: 120%;\r\n            text-align: left;\r\n            padding: 4px 8px;\r\n            font-weight: bold;\r\n            background-color: #ddd;\r\n        }\r\n\r\n        table, tr, th, td {\r\n            border: 1px solid #ddd;\r\n        }\r\n\r\n        th, td {\r\n            padding: 4px 8px;\r\n        }\r\n\r\n        ul {\r\n            list-style: none;\r\n        }\r\n\r\n        .collection-list a {\r\n            display: block;\r\n            width: 120px;\r\n            padding: 4px 8px;\r\n            text-decoration: none;\r\n            color: black;\r\n            background-color: #ccc;\r\n        }\r\n        .collection-list a:hover {\r\n            background-color: #ddd;\r\n        }\r\n        .collection-list a:visited {\r\n            color: black;\r\n        }\r\n    </style>\r\n    <script type=\"module\">\nimport { html, render } from 'https://unpkg.com/lit-html@1.3.0?module';\nimport { until } from 'https://unpkg.com/lit-html@1.3.0/directives/until?module';\n\nconst api = {\r\n    async get(url) {\r\n        return json(url);\r\n    },\r\n    async post(url, body) {\r\n        return json(url, {\r\n            method: 'POST',\r\n            headers: { 'Content-Type': 'application/json' },\r\n            body: JSON.stringify(body)\r\n        });\r\n    }\r\n};\r\n\r\nasync function json(url, options) {\r\n    return await (await fetch('/' + url, options)).json();\r\n}\r\n\r\nasync function getCollections() {\r\n    return api.get('data');\r\n}\r\n\r\nasync function getRecords(collection) {\r\n    return api.get('data/' + collection);\r\n}\r\n\r\nasync function getThrottling() {\r\n    return api.get('util/throttle');\r\n}\r\n\r\nasync function setThrottling(throttle) {\r\n    return api.post('util', { throttle });\r\n}\n\nasync function collectionList(onSelect) {\r\n    const collections = await getCollections();\r\n\r\n    return html`\r\n    <ul class=\"collection-list\">\r\n        ${collections.map(collectionLi)}\r\n    </ul>`;\r\n\r\n    function collectionLi(name) {\r\n        return html`<li><a href=\"javascript:void(0)\" @click=${(ev) => onSelect(ev, name)}>${name}</a></li>`;\r\n    }\r\n}\n\nasync function recordTable(collectionName) {\r\n    const records = await getRecords(collectionName);\r\n    const layout = getLayout(records);\r\n\r\n    return html`\r\n    <table>\r\n        <caption>${collectionName}</caption>\r\n        <thead>\r\n            <tr>${layout.map(f => html`<th>${f}</th>`)}</tr>\r\n        </thead>\r\n        <tbody>\r\n            ${records.map(r => recordRow(r, layout))}\r\n        </tbody>\r\n    </table>`;\r\n}\r\n\r\nfunction getLayout(records) {\r\n    const result = new Set(['_id']);\r\n    records.forEach(r => Object.keys(r).forEach(k => result.add(k)));\r\n\r\n    return [...result.keys()];\r\n}\r\n\r\nfunction recordRow(record, layout) {\r\n    return html`\r\n    <tr>\r\n        ${layout.map(f => html`<td>${JSON.stringify(record[f]) || html`<span>(missing)</span>`}</td>`)}\r\n    </tr>`;\r\n}\n\nasync function throttlePanel(display) {\r\n    const active = await getThrottling();\r\n\r\n    return html`\r\n    <p>\r\n        Request throttling: </span>${active}</span>\r\n        <button @click=${(ev) => set(ev, true)}>Enable</button>\r\n        <button @click=${(ev) => set(ev, false)}>Disable</button>\r\n    </p>`;\r\n\r\n    async function set(ev, state) {\r\n        ev.target.disabled = true;\r\n        await setThrottling(state);\r\n        display();\r\n    }\r\n}\n\n//import page from '//unpkg.com/page/page.mjs';\r\n\r\n\r\nfunction start() {\r\n    const main = document.querySelector('main');\r\n    editor(main);\r\n}\r\n\r\nasync function editor(main) {\r\n    let list = html`<div class=\"col\">Loading&hellip;</div>`;\r\n    let viewer = html`<div class=\"col\">\r\n    <p>Select collection to view records</p>\r\n</div>`;\r\n    display();\r\n\r\n    list = html`<div class=\"col\">${await collectionList(onSelect)}</div>`;\r\n    display();\r\n\r\n    async function display() {\r\n        render(html`\r\n        <section class=\"layout\">\r\n            ${until(throttlePanel(display), html`<p>Loading</p>`)}\r\n        </section>\r\n        <section class=\"layout\">\r\n            ${list}\r\n            ${viewer}\r\n        </section>`, main);\r\n    }\r\n\r\n    async function onSelect(ev, name) {\r\n        ev.preventDefault();\r\n        viewer = html`<div class=\"col\">${await recordTable(name)}</div>`;\r\n        display();\r\n    }\r\n}\r\n\r\nstart();\n\n</script>\r\n</head>\r\n<body>\r\n    <main>\r\n        Loading&hellip;\r\n    </main>\r\n</body>\r\n</html>";

    const mode = process.argv[2] == '-dev' ? 'dev' : 'prod';

    const files = {
        index: mode == 'prod' ? require$$0 : fs__default['default'].readFileSync('./client/index.html', 'utf-8')
    };

    var admin = (method, tokens, query, body) => {
        const headers = {
            'Content-Type': 'text/html'
        };
        let result = '';

        const resource = tokens.join('/');
        if (resource && resource.split('.').pop() == 'js') {
            headers['Content-Type'] = 'application/javascript';

            files[resource] = files[resource] || fs__default['default'].readFileSync('./client/' + resource, 'utf-8');
            result = files[resource];
        } else {
            result = files.index;
        }

        return {
            headers,
            result
        };
    };

    /*
     * This service requires util plugin
     */

    const utilService = new Service_1();

    utilService.post('*', onRequest);
    utilService.get(':service', getStatus);

    function getStatus(context, tokens, query, body) {
        return context.util[context.params.service];
    }

    function onRequest(context, tokens, query, body) {
        Object.entries(body).forEach(([k, v]) => {
            console.log(`${k} ${v ? 'enabled' : 'disabled'}`);
            context.util[k] = v;
        });
        return '';
    }

    var util$1 = utilService.parseRequest;

    var services = {
        jsonstore,
        users,
        data: data$1,
        favicon,
        admin,
        util: util$1
    };

    const { uuid: uuid$2 } = util;


    function initPlugin(settings) {
        const storage = createInstance(settings.seedData);
        const protectedStorage = createInstance(settings.protectedData);

        return function decoreateContext(context, request) {
            context.storage = storage;
            context.protectedStorage = protectedStorage;
        };
    }


    /**
     * Create storage instance and populate with seed data
     * @param {Object=} seedData Associative array with data. Each property is an object with properties in format {key: value}
     */
    function createInstance(seedData = {}) {
        const collections = new Map();

        // Initialize seed data from file    
        for (let collectionName in seedData) {
            if (seedData.hasOwnProperty(collectionName)) {
                const collection = new Map();
                for (let recordId in seedData[collectionName]) {
                    if (seedData.hasOwnProperty(collectionName)) {
                        collection.set(recordId, seedData[collectionName][recordId]);
                    }
                }
                collections.set(collectionName, collection);
            }
        }


        // Manipulation

        /**
         * Get entry by ID or list of all entries from collection or list of all collections
         * @param {string=} collection Name of collection to access. Throws error if not found. If omitted, returns list of all collections.
         * @param {number|string=} id ID of requested entry. Throws error if not found. If omitted, returns of list all entries in collection.
         * @return {Object} Matching entry.
         */
        function get(collection, id) {
            if (!collection) {
                return [...collections.keys()];
            }
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!id) {
                const entries = [...targetCollection.entries()];
                let result = entries.map(([k, v]) => {
                    return Object.assign(deepCopy(v), { _id: k });
                });
                return result;
            }
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            const entry = targetCollection.get(id);
            return Object.assign(deepCopy(entry), { _id: id });
        }

        /**
         * Add new entry to collection. ID will be auto-generated
         * @param {string} collection Name of collection to access. If the collection does not exist, it will be created.
         * @param {Object} data Value to store.
         * @return {Object} Original value with resulting ID under _id property.
         */
        function add(collection, data) {
            const record = assignClean({ _ownerId: data._ownerId }, data);

            let targetCollection = collections.get(collection);
            if (!targetCollection) {
                targetCollection = new Map();
                collections.set(collection, targetCollection);
            }
            let id = uuid$2();
            // Make sure new ID does not match existing value
            while (targetCollection.has(id)) {
                id = uuid$2();
            }

            record._createdOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Replace entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Record will be replaced!
         * @return {Object} Updated entry.
         */
        function set(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = targetCollection.get(id);
            const record = assignSystemProps(deepCopy(data), existing);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Modify entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @param {Object} data Value to store. Shallow merge will be performed!
         * @return {Object} Updated entry.
         */
        function merge(collection, id, data) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }

            const existing = deepCopy(targetCollection.get(id));
            const record = assignClean(existing, data);
            record._updatedOn = Date.now();
            targetCollection.set(id, record);
            return Object.assign(deepCopy(record), { _id: id });
        }

        /**
         * Delete entry by ID
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {number|string} id ID of entry to update. Throws error if not found.
         * @return {{_deletedOn: number}} Server time of deletion.
         */
        function del(collection, id) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            if (!targetCollection.has(id)) {
                throw new ReferenceError('Entry does not exist: ' + id);
            }
            targetCollection.delete(id);

            return { _deletedOn: Date.now() };
        }

        /**
         * Search in collection by query object
         * @param {string} collection Name of collection to access. Throws error if not found.
         * @param {Object} query Query object. Format {prop: value}.
         * @return {Object[]} Array of matching entries.
         */
        function query(collection, query) {
            if (!collections.has(collection)) {
                throw new ReferenceError('Collection does not exist: ' + collection);
            }
            const targetCollection = collections.get(collection);
            const result = [];
            // Iterate entries of target collection and compare each property with the given query
            for (let [key, entry] of [...targetCollection.entries()]) {
                let match = true;
                for (let prop in entry) {
                    if (query.hasOwnProperty(prop)) {
                        const targetValue = query[prop];
                        // Perform lowercase search, if value is string
                        if (typeof targetValue === 'string' && typeof entry[prop] === 'string') {
                            if (targetValue.toLocaleLowerCase() !== entry[prop].toLocaleLowerCase()) {
                                match = false;
                                break;
                            }
                        } else if (targetValue != entry[prop]) {
                            match = false;
                            break;
                        }
                    }
                }

                if (match) {
                    result.push(Object.assign(deepCopy(entry), { _id: key }));
                }
            }

            return result;
        }

        return { get, add, set, merge, delete: del, query };
    }


    function assignSystemProps(target, entry, ...rest) {
        const whitelist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let prop of whitelist) {
            if (entry.hasOwnProperty(prop)) {
                target[prop] = deepCopy(entry[prop]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }


    function assignClean(target, entry, ...rest) {
        const blacklist = [
            '_id',
            '_createdOn',
            '_updatedOn',
            '_ownerId'
        ];
        for (let key in entry) {
            if (blacklist.includes(key) == false) {
                target[key] = deepCopy(entry[key]);
            }
        }
        if (rest.length > 0) {
            Object.assign(target, ...rest);
        }

        return target;
    }

    function deepCopy(value) {
        if (Array.isArray(value)) {
            return value.map(deepCopy);
        } else if (typeof value == 'object') {
            return [...Object.entries(value)].reduce((p, [k, v]) => Object.assign(p, { [k]: deepCopy(v) }), {});
        } else {
            return value;
        }
    }

    var storage = initPlugin;

    const { ConflictError: ConflictError$1, CredentialError: CredentialError$1, RequestError: RequestError$2 } = errors;

    function initPlugin$1(settings) {
        const identity = settings.identity;

        return function decorateContext(context, request) {
            context.auth = {
                register,
                login,
                logout
            };

            const userToken = request.headers['x-authorization'];
            if (userToken !== undefined) {
                let user;
                const session = findSessionByToken(userToken);
                if (session !== undefined) {
                    const userData = context.protectedStorage.get('users', session.userId);
                    if (userData !== undefined) {
                        console.log('Authorized as ' + userData[identity]);
                        user = userData;
                    }
                }
                if (user !== undefined) {
                    context.user = user;
                } else {
                    throw new CredentialError$1('Invalid access token');
                }
            }

            function register(body) {
                if (body.hasOwnProperty(identity) === false ||
                    body.hasOwnProperty('password') === false ||
                    body[identity].length == 0 ||
                    body.password.length == 0) {
                    throw new RequestError$2('Missing fields');
                } else if (context.protectedStorage.query('users', { [identity]: body[identity] }).length !== 0) {
                    throw new ConflictError$1(`A user with the same ${identity} already exists`);
                } else {
                    const newUser = Object.assign({}, body, {
                        [identity]: body[identity],
                        hashedPassword: hash(body.password)
                    });
                    const result = context.protectedStorage.add('users', newUser);
                    delete result.hashedPassword;

                    const session = saveSession(result._id);
                    result.accessToken = session.accessToken;

                    return result;
                }
            }

            function login(body) {
                const targetUser = context.protectedStorage.query('users', { [identity]: body[identity] });
                if (targetUser.length == 1) {
                    if (hash(body.password) === targetUser[0].hashedPassword) {
                        const result = targetUser[0];
                        delete result.hashedPassword;

                        const session = saveSession(result._id);
                        result.accessToken = session.accessToken;

                        return result;
                    } else {
                        throw new CredentialError$1('Login or password don\'t match');
                    }
                } else {
                    throw new CredentialError$1('Login or password don\'t match');
                }
            }

            function logout() {
                if (context.user !== undefined) {
                    const session = findSessionByUserId(context.user._id);
                    if (session !== undefined) {
                        context.protectedStorage.delete('sessions', session._id);
                    }
                } else {
                    throw new CredentialError$1('User session does not exist');
                }
            }

            function saveSession(userId) {
                let session = context.protectedStorage.add('sessions', { userId });
                const accessToken = hash(session._id);
                session = context.protectedStorage.set('sessions', session._id, Object.assign({ accessToken }, session));
                return session;
            }

            function findSessionByToken(userToken) {
                return context.protectedStorage.query('sessions', { accessToken: userToken })[0];
            }

            function findSessionByUserId(userId) {
                return context.protectedStorage.query('sessions', { userId })[0];
            }
        };
    }


    const secret = 'This is not a production server';

    function hash(string) {
        const hash = crypto__default['default'].createHmac('sha256', secret);
        hash.update(string);
        return hash.digest('hex');
    }

    var auth = initPlugin$1;

    function initPlugin$2(settings) {
        const util = {
            throttle: false
        };

        return function decoreateContext(context, request) {
            context.util = util;
        };
    }

    var util$2 = initPlugin$2;

    /*
     * This plugin requires auth and storage plugins
     */

    const { RequestError: RequestError$3, ConflictError: ConflictError$2, CredentialError: CredentialError$2, AuthorizationError: AuthorizationError$2 } = errors;

    function initPlugin$3(settings) {
        const actions = {
            'GET': '.read',
            'POST': '.create',
            'PUT': '.update',
            'PATCH': '.update',
            'DELETE': '.delete'
        };
        const rules = Object.assign({
            '*': {
                '.create': ['User'],
                '.update': ['Owner'],
                '.delete': ['Owner']
            }
        }, settings.rules);

        return function decorateContext(context, request) {
            // special rules (evaluated at run-time)
            const get = (collectionName, id) => {
                return context.storage.get(collectionName, id);
            };
            const isOwner = (user, object) => {
                return user._id == object._ownerId;
            };
            context.rules = {
                get,
                isOwner
            };
            const isAdmin = request.headers.hasOwnProperty('x-admin');

            context.canAccess = canAccess;

            function canAccess(data, newData) {
                const user = context.user;
                const action = actions[request.method];
                let { rule, propRules } = getRule(action, context.params.collection, data);

                if (Array.isArray(rule)) {
                    rule = checkRoles(rule, data);
                } else if (typeof rule == 'string') {
                    rule = !!(eval(rule));
                }
                if (!rule && !isAdmin) {
                    throw new CredentialError$2();
                }
                propRules.map(r => applyPropRule(action, r, user, data, newData));
            }

            function applyPropRule(action, [prop, rule], user, data, newData) {
                // NOTE: user needs to be in scope for eval to work on certain rules
                if (typeof rule == 'string') {
                    rule = !!eval(rule);
                }

                if (rule == false) {
                    if (action == '.create' || action == '.update') {
                        delete newData[prop];
                    } else if (action == '.read') {
                        delete data[prop];
                    }
                }
            }

            function checkRoles(roles, data, newData) {
                if (roles.includes('Guest')) {
                    return true;
                } else if (!context.user && !isAdmin) {
                    throw new AuthorizationError$2();
                } else if (roles.includes('User')) {
                    return true;
                } else if (context.user && roles.includes('Owner')) {
                    return context.user._id == data._ownerId;
                } else {
                    return false;
                }
            }
        };



        function getRule(action, collection, data = {}) {
            let currentRule = ruleOrDefault(true, rules['*'][action]);
            let propRules = [];

            // Top-level rules for the collection
            const collectionRules = rules[collection];
            if (collectionRules !== undefined) {
                // Top-level rule for the specific action for the collection
                currentRule = ruleOrDefault(currentRule, collectionRules[action]);

                // Prop rules
                const allPropRules = collectionRules['*'];
                if (allPropRules !== undefined) {
                    propRules = ruleOrDefault(propRules, getPropRule(allPropRules, action));
                }

                // Rules by record id 
                const recordRules = collectionRules[data._id];
                if (recordRules !== undefined) {
                    currentRule = ruleOrDefault(currentRule, recordRules[action]);
                    propRules = ruleOrDefault(propRules, getPropRule(recordRules, action));
                }
            }

            return {
                rule: currentRule,
                propRules
            };
        }

        function ruleOrDefault(current, rule) {
            return (rule === undefined || rule.length === 0) ? current : rule;
        }

        function getPropRule(record, action) {
            const props = Object
                .entries(record)
                .filter(([k]) => k[0] != '.')
                .filter(([k, v]) => v.hasOwnProperty(action))
                .map(([k, v]) => [k, v[action]]);

            return props;
        }
    }

    var rules = initPlugin$3;

    var identity = "email";
    var protectedData = {
        users: {
            "35c62d76-8152-4626-8712-eeb96381bea8": {
                email: "peter@abv.bg",
                firstName: "Pesho",
                lastName: "Minkov",
                avatar: "https://media.istockphoto.com/id/1325727757/photo/serious-funny-white-fold-cat-with-painted-black-eyebrows.jpg?s=612x612&w=0&k=20&c=_lxDK3xrun-VAg1hlV9qoHv1TmI2BhBwSNjlmvHvs2U=",
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "847ec027-f659-4086-8032-5173e2f9c93a": {
                email: "george@abv.bg",
                firstName: "George",
                lastName: "No Ne Lucas",
                avatar: "https://ichef.bbci.co.uk/ace/branded_news/1200/cpsprodpb/532A/production/_91409212_55df76d5-2245-41c1-8031-07a4da3f313f.jpg",
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            },
            "60f0cf0b-34b0-4abd-9769-8c42f830dffc": {
                email: "admin@abv.bg",
                firstName: "Admin",
                lastName: "Adminov",
                avatar: "data:image/jpeg;base64,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",
                hashedPassword: "fac7060c3e17e6f151f247eacb2cd5ae80b8c36aedb8764e18a41bbdc16aa302"
            }
            ,
            "1839c2b8-2aee-4f09-b28b-fe893ccfc806": {
                email: "bozhi.dar@abv.bg",
                firstName: "Bozhidar",
                lastName: "Zlatev",
                avatar: "https://i.imgflip.com/8muatt.png?a483696",
                _createdOn: 1742488046536,
                hashedPassword: "83313014ed3e2391aa1332615d2f053cf5c1bfe05ca1cbcb5582443822df6eb1"
            }
        },
        sessions: {
        }
    };
    var seedData = {
        items: {
            "149de21e-a780-43c4-9c09-088181ff0337": {
                "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806",
                "title": "Godsmack Tour 2025",
                "genre": "metal",
                "artist": "Godsmack ",
                "date": "2025-03-22",
                "descriptions": "European tour 2025",
                "price": "100",
                "imageUrl": "https://m.media-amazon.com/images/I/71QeOM3ZGLL._UF1000,1000_QL80_.jpg",
                "city": "Sofia",
                "venue": "Arena 8888",
                "category": "events",
                "uploadedBy": "Bozhidar Zlatev",
                "_createdOn": 1742846033149,
                "_id": "149de21e-a780-43c4-9c09-088181ff0337"
            },
            "80170509-75cd-451d-9e24-9c565728301a": {
                "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806",
                "title": "Lindemann 2025",
                "genre": "metal",
                "artist": "Till Lindemann",
                "date": "2025-12-08",
                "descriptions": "Till Lindemann, exceptional artist and singer of the industrial metal group Rammstein, will grant audiences an insight into the depths of his world in 2025 - from the end of October until the end of the year, fans can look forward to over 25 raw and completely reconceptualized arena shows on his solo \"Meine Welt\" tour across 17 countries in Europe.  Tickets on sale from Nov 18th at 4pm CET",
                "price": "138",
                "imageUrl": "https://d3u845fx6txnqz.cloudfront.net/events/j264-concerts-Till-Lindemann-.jpg",
                "city": "Sofia",
                "venue": "Arena 8888",
                "category": "events",
                "uploadedBy": "Bozhidar Zlatev",
                "_createdOn": 1742846161617,
                "_id": "80170509-75cd-451d-9e24-9c565728301a"
            },
            "179c7715-9fe8-4520-8b75-5790d8adad3c": {
                "_ownerId": "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
                "subCategory": "",
                "title": "Тениска Скандау",
                "genre": "рап",
                "artist": "Скандау",
                "date": "2025-03-01",
                "descriptions": "Бяла тениска Скандау",
                "price": "25",
                "color": "white",
                "imageUrl": "https://www.skandau.com/wp-content/uploads/2021/05/Screenshot-2021-05-10-at-20.37.29-290x370.png",
                "category": "merch",
                "uploadedBy": "Admin Adminov",
                "_createdOn": 1742847270686,
                "manufacturer":"Skandau",
                "_id": "179c7715-9fe8-4520-8b75-5790d8adad3c"
            },
            "c3f0800c-a349-4eec-a8a0-cc8a1d90513c": {
                "_ownerId": "35c62d76-8152-4626-8712-eeb96381bea8",
                "subCategory": "",
                "title": "50 Cent Chain",
                "genre": "rap",
                "artist": "50 Cent",
                "date": "2025-02-26",
                "descriptions": "50 Cent chain  ",
                "price": "110",
                "color": "gold",
                "imageUrl": "https://i.ebayimg.com/images/g/1BwAAOSw45tllHIm/s-l1200.jpg",
                "category": "merch",
                "uploadedBy": "Pesho Minkov",
                "_createdOn": 1742847396603,
                "manufacturer":"Lanec BG",
                "_id": "c3f0800c-a349-4eec-a8a0-cc8a1d90513c"
            },
            "bb4ab202-a637-4b47-9a5a-066e78c2fb7c": { "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806", "subCategory": "CD", "title": "21", "genre": "pop", "artist": "Adele", "date": "2011-01-01", "descriptions": "Adele", "price": "20", "imageUrl": "https://upload.wikimedia.org/wikipedia/en/thumb/1/1b/Adele_-_21.png/220px-Adele_-_21.png", "category": "albums", "uploadedBy": "Bozhidar Zlatev", "_createdOn": 1743580186695, "_id": "bb4ab202-a637-4b47-9a5a-066e78c2fb7c" },
            "626540ef-9574-449b-93fb-7e9be050419c": { "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806", "subCategory": "CD", "title": "Един мъж на 50", "genre": "естрада", "artist": "Веселин Маринов", "date": "2012-01-01", "descriptions": "Топ", "price": "30", "imageUrl": "https://emusic.bg/media/catalog/product/cache/1/image/600x/9df78eab33525d08d6e5fb8d27136e95/3/8/3800725022748.jpg", "category": "albums", "uploadedBy": "Bozhidar Zlatev", "_createdOn": 1743580260426, "_id": "626540ef-9574-449b-93fb-7e9be050419c" },
            "1cfc3490-14f0-4e37-b540-68fe267c4197": { "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806", "subCategory": "Vinyl", "title": "Like A Prayer", "genre": "pop", "artist": "Madona", "date": "2010-01-01", "descriptions": "The Silver Collection\"", "price": "35", "imageUrl": "https://shopuk.madonna.com/cdn/shop/files/Madonna_LikePrayer_1LP_Silver_ProductShot_e9494074-f9f0-40e5-8bee-da558b311704_590x.jpg?v=1722852703", "category": "albums", "uploadedBy": "Bozhidar Zlatev", "_createdOn": 1743580352171, "_id": "1cfc3490-14f0-4e37-b540-68fe267c4197" },
            "868091a4-62ff-411e-bbfb-513f167c7382": { "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806", "subCategory": "String", "title": "Guitar Epiphone SG Standard Heritage Cherry", "date": "2025-01-07", "descriptions": "Електрическа китара", "price": "950", "imageUrl": "https://muzikercdn.com/uploads/products/19388/1938893/main_33689998.jpg", "manufacturer": "Epiphone", "category": "instruments", "uploadedBy": "Bozhidar Zlatev", "_createdOn": 1743579991721, "_id": "868091a4-62ff-411e-bbfb-513f167c7382" },
            "6fe2c8e2-2dc0-42e8-9e72-569048c002d7": { "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806", "subCategory": "Percussion", "title": "Комплект електронни барабани", "date": "2024-08-06", "descriptions": "Alesis Nitro Max Kit", "price": "843", "imageUrl": "https://muzikercdn.com/uploads/products/15537/1553756/main_9cb4e278.jpg", "manufacturer": "Alesis", "category": "instruments", "uploadedBy": "Bozhidar Zlatev", "_createdOn": 1743580066382, "_id": "6fe2c8e2-2dc0-42e8-9e72-569048c002d7" },
            "b9678b92-0bf8-4b54-9510-aa70071eb64c": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","title":"Веско Маринов и оркестър 2025","genre":"страда","artist":"Веселин Маринов","date":"2025-11-24","descriptions":"23и 24.ноември 2025, НДК , зала 1","price":"90","imageUrl":"https://imgrabo.com/pics/businesses/febb94a59b7fed741dcaa52bdc3e4108.jpeg","city":"Sofia","venue":"NDK","category":"events","uploadedBy":"Bozhidar Zlatev","_createdOn":1743579640400,"_id":"b9678b92-0bf8-4b54-9510-aa70071eb64c"},
            "3da6638a-8ba7-4d3e-9056-25d9cf3699c8": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","title":"Limp Bizkit Leeds 2025","genre":"Metal","artist":"Limp Bizkit","date":"2025-08-24","descriptions":"Leeds Festival 2025","price":"250","imageUrl":"https://s1.ticketm.net/dam/a/64c/eb497eb3-ff71-4ed5-a798-a14d1b16764c_RETINA_PORTRAIT_3_2.jpg","city":"Leeds","venue":"Bramham Park","category":"events","uploadedBy":"Bozhidar Zlatev","_createdOn":1743579866190,"_id":"3da6638a-8ba7-4d3e-9056-25d9cf3699c8"},
            "179c7715-9fe8-4520-8b75-5790d8adad3c": {"_ownerId":"60f0cf0b-34b0-4abd-9769-8c42f830dffc","subCategory":"","title":"Тениска Скандау","genre":"рап","artist":"Скандау","date":"2025-03-01","descriptions":"Бяла тениска Скандау","price":"25","color":"white","imageUrl":"https://www.skandau.com/wp-content/uploads/2021/05/Screenshot-2021-05-10-at-20.37.29-290x370.png","category":"merch","uploadedBy":"Admin Adminov","_createdOn":1742847270686,"_id":"179c7715-9fe8-4520-8b75-5790d8adad3c"},
            "c3f0800c-a349-4eec-a8a0-cc8a1d90513c": {"_ownerId":"35c62d76-8152-4626-8712-eeb96381bea8","subCategory":"","title":"50 Cent Chain","genre":"rap","artist":"50 Cent","date":"2025-02-26","descriptions":"50 Cent chain  ","price":"110","color":"gold","imageUrl":"https://i.ebayimg.com/images/g/1BwAAOSw45tllHIm/s-l1200.jpg","category":"merch","uploadedBy":"Pesho Minkov","_createdOn":1742847396603,"_id":"c3f0800c-a349-4eec-a8a0-cc8a1d90513c"},
            "afdcb5ed-8704-4397-bff3-d9161f605775": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Drinkware","title":"Snoop Dogg Mug","genre":"rap","artist":"Snoop Dogg","date":"2024-08-08","descriptions":"Fo shizzle","price":"25","color":"mint","imageUrl":"data:image/jpeg;base64,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","manufacturer":"Chashko BG","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743577978407,"_id":"afdcb5ed-8704-4397-bff3-d9161f605775"},
            "akiob5ed-8704-4397-bff3-d9161f605775": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Drinkware","title":"Justin Bieber Water Bottle","genre":"pop","artist":"Justin Bieber","date":"2024-07-07","descriptions":"Yummy","price":"15","color":"white","imageUrl":"https://thebanyantee.com/cdn/shop/products/Justin-Sipper-yummy.jpg?v=1689255101","manufacturer":"Chashko BG","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743577978407,"_id":"akiob5ed-8704-4397-bff3-d9161f605775"},
            "88638ed5-bf75-4a5f-93e2-38bc08f1eb62": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Accessories","title":"Nirvana Keychain","genre":"rock","artist":"Nirvana","date":"2024-09-05","descriptions":"Nirvana genuine keychain ","price":"17","color":"black","imageUrl":"https://cdn.europosters.eu/image/750/keyring/nirvana-smiley-logo-i83889.jpg","manufacturer":"Kuku Ruku OOD","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743578101143,"_id":"88638ed5-bf75-4a5f-93e2-38bc08f1eb62"},
            "b74c5caa-564e-4926-8a32-96f4e37d2eb6": {"subCategory":"Apparel","title":"Тениска Мустака на България","genre":"Chalga","artist":"Milko Kalaidzhiev","date":"2025-03-01","descriptions":"Я елате пиУенца при батко","price":"50","color":"black","imageUrl":"https://clubz.bg/media/053/milko-kalaidziev-kmet-btv.l.webp","manufacturer":"Adivnas","category":"merch","_id":"b74c5caa-564e-4926-8a32-96f4e37d2eb6","_createdOn":1743578259340,"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","_updatedOn":1743578275394},
            "114f4bd5-cd99-49ef-bf2f-2b51526b61ec": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Apparel","title":"Eminem Sweatsgirt","genre":"rap","artist":"Eminem","date":"2025-04-01","descriptions":"will the real slim shade please stand up","price":"40","color":"black","imageUrl":"https://www.mpcteehouse.com/wp-content/uploads/2021/02/Eminem-The-Slim-Shady-Please-Stand-Up-80s-Hoodie.jpeg","manufacturer":"Nike","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743578436973,"_id":"114f4bd5-cd99-49ef-bf2f-2b51526b61ec"},
            "10f93ede-51e9-46d2-9031-f54fec07bc1b": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Collectibles","title":"The Weeknd broken nose band","genre":"rap","artist":"The Weeknd","date":"2025-01-01","descriptions":"Nose band for the real Weeknd fans","price":"35","color":"white","imageUrl":"https://i.ytimg.com/vi/6Nm9RZqBaBM/maxresdefault.jpg","manufacturer":"Dr. E!","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743578618718,"_id":"10f93ede-51e9-46d2-9031-f54fec07bc1b"},
            "bfcb9716-e15c-4ead-a230-4ad2f85d20ad": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Apparel","title":"Michael Jackson T-shirt","genre":"pop","artist":"Michael Jackson","date":"2024-07-25","descriptions":"he-heeee","price":"40","color":"white","imageUrl":"https://cdn.shopify.com/s/files/1/0090/2447/1140/files/437372F_large.jpg?v=1699659034","manufacturer":"New Yorker","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743578746385,"_id":"bfcb9716-e15c-4ead-a230-4ad2f85d20ad"},
            "7c7617d3-e0ab-41c7-b342-d85d3a4e8bea": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Apparel","title":"Molec Hat","genre":"pop","artist":"Molec","date":"2025-01-15","descriptions":"Molec hat","price":"25","color":"Grey","imageUrl":"https://www.molec-official.com/cdn/shop/files/HAT_3_0ad1dbe0-f37e-4869-91c5-e163aa2a657b.jpg?v=1723302790&width=2000","manufacturer":"Molec LTC","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743578955860,"_id":"7c7617d3-e0ab-41c7-b342-d85d3a4e8bea"},
            "daee554e-48d0-45f7-8feb-9706cf1fd322": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Accessories","title":"WAP Umbrella","genre":"rap","artist":"Cardi B","date":"2024-11-14","descriptions":"Cardi B WAP umbrella","price":"39","color":"black","imageUrl":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJdB8CZe-LCOLec7w_QXS8TIArWZM2Hh9AyA&s","manufacturer":"Potrebnosti Za Vseki OOD","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743579104996,"_id":"daee554e-48d0-45f7-8feb-9706cf1fd322"},
            "01c0e197-35cc-4763-a709-885783df8343": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Apparel","title":"Godsmack Neckless","genre":"metal","artist":"Godsmack ","date":"2024-06-19","descriptions":"Don't stand alone ","price":"53","color":"black","imageUrl":"https://i.etsystatic.com/10196895/r/il/ac83aa/6306920616/il_570xN.6306920616_8qrl.jpg","manufacturer":"Lanec BG","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743579204974,"_id":"01c0e197-35cc-4763-a709-885783df8343"},
            "8ab784f4-8fea-424f-9de7-6139d4427b8c": {"_ownerId":"1839c2b8-2aee-4f09-b28b-fe893ccfc806","subCategory":"Collectibles","title":"Книга Лили Иванова","genre":"естрада","artist":"Lili Ivanova","date":"2024-06-04","descriptions":"Лил, автор Георги Тошев","price":"30","color":"none","imageUrl":"https://www.ciela.com/media/catalog/product/cache/9a7ceae8a5abbd0253425b80f9ef99a5/l/i/lili-ciela.jpg","manufacturer":"Ciela ","category":"merch","uploadedBy":"Bozhidar Zlatev","_createdOn":1743579393209,"_id":"8ab784f4-8fea-424f-9de7-6139d4427b8c"}

},
    reviews: {
    "ff8c5265-fa87-4abf-8b83-e0b24ef8d13b": {
        "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806",
        "review": "Can''t wait",
        "rating": "5",
        "itemId": "80170509-75cd-451d-9e24-9c565728301a",
        "user": "Bozhidar Zlatev",
        "_createdOn": 1742846421696,
        "_id": "ff8c5265-fa87-4abf-8b83-e0b24ef8d13b"
    },
    "a230ec3e-6a90-4cb0-9d2e-fbb09dcffa83": {
        "_ownerId": "35c62d76-8152-4626-8712-eeb96381bea8",
        "review": "Къртачка!!",
        "rating": "5",
        "itemId": "80170509-75cd-451d-9e24-9c565728301a",
        "user": "Pesho Minkov",
        "_createdOn": 1742847563884,
        "_id": "a230ec3e-6a90-4cb0-9d2e-fbb09dcffa83"
    }
},
    carts: {
    "e6a4d9d6-fbba-46a6-9ff6-425a372d9d12": {
        "_ownerId": "1839c2b8-2aee-4f09-b28b-fe893ccfc806",
        "items": ["149de21e-a780-43c4-9c09-088181ff0337", "80170509-75cd-451d-9e24-9c565728301a", "c3f0800c-a349-4eec-a8a0-cc8a1d90513c"],
        "_createdOn": 1742992149028,
        "_id": "e6a4d9d6-fbba-46a6-9ff6-425a372d9d12"
    }
},
    recipes: {
    "3987279d-0ad4-4afb-8ca9-5b256ae3b298": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Easy Lasagna",
        img: "assets/lasagna.jpg",
        ingredients: [
            "1 tbsp Ingredient 1",
            "2 cups Ingredient 2",
            "500 g  Ingredient 3",
            "25 g Ingredient 4"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551279012
    },
    "8f414b4f-ab39-4d36-bedb-2ad69da9c830": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Grilled Duck Fillet",
        img: "assets/roast.jpg",
        ingredients: [
            "500 g  Ingredient 1",
            "3 tbsp Ingredient 2",
            "2 cups Ingredient 3"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551344360
    },
    "985d9eab-ad2e-4622-a5c8-116261fb1fd2": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Roast Trout",
        img: "assets/fish.jpg",
        ingredients: [
            "4 cups Ingredient 1",
            "1 tbsp Ingredient 2",
            "1 tbsp Ingredient 3",
            "750 g  Ingredient 4",
            "25 g Ingredient 5"
        ],
        steps: [
            "Prepare ingredients",
            "Mix ingredients",
            "Cook until done"
        ],
        _createdOn: 1613551388703
    }
},
    comments: {
    "0a272c58-b7ea-4e09-a000-7ec988248f66": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        content: "Great recipe!",
        recipeId: "8f414b4f-ab39-4d36-bedb-2ad69da9c830",
        _createdOn: 1614260681375,
        _id: "0a272c58-b7ea-4e09-a000-7ec988248f66"
    }
},
    records: {
    i01: {
        name: "John1",
        val: 1,
        _createdOn: 1613551388703
    },
    i02: {
        name: "John2",
        val: 1,
        _createdOn: 1613551388713
    },
    i03: {
        name: "John3",
        val: 2,
        _createdOn: 1613551388723
    },
    i04: {
        name: "John4",
        val: 2,
        _createdOn: 1613551388733
    },
    i05: {
        name: "John5",
        val: 2,
        _createdOn: 1613551388743
    },
    i06: {
        name: "John6",
        val: 3,
        _createdOn: 1613551388753
    },
    i07: {
        name: "John7",
        val: 3,
        _createdOn: 1613551388763
    },
    i08: {
        name: "John8",
        val: 2,
        _createdOn: 1613551388773
    },
    i09: {
        name: "John9",
        val: 3,
        _createdOn: 1613551388783
    },
    i10: {
        name: "John10",
        val: 1,
        _createdOn: 1613551388793
    }
},
    catches: {
    "07f260f4-466c-4607-9a33-f7273b24f1b4": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        angler: "Paulo Admorim",
        weight: 636,
        species: "Atlantic Blue Marlin",
        location: "Vitoria, Brazil",
        bait: "trolled pink",
        captureTime: 80,
        _createdOn: 1614760714812,
        _id: "07f260f4-466c-4607-9a33-f7273b24f1b4"
    },
    "bdabf5e9-23be-40a1-9f14-9117b6702a9d": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        angler: "John Does",
        weight: 554,
        species: "Atlantic Blue Marlin",
        location: "Buenos Aires, Argentina",
        bait: "trolled pink",
        captureTime: 120,
        _createdOn: 1614760782277,
        _id: "bdabf5e9-23be-40a1-9f14-9117b6702a9d"
    }
},
    furniture: {
},
    orders: {
},
    movies: {
    "1240549d-f0e0-497e-ab99-eb8f703713d7": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "Black Widow",
        description: "Natasha Romanoff aka Black Widow confronts the darker parts of her ledger when a dangerous conspiracy with ties to her past arises. Comes on the screens 2020.",
        img: "https://miro.medium.com/max/735/1*akkAa2CcbKqHsvqVusF3-w.jpeg",
        _createdOn: 1614935055353,
        _id: "1240549d-f0e0-497e-ab99-eb8f703713d7"
    },
    "143e5265-333e-4150-80e4-16b61de31aa0": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "Wonder Woman 1984",
        description: "Diana must contend with a work colleague and businessman, whose desire for extreme wealth sends the world down a path of destruction, after an ancient artifact that grants wishes goes missing.",
        img: "https://pbs.twimg.com/media/ETINgKwWAAAyA4r.jpg",
        _createdOn: 1614935181470,
        _id: "143e5265-333e-4150-80e4-16b61de31aa0"
    },
    "a9bae6d8-793e-46c4-a9db-deb9e3484909": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "Top Gun 2",
        description: "After more than thirty years of service as one of the Navy's top aviators, Pete Mitchell is where he belongs, pushing the envelope as a courageous test pilot and dodging the advancement in rank that would ground him.",
        img: "https://i.pinimg.com/originals/f2/a4/58/f2a458048757bc6914d559c9e4dc962a.jpg",
        _createdOn: 1614935268135,
        _id: "a9bae6d8-793e-46c4-a9db-deb9e3484909"
    }
},
    likes: {
},
    ideas: {
    "833e0e57-71dc-42c0-b387-0ce0caf5225e": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "Best Pilates Workout To Do At Home",
        description: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Minima possimus eveniet ullam aspernatur corporis tempore quia nesciunt nostrum mollitia consequatur. At ducimus amet aliquid magnam nulla sed totam blanditiis ullam atque facilis corrupti quidem nisi iusto saepe, consectetur culpa possimus quos? Repellendus, dicta pariatur! Delectus, placeat debitis error dignissimos nesciunt magni possimus quo nulla, fuga corporis maxime minus nihil doloremque aliquam quia recusandae harum. Molestias dolorum recusandae commodi velit cum sapiente placeat alias rerum illum repudiandae? Suscipit tempore dolore autem, neque debitis quisquam molestias officia hic nesciunt? Obcaecati optio fugit blanditiis, explicabo odio at dicta asperiores distinctio expedita dolor est aperiam earum! Molestias sequi aliquid molestiae, voluptatum doloremque saepe dignissimos quidem quas harum quo. Eum nemo voluptatem hic corrupti officiis eaque et temporibus error totam numquam sequi nostrum assumenda eius voluptatibus quia sed vel, rerum, excepturi maxime? Pariatur, provident hic? Soluta corrupti aspernatur exercitationem vitae accusantium ut ullam dolor quod!",
        img: "./images/best-pilates-youtube-workouts-2__medium_4x3.jpg",
        _createdOn: 1615033373504,
        _id: "833e0e57-71dc-42c0-b387-0ce0caf5225e"
    },
    "247efaa7-8a3e-48a7-813f-b5bfdad0f46c": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        title: "4 Eady DIY Idea To Try!",
        description: "Similique rem culpa nemo hic recusandae perspiciatis quidem, quia expedita, sapiente est itaque optio enim placeat voluptates sit, fugit dignissimos tenetur temporibus exercitationem in quis magni sunt vel. Corporis officiis ut sapiente exercitationem consectetur debitis suscipit laborum quo enim iusto, labore, quod quam libero aliquid accusantium! Voluptatum quos porro fugit soluta tempore praesentium ratione dolorum impedit sunt dolores quod labore laudantium beatae architecto perspiciatis natus cupiditate, iure quia aliquid, iusto modi esse!",
        img: "./images/brightideacropped.jpg",
        _createdOn: 1615033452480,
        _id: "247efaa7-8a3e-48a7-813f-b5bfdad0f46c"
    },
    "b8608c22-dd57-4b24-948e-b358f536b958": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        title: "Dinner Recipe",
        description: "Consectetur labore et corporis nihil, officiis tempora, hic ex commodi sit aspernatur ad minima? Voluptas nesciunt, blanditiis ex nulla incidunt facere tempora laborum ut aliquid beatae obcaecati quidem reprehenderit consequatur quis iure natus quia totam vel. Amet explicabo quidem repellat unde tempore et totam minima mollitia, adipisci vel autem, enim voluptatem quasi exercitationem dolor cum repudiandae dolores nostrum sit ullam atque dicta, tempora iusto eaque! Rerum debitis voluptate impedit corrupti quibusdam consequatur minima, earum asperiores soluta. A provident reiciendis voluptates et numquam totam eveniet! Dolorum corporis libero dicta laborum illum accusamus ullam?",
        img: "./images/dinner.jpg",
        _createdOn: 1615033491967,
        _id: "b8608c22-dd57-4b24-948e-b358f536b958"
    }
},
    catalog: {
    "53d4dbf5-7f41-47ba-b485-43eccb91cb95": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        make: "Table",
        model: "Swedish",
        year: 2015,
        description: "Medium table",
        price: 235,
        img: "./images/table.png",
        material: "Hardwood",
        _createdOn: 1615545143015,
        _id: "53d4dbf5-7f41-47ba-b485-43eccb91cb95"
    },
    "f5929b5c-bca4-4026-8e6e-c09e73908f77": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        make: "Sofa",
        model: "ES-549-M",
        year: 2018,
        description: "Three-person sofa, blue",
        price: 1200,
        img: "./images/sofa.jpg",
        material: "Frame - steel, plastic; Upholstery - fabric",
        _createdOn: 1615545572296,
        _id: "f5929b5c-bca4-4026-8e6e-c09e73908f77"
    },
    "c7f51805-242b-45ed-ae3e-80b68605141b": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        make: "Chair",
        model: "Bright Dining Collection",
        year: 2017,
        description: "Dining chair",
        price: 180,
        img: "./images/chair.jpg",
        material: "Wood laminate; leather",
        _createdOn: 1615546332126,
        _id: "c7f51805-242b-45ed-ae3e-80b68605141b"
    }
},
    teams: {
    "34a1cab1-81f1-47e5-aec3-ab6c9810efe1": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        name: "Storm Troopers",
        logoUrl: "/assets/atat.png",
        description: "These ARE the droids we're looking for",
        _createdOn: 1615737591748,
        _id: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1"
    },
    "dc888b1a-400f-47f3-9619-07607966feb8": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Team Rocket",
        logoUrl: "/assets/rocket.png",
        description: "Gotta catch 'em all!",
        _createdOn: 1615737655083,
        _id: "dc888b1a-400f-47f3-9619-07607966feb8"
    },
    "733fa9a1-26b6-490d-b299-21f120b2f53a": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        name: "Minions",
        logoUrl: "/assets/hydrant.png",
        description: "Friendly neighbourhood jelly beans, helping evil-doers succeed.",
        _createdOn: 1615737688036,
        _id: "733fa9a1-26b6-490d-b299-21f120b2f53a"
    }
},
    members: {
    "cc9b0a0f-655d-45d7-9857-0a61c6bb2c4d": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
        status: "member",
        _createdOn: 1616236790262,
        _updatedOn: 1616236792930
    },
    "61a19986-3b86-4347-8ca4-8c074ed87591": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237188183,
        _updatedOn: 1616237189016
    },
    "8a03aa56-7a82-4a6b-9821-91349fbc552f": {
        _ownerId: "847ec027-f659-4086-8032-5173e2f9c93a",
        teamId: "733fa9a1-26b6-490d-b299-21f120b2f53a",
        status: "member",
        _createdOn: 1616237193355,
        _updatedOn: 1616237195145
    },
    "9be3ac7d-2c6e-4d74-b187-04105ab7e3d6": {
        _ownerId: "35c62d76-8152-4626-8712-eeb96381bea8",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237231299,
        _updatedOn: 1616237235713
    },
    "280b4a1a-d0f3-4639-aa54-6d9158365152": {
        _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
        teamId: "dc888b1a-400f-47f3-9619-07607966feb8",
        status: "member",
        _createdOn: 1616237257265,
        _updatedOn: 1616237278248
    },
    "e797fa57-bf0a-4749-8028-72dba715e5f8": {
        _ownerId: "60f0cf0b-34b0-4abd-9769-8c42f830dffc",
        teamId: "34a1cab1-81f1-47e5-aec3-ab6c9810efe1",
        status: "member",
        _createdOn: 1616237272948,
        _updatedOn: 1616237293676
    }
}
    };
var rules$1 = {
    users: {
        ".create": false,
        ".read": [
            "Owner"
        ],
        ".update": false,
        ".delete": false
    },
    members: {
        ".update": "isOwner(user, get('teams', data.teamId))",
        ".delete": "isOwner(user, get('teams', data.teamId)) || isOwner(user, data)",
        "*": {
            teamId: {
                ".update": "newData.teamId = data.teamId"
            },
            status: {
                ".create": "newData.status = 'pending'"
            }
        }
    }
};
var settings = {
    identity: identity,
    protectedData: protectedData,
    seedData: seedData,
    rules: rules$1
};

const plugins = [
    storage(settings),
    auth(settings),
    util$2(),
    rules(settings)
];

const server = http__default['default'].createServer(requestHandler(plugins, services));

const port = 3030;

server.listen(port);

console.log(`Server started on port ${port}. You can make requests to http://localhost:${port}/`);
console.log(`Admin panel located at http://localhost:${port}/admin`);

var softuniPracticeServer = server;

return softuniPracticeServer;

})));
