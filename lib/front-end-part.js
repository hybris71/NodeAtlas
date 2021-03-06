/*------------------------------------*\
    $%FRONT-END PART
\*------------------------------------*/
/* jslint node: true */

/**
 * Open a temlpate file.
 * @private
 * @function openTemplate
 * @memberOf NA#
 * @param {Object} routeParameters  Parameters set into `routes[<currentRoute>]`.
 * @param {Object} viewsPath           Path to template file.
 * @param {openTemplate~callback} callback Next steps after opening file.
 */
exports.openTemplate = function (routeParameters, viewsPath, callback) {
    var NA = this,
        fs = NA.modules.fs;

    fs.readFile(viewsPath, 'utf-8', function (err, data) {
        if (NA.webconfig.commonView) {
            data = data.replace("#{routeParameters.view}", routeParameters.view);
        }
        if (err) {
            err.viewsPath = viewsPath;
            if (typeof routeParameters.view === 'undefined') {
                NA.log(NA.cliLabels.viewNotSet);
            } else {
                NA.log(NA.cliLabels.viewNotFound.replace(/%([\-a-zA-Z0-9_]+)%/g, function (regex, matches) { return err[matches]; }));
            }
        } else {

            /**
             * Next steps after opening file.
             * @callback openTemplate~callback
             * @param {string} data All HTML data from template.
             */
            callback(data);
        }
   });
};

/**
 * Open a variation file.
 * @private
 * @function openVariation
 * @memberOf NA#
 * @param {string} variationName Name of JSON file.
 * @param {string} languageCode  Current language for this variation.
 * @param {boolean|undefined} errorDisabled Force no error message.
 * @returns {Object|boolean} Return all data from JSON or false if an error occured.
 */
exports.openVariation = function (variationName, languageCode, errorDisabled) {
    var NA = this,
        fs = NA.modules.fs,
        path = NA.modules.path,
        variationsPath;

        /* Find the correct path for variations. */
        variationsPath = path.join(
            NA.serverPath,
            NA.webconfig.variationsRelativePath,
            (languageCode) ? languageCode : '',
            (variationName) ? variationName : ''
        );

    /* Explain errors. */
    function explainError(err) {
        err.variationsPath = variationsPath;
        if (err.code === 'ENOENT' && !errorDisabled && !languageCode) {
            NA.log(NA.cliLabels.variationNotFound.replace(/%([\-a-zA-Z0-9_]+)%/g, function (regex, matches) { return err[matches]; }));
        } else if (err.toString().indexOf('SyntaxError') !== -1) {
            err.syntaxError = err.toString();
            NA.log(NA.cliLabels.variationSyntaxError.replace(/%([\-a-zA-Z0-9_]+)%/g, function (regex, matches) { return err[matches]; }));
        } else if (err.code !== 'ENOENT') {
            NA.log(err);
        }
        return false;
    }

    if (typeof variationName !== 'undefined') {
        try {
            /* Return the variations variable into an object. */
            return JSON.parse(fs.readFileSync(variationsPath, 'utf-8'));
        } catch (err) {
            /* Explain errors. */
            explainError(err);
        }
    } else {
        return {};
    }
};

/**
 * Create some variable for manage path for render.
 * @private
 * @function prepareRenderLanguage
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 * @param {string} path            Url path for this render.
 */
exports.prepareRenderLanguage = function (locals, routeParameters, request, response, viewsPath, currentPath, path) {
    var NA = this;

    /**
     * Expose the current language code for the page if setted else expose the global if setted.
     * @public
     * @alias languageCode
     * @type {string}
     * @memberOf NA#locals
     * @default undefined
     */
    locals.languageCode =

        /**
         * Represent the language code for this page.
         * @public
         * @alias languageCode
         * @type {string}
         * @memberOf NA#routeParameters
         * @default undefined
         */
        routeParameters.languageCode ||

        /**
         * Represent the global and main language code for website.
         * @public
         * @alias languageCode
         * @type {string}
         * @memberOf NA#webconfig
         * @default undefined.
         */
        NA.webconfig.languageCode;

    /* Next preparation render for variation. */
    NA.prepareRenderPath(locals, routeParameters, request, response, viewsPath, currentPath, path);
};

/**
 * Create some variable for manage path for render.
 * @private
 * @function prepareRenderPath
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 * @param {string} path            Url path for this render.
 */
exports.prepareRenderPath = function (locals, routeParameters, request, response, viewsPath, currentPath, path) {
    var NA = this,
        query = (request  && request.originalUrl && request.originalUrl.split("?"));

    /**
     * Idem as `NA#webconfig.urlRoot`.
     * @public
     * @alias urlRootPath
     * @type {string}
     * @memberOf NA#locals
     * @example http://localhost:7777
     * https://www.example.here
     */
    locals.urlRootPath = NA.webconfig.urlRoot;

    /**
     * Idem as `NA#webconfig.urlRelativeSubPath`.
     * @public
     * @alias urlSubPath
     * @type {string}
     * @memberOf NA#locals
     * @example /subpath
     * 
     */
    locals.urlSubPath = NA.webconfig.urlRelativeSubPath;

    /**
     * Expose the current URL of page with `NA#webconfig.urlRoot` and `NA#webconfig.urlRelativeSubPath`.
     * @public
     * @alias urlBasePath
     * @type {string}
     * @memberOf NA#locals
     * @example http://localhost:7777/subpath
     * https://www.example.here
     */
    locals.urlBasePath = NA.webconfig.urlRoot + NA.webconfig.urlRelativeSubPath;

    /**
     * Url from `url` value for current route.
     * @public
     * @alias urlFilePath
     * @type {string}
     * @memberOf NA#locals
     * @example /example.html
     * /example/this/
     */
    locals.urlFilePath = currentPath;

    /**
     * Query from `url` value for current route.
     * @public
     * @alias urlQueryPath
     * @type {string}
     * @memberOf NA#locals
     * @example ?title=Haeresis&description=ok
     * ?title=Haeresis
     */
    locals.urlQueryPath = query && query[1] ? "?" + query[1] : "";

    /**
     * Expose the current URL of page with `NA#webconfig.urlBasePath` and the current page route.
     * @public
     * @alias urlPath
     * @type {string}
     * @memberOf NA#locals
     * @example http://localhost:7777/subpath/example.html?title=Haeresis&description=ok
     * https://www.example.here/example/this/?title=Haeresis
     */
    locals.urlPath = locals.urlBasePath + currentPath + locals.urlQueryPath;
    if (request) {
        locals.urlPath = "http" + ((NA.webconfig.httpSecure) ? "s" : "") + '://' + request.get("host") + request.originalUrl;
    }

    /* Next preparation render for variation. */
    NA.prepareRenderVariation(locals, routeParameters, request, response, viewsPath, currentPath, path);
};

/**
 * Create some variable for manage variation into render.
 * @private
 * @function prepareRenderVariation
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 * @param {string} path            Url path for this render.
 */
exports.prepareRenderVariation = function (locals, routeParameters, request, response, viewsPath, currentPath, path) {
    var NA = this,
        extend = NA.modules.extend;

    if (request) {

        /**
         * Expose list of slug parameters used into URL.
         * @public
         * @alias params
         * @type {string}
         * @memberOf NA#locals
         * @example If current route is '/example/:selector/'
         * At http://localhost/example/test/ the value of `NA.locals#params` is
         * { "selector": "test" }
         */
        locals.params = request.params || {};

        /**
         * Expose list of query parameters used into URL.
         * @public
         * @alias query
         * @type {string}
         * @memberOf NA#locals
         * @example At http://localhost/example/?param=test the value of `NA.locals#query` is
         * { "param": "test" }
         */
        locals.query = request.query || {};

        /**
         * Expose list of body parameters used into page.
         * @public
         * @alias body
         * @type {string}
         * @memberOf NA#locals
         * @example If the Response body is `test=This+is+a+test` the value of `NA.locals#body` is
         * { "test": "This is a test" }
         */
        locals.body = request.body || {};
    }

    /**
     * Name of file for `common` variation.
     * @public
     * @alias commonVariation
     * @type {string}
     * @memberOf NA#webconfig
     */
    locals.common = NA.openVariation(NA.webconfig.commonVariation, locals.languageCode);
    if (locals.languageCode) {

        /**
         * Expose all JSON data from `commonVariation` file.
         * @public
         * @alias common
         * @type {Object}
         * @memberOf NA#locals
         */
        locals.common = extend(true, NA.openVariation(NA.webconfig.commonVariation, undefined, true), locals.common);
    }

    /**
     * Name of file for `specific` variation.
     * @public
     * @alias variation
     * @type {string}
     * @memberOf NA#routeParameters
     */
    locals.specific = NA.openVariation(routeParameters.variation, locals.languageCode);
    if (locals.languageCode) {

        /**
         * Expose all JSON data from `routes[<currentRoute>].variation` file.
         * @public
         * @alias specific
         * @type {Object}
         * @memberOf NA#locals
         */
        locals.specific = extend(true, NA.openVariation(routeParameters.variation, undefined, true), locals.specific);
    }

    /* Nexts Step for render. */
    NA.prepareRenderParameters(locals, routeParameters, request, response, viewsPath, currentPath, path);
};

/**
 * Create some variable for manage parameters into render.
 * @private
 * @function prepareRenderParameters
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 * @param {string} path            Url path for this render.
 */
exports.prepareRenderParameters = function (locals, routeParameters, request, response, viewsPath, currentPath, path) {
    var NA = this;

    /**
     * Expose all data from `routes[<currentRoute>]` object from webconfig.
     * @public
     * @alias routeParameters
     * @type {Object}
     * @memberOf NA#locals
     */
    locals.routeParameters = routeParameters;

    /**
     * Expose the key from `<currentRoute>` object from webconfig.
     * @public
     * @alias routeKey
     * @type {Object}
     * @memberOf NA#locals
     */
    if (locals.routeParameters.url && typeof path === "string") {
        locals.routeKey = path;
    }
    if (locals.routeParameters.key) {
        locals.routeKey = locals.routeParameters.key;
    }

    /**
     * Expose route of current page from current webconfig `routes`.
     * @public
     * @alias route
     * @type {string}
     * @memberOf NA#locals
     * @example /categories/:category/
     */
    locals.route = currentPath;

    /**
     * Expose all webconfig values.
     * @public
     * @alias webconfig
     * @type {Object}
     * @memberOf NA#locals
     */
    locals.webconfig = NA.webconfig;

    /* Nexts Step for render. */
    NA.changeVariationsCommon(locals, routeParameters, request, response, viewsPath, currentPath, path);
};

/**
 * Intercept Variation from common file.
 * @private
 * @function changeVariationsCommon
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.changeVariationsCommon = function (locals, routeParameters, request, response, viewsPath, currentPath) {
    var NA = this;

    /* Use the `NA.controllers[<commonController>].changeVariations(...)` function if set... */
    if (typeof NA.controllers[NA.webconfig.commonController] !== 'undefined' &&
        typeof NA.controllers[NA.webconfig.commonController].changeVariations !== 'undefined') {

            /**
             * Define this function for intercept Variation object and modify it. Both `common` and `specific` controller.
             * @function changeVariations
             * @memberOf NA#controllers[]
             * @param {changeVariations~callback} callback   Next steps after configuration is done.
             * @param {Object}                    locals     Local variables object of current page.
             * @param {Object}                    response   Initial response.
             * @param {Object}                    request    Initial request.
             */
            NA.controllers[NA.webconfig.commonController].changeVariations.call(NA,

            /**
             * Next steps after changeVariations is done.
             * @callback changeVariations~callback
             */
            function () {
                NA.changeVariationsSpecific(locals, routeParameters, request, response, viewsPath, currentPath);
            }, locals, request, response);
    /* ...else, just continue. */
    } else {
        NA.changeVariationsSpecific(locals, routeParameters, request, response, viewsPath, currentPath);
    }
};

/**
 * Intercept Variation from specific file.
 * @private
 * @function changeVariationsSpecific
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.changeVariationsSpecific = function (locals, routeParameters, request, response, viewsPath, currentPath) {
    var NA = this;

    if (typeof NA.controllers[routeParameters.controller] !== 'undefined' &&
        typeof NA.controllers[routeParameters.controller].changeVariations !== 'undefined') {
            /* Use the `NA.controllers[<controller>].changeVariations(...)` function if set... */
            NA.controllers[routeParameters.controller].changeVariations.call(NA, function () {
                NA.changeDomCommon(locals, routeParameters, request, response, viewsPath, currentPath);
            }, locals, request, response);
    } else {
        /* ...else, just continue. */
        NA.changeDomCommon(locals, routeParameters, request, response, viewsPath, currentPath);
    }
};

/**
 * Intercept DOM from common file.
 * @private
 * @function changeDomCommon
 * @memberOf NA#
 * @param {Object} locals      Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} viewsPath       Path to the based view.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.changeDomCommon = function (locals, routeParameters, request, response, viewsPath, currentPath) {
    var NA = this,
        ejs = NA.modules.ejs,
        pug = NA.modules.pug,
        pathM = NA.modules.path;

    /* Open the template file */
    NA.openTemplate(routeParameters, viewsPath, function (data) {
        var engine = NA.webconfig.enablePug ? pug : ejs;

        if (typeof routeParameters.enablePug === "boolean") {
            /**
             * Allow you to enable Pug only for a page.
             * @public
             * @alias enablePug
             * @type {boolean}
             * @memberOf NA#routeParameters
             * @default undefined
             */
            engine = routeParameters.enablePug ? pug : ejs;
        }

        /**
         * Allow template engine know which file is currently in use.
         * @public
         * @alias filename
         * @type {string}
         * @memberOf NA#locals
         */
        locals.filename = pathM.join(NA.serverPath, NA.webconfig.viewsRelativePath, NA.webconfig.commonView || routeParameters.view);

        try {
            /* Transform ejs/pug data and inject incduded file. */
            data = engine.render(data, locals);
        } catch (err) {
            /* Make error more readable. */
            data = err.toString()
                .replace(/[\n]/g, "<br>")
                .replace(/    /g, "<span style='display:inline-block;width:32px'></span>")
                .replace(/ >> /g, "<span style='display:inline-block;width:32px'>&gt;&gt;</span>");
        }

        /**
         * The compiled HTML of view + locals provided by response.
         * @public
         * @alias dom
         * @type {string}
         * @memberOf NA#locals
         */
        locals.dom = data;

        /* Use the `NA.controllers[<commonController>].changeDom(...)` function if set... */
        if (typeof NA.controllers[NA.webconfig.commonController] !== 'undefined' &&
            typeof NA.controllers[NA.webconfig.commonController].changeDom !== 'undefined') {

                /**
                 * Generate a virtual DOM to use jQuery on it.
                 * @function virtualDom
                 * @memberOf NA#locals
                 * @returns {Object} The $ object to manipulate the virtual DOM.
                 */
                locals.virtualDom = function () {
                    return NA.modules.cheerio.load(data, { decodeEntities: false });
                };

                /**
                 * Define this function for intercept DOM and modify it with jQuery for example. Both `common` and `specific` controller.
                 * @function changeDom
                 * @memberOf NA#controllers[]
                 * @param {changeDom~callback} callback   Next steps after configuration is done.
                 * @param {Object}             locals     Local variables for the current page.
                 * @param {string}             locals.dom DOM of current page.
                 * @param {Object}             response   Initial response.
                 * @param {Object}             request    Initial request.
                 */
                NA.controllers[NA.webconfig.commonController].changeDom.call(NA,

                /**
                 * Next steps after changeDomSpecific is done.
                 * @callback changeDomSpecific~callback
                 * @param {Object} dom DOM with modifications.
                 */
                function ($) {
                    if (typeof $ === "function") {
                        locals.dom = $.html();
                    }
                    NA.changeDomSpecific(locals, routeParameters, request, response, currentPath);
                }, locals, request, response);
        /* ...else, just continue. */
        } else {
            NA.changeDomSpecific(locals, routeParameters, request, response, currentPath);
        }
   });
};

/**
 * Intercept DOM from specific file.
 * @private
 * @function changeDomSpecific
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.changeDomSpecific = function (locals, routeParameters, request, response, currentPath) {
    var NA = this;

    if (typeof NA.controllers[routeParameters.controller] !== 'undefined' &&
        typeof NA.controllers[routeParameters.controller].changeDom !== 'undefined') {

            locals.virtualDom = function () {
                return NA.modules.cheerio.load(locals.dom, { decodeEntities: false });
            };

            /** Use the `NA.controllers[<controller>].changeVariations(...)` function if set... */
            NA.controllers[routeParameters.controller].changeDom.call(NA, function ($) {
                if (typeof $ === "function") {
                    locals.dom = $.html();
                }
                NA.intoBrowserAndFiles(locals, routeParameters, request, response, currentPath);
            }, locals, request, response);
    } else {
        /** ...else, just continue. */
        NA.intoBrowserAndFiles(locals, routeParameters, request, response, currentPath);
    }
};

/**
 * Inject CSS into DOM if needed.
 * @private
 * @function intoBrowserAndFiles
 * @memberOf NA#
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.intoBrowserAndFiles = function (locals, routeParameters, request, response, currentPath) {
    var NA = this;

    /* Inject CSS into DOM... */
    if (NA.webconfig.injectCss || routeParameters.injectCss) {
        NA.injectCss(locals.dom, routeParameters.injectCss, function (dom) {
            NA.renderTemplate(dom, locals, routeParameters, request, response, currentPath);
        });
    /* ...or do nothing. */
    } else {
        NA.renderTemplate(locals.dom, locals, routeParameters, request, response, currentPath);
    }
};

/**
 * Write file or/and send response.
 * @private
 * @function renderTemplate
 * @memberOf NA#
 * @param {string} data            HTML DOM ready for sending.
 * @param {Object} locals          Local variables for the current page.
 * @param {Object} routeParameters All parameters from current route.
 * @param {Object} request         Information from request.
 * @param {Object} response        Information from response.
 * @param {string} currentPath     Url from `url` value for this render.
 */
exports.renderTemplate = function (data, locals, routeParameters, request, response, currentPath) {
    var NA = this,
        async = NA.modules.async,

        /**
         * Allow NodeAtlas to generate real file into `NA#webconfig.serverlessRelativePath` directory if set to true.
         * @public
         * @alias htmlGenerationBeforeResponse
         * @type {boolean}
         * @memberOf NA#webconfig
         * @default false
         */
        htmlGenerationBeforeResponse = NA.webconfig.htmlGenerationBeforeResponse,
        htmlGenerationEnable = (typeof NA.webconfig.htmlGenerationEnable === 'boolean') ? NA.webconfig.htmlGenerationEnable : true,
        templateRenderName;

    /* Create the file for asset mode */
    if (typeof response === 'undefined' || (htmlGenerationBeforeResponse && htmlGenerationEnable)) {

        /**
         * Output name of file generate if `NA#webconfig.htmlGenerationBeforeResponse` is set to true or if `--generate` command is used.
         * If value is set to `false`, no generate page will be generated.
         * @public
         * @alias output
         * @type {string|boolean}
         * @memberOf NA#routeParameters
         */
        templateRenderName = currentPath;

        if (typeof routeParameters.output !== 'undefined') {
            templateRenderName = routeParameters.output;
        }

        NA.saveTemplateRender(data, templateRenderName);
    }

    /* Run page into browser. */
    if (typeof response !== 'undefined') {
        /* Compression of CSS, JS and Images if required. */
        async.parallel([
            NA.cssCompilation.bind(NA),
            NA.jsObfuscation.bind(NA),
            NA.imgOptimization.bind(NA)
        ], function () {
            NA.response(request, response, data, routeParameters, locals);
        });
    }
};

/**
 * Generate the HTML output for send to client.
 * @private
 * @function render
 * @memberOf NA#
 * @param {string} path     The url listening.
 * @param {Object} options  Option associate to this url.
 * @param {Object} request  Initial request.
 * @param {Object} response Initial response.
 */
exports.render = function (path, options, request, response) {
    var NA = this,
        pathM = NA.modules.path,

        /**
         * All parameters from a specific page.
         * @namespace routeParameters
         * @public
         * @alias routeParameters
         * @type {Object}
         * @memberOf NA#
         */
        routeParameters,
        viewsPath,

        /**
         * All locals provided for Views Template Engine and Hooks.
         * @namespace locals
         * @public
         * @alias locals
         * @type {Object}
         * @memberOf NA#
         */
        locals = {},
        currentPath = path;

    /* Case of `path` is an object because `NA.webconfig.routes` is an array and not an object. */
    if (typeof path === "object") {
        routeParameters = path;
    } else {
        routeParameters = options[path];
    }

    /* Inject template shortcut to template. */
    if (typeof routeParameters === 'string') {
        /* viewsPath is just use like temp var in this if statement. */
        viewsPath = routeParameters;
        routeParameters = {};

        /**
         * This is the file name of view used for render of page behind the route.
         * @public
         * @alias view
         * @type {string}
         * @memberOf NA#routeParameters
         */
        routeParameters.view = viewsPath;
    }

    /**
     * Name of file for `common` view.
     * @public
     * @alias commonView
     * @type {string}
     * @memberOf NA#webconfig
     */
    viewsPath = NA.webconfig.commonView || viewsPath;

    /* Generate the server path to the view file. */
    viewsPath = pathM.join(
        NA.serverPath,
        NA.webconfig.viewsRelativePath,
        (NA.webconfig.commonView) ? NA.webconfig.commonView : (routeParameters.view || "")
    );

    /* Case of `routeParameters.url` replace `path` because `path` is used like a key. */
    if (routeParameters.url) {
        currentPath = routeParameters.url;
    }

    /* Loading the controller file if `routeParameters.controller` exist. */
    NA.loadController(

        /**
         * This is the file name of specific controller used for back-end part of this page.
         * @public
         * @alias controller
         * @type {string}
         * @memberOf NA#routeParameters
         */
        routeParameters.controller,
        function () {
            /* Next preparation path render. */
            NA.prepareRenderLanguage(locals, routeParameters, request, response, viewsPath, currentPath, path);
        }
    );
};