/*------------------------------------*\
    $%CONFIGURATION
\*------------------------------------*/
/* jslint node: true */

/**
 * Set line command options usable when NodeAtlas is executed as CLI.
 * @private
 * @function lineCommandConfiguration
 * @memberOf NA#
 */
exports.lineCommandConfiguration = function () {
    var NA = this,
        commander = NA.modules.commander;

    commander

        /* Version of NodeAtlas currently in use with `--version` option. */
        .version("2.0.0")

        /* Automaticly run default browser with `--browse` options. If a param is setted, the param is added to the and of url. */
        .option(NA.cliLabels.commander.browse.command, NA.cliLabels.commander.browse.description, String)

        /* Target the directory in which website and NodeAtlas will be running. */
        .option(NA.cliLabels.commander.directory.command, NA.cliLabels.commander.directory.description, String)

        /* Change name of JSON file used as the webconfig file. */
        .option(NA.cliLabels.commander.webconfig.command, NA.cliLabels.commander.webconfig.description, String)

        /* Change the hostname that runs the NodeAtlas website. */
        .option(NA.cliLabels.commander.httpHostname.command, NA.cliLabels.commander.httpHostname.description, String)

        /* Change the port that runs the NodeAtlas website. */
        .option(NA.cliLabels.commander.httpPort.command, NA.cliLabels.commander.httpPort.description, String)

        /* Minify all files and re-create all HTML assets into generates folder. */
        .option(NA.cliLabels.commander.generate.command, NA.cliLabels.commander.generate.description)

        /* Avoid cache at all levels (Server, Template Engine...). */
        .option(NA.cliLabels.commander.cache.command, NA.cliLabels.commander.cache.description)

        /* Copy all data from `test/<project-name>` from NodeAtlas package to current directory. */
        .option(NA.cliLabels.commander.create.command, NA.cliLabels.commander.create.description)

        /* Start the server with HTTPs Protocol. */
        .option(NA.cliLabels.commander.httpSecure.command, NA.cliLabels.commander.httpSecure.description)

        /* Change language used by NodeAtlas. */
        .option(NA.cliLabels.commander.lang.command, NA.cliLabels.commander.lang.description)
        .parse(process.argv);

    /* `generate` manually setted value with `--generate`. */
    if (commander.generate) {
        NA.configuration.generate = commander.generate;
    }

    /* `cache` manually setted value with `--cache`. */
    if (commander.cache) {
        NA.configuration.cache = commander.cache;
    }

    /* `lang` manually setted value with `--lang`. */
    if (commander.lang) {
        NA.configuration.lang = commander.lang;
    }

    /* `init` manually setted value with `--create`. */
    if (commander.create) {
        NA.configuration.create = commander.create;
    }

    /* `httpSecure` manually setted value with `--httpSecure`. */
    if (commander.httpSecure) {
        NA.configuration.httpSecure = commander.httpSecure;
    }

    /* `browse` manually setted value with `--browse`. */
    if (commander.browse) {
        NA.configuration.browse = commander.browse;
    }
};

/**
 * Set main variables for application and language error messages.
 * @private
 * @function initGlobalVar
 * @memberOf NA#
 */
exports.initGlobalVar = function () {
    var NA = this,
        path = NA.modules.path;

    /**
     * Name of file which contains language error messages. The name of file is without extension.
     * @public
     * @alias cliLanguage
     * @type {String}
     * @memberOf NA#
     * @default "default"
     */
    NA.cliLanguage = 'default';

    /**
     * OS absolute path which contains NodeAtlas folders and files.
     * @public
     * @alias nodeatlasPath
     * @type {string}
     * @memberOf NA#
     * @default « The path where `node-atlas` module is. »
     */
    NA.nodeatlasPath = path.join(__dirname, "..");

    /**
     * All internationalize labels from `NA#cliLanguage` file.
     * @public
     * @alias cliLabels
     * @type {Object}
     * @memberOf NA#
     */
    NA.cliLabels = require('../languages/' + NA.cliLanguage + '.json');

    /**
     * Contain all functions of controllers both common and specific.
     * @namespace controllers[]
     * @private
     * @alias controllers
     * @type {Array.<Object>}
     * @memberOf NA#
     * @example // Functions for common controller if `commonController` value is "common.json".
     * NA.controllers["common.json"].setModules(...);
     * NA.controllers["common.json"].setSessions(...);
     * NA.controllers["common.json"].setSockets(...);
     * NA.controllers["common.json"].setConfigurations(...);
     * NA.controllers["common.json"].setRoutes(...);
     * NA.controllers["common.json"].changeVariations(...);
     * NA.controllers["common.json"].changeDom(...);
     *
     * // Functions for specific controller if a route `controller` value is "index.json".
     * NA.controllers["index.json"].setSockets(...);
     * NA.controllers["index.json"].changeVariations(...);
     * NA.controllers["index.json"].changeDom(...);
     */
    NA.controllers = [];
};

/**
 * Set main variables for webconfig.
 * @private
 * @function initGlobalVarRequiredNpmModules
 * @memberOf NA#
 */
exports.initGlobalVarRequiredNpmModules = function () {
    var NA = this,
        commander = NA.modules.commander,
        path = NA.modules.path,
        regex = new RegExp(path.sep + path.sep + '?$', 'g');

    /* `serverPath` manually setted value with `NA#config`. */
    if (commander.directory) {
        NA.configuration.directory = commander.directory;
    }

    if (typeof NA.configuration.directory !== 'string') {

        /**
         * OS absolute path that contains webconfig and website.
         * @public
         * @alias serverPath
         * @type {String}
         * @memberOf NA#
         * @default « `--directory` value » || « Path from NodeAtlas is called ».
         */
        NA.serverPath = process.cwd() + path.sep;
    } else {

        /* `NA#serverPath` manually setted value with `--directory`. */
        NA.serverPath = NA.configuration.directory.replace(regex, '') + path.sep;
    }

    /**
     * Name of the webconfig used for run the website.
     * @public
     * @alias webconfigName
     * @type {string}
     * @memberOf NA#
     * @default "webconfig.json".
     */
    NA.webconfigName = 'webconfig.json';

    /* `webconfigName` manually setted value with `--webconfig`. */
    if (commander.webconfig) {
        NA.configuration.webconfig = commander.webconfig;
    }

    /* `webconfigName` manually setted value with `NA#config`. */
    if (NA.configuration.webconfig) {
        NA.webconfigName = NA.configuration.webconfig;
    }
};

/**
 * Decide to run a « Simple Web Server » or a « With Weconfig Server » depending to webconfig opening success.
 * If webconfig is correctly openned, the `NA#improveWebconfigBase` and `callback` function will be run, else, just `NA#simpleWebServer` will be run.
 * @private
 * @function initWebconfig
 * @memberOf NA#
 * @param {initWebconfig~callback} callback Calling next processus if webconfig opening is a success.
 */
exports.initWebconfig = function (callback) {
    var NA = this;

    /* Webconfig based website... */
    NA.ifFileExist(NA.serverPath, NA.webconfigName, function (err) {
        if (err && err.code === 'ENOENT') {

            /* ... or static website. */
            return NA.simpleWebServer();
        }

        NA.improveWebconfigBase();

        /**
         * Next step !
         * @callback initWebconfig~callback
         */
        callback();
    });
};

/**
 * Set default webconfig's value from possibly external files for compress files.
 * @private
 * @function setCompressionDirectiveAsWebconfigBase
 * @memberOf NA#
 */
exports.setCompressionDirectiveAsWebconfigBase = function () {
    var NA = this;

    if (typeof NA.webconfig.bundles === 'string') {

        /**
         * Contain bundle configuration for CSS and JS minification in JSON format.
         * @public
         * @alias bundles
         * @type {Object}
         * @memberOf NA#webconfig
         * @property {Object} bundles             The Bundles object.
         * @property {Object} bundles.javascript  Each object name represent an output javascript file and each property of object represent an array of inputs files.
         * @property {Object} bundles.stylesheets Each object name represent an output stylesheets file and each property of object represent an array of inputs files.
         * @example {
         *     "javascript": {
         *         "javascript/framework.min.js": [
         *             "javascript/modernizr.js",
         *             "javascript/jquery.js",
         *             "javascript/prettify.js",
         *             "javascript/prettify/run_prettify.js"
         *         ],
         *         "javascript/common.min.js": [
         *             "javascript/components/extended-format-date.js",
         *             "javascript/common.js"
         *         ]
         *     },
         *     "stylesheets": {
         *         "stylesheets/common.min.css": [
         *             "stylesheets/common.css",
         *             "stylesheets/common-min780.css",
         *             "stylesheets/common-min1160.css"
         *         ]
         *     }
         * }
         */
        NA.webconfig.bundles = NA.openConfiguration(NA.webconfig.bundles);
    }

    if (typeof NA.webconfig.optimizations === 'string') {

        /**
         * Contain optimizations configuration for Images optimizations.
         * @public
         * @alias optimizations
         * @type {Object}
         * @memberOf NA#webconfig
         * @property {Object} optimizations        The Optimizations object.
         * @property {Object} optimizations.images Each object name represent an input image file and object value represent an output folder.
         * @example {
         *     "jpg": { "progressive": true },
         *     "gif": { "interlaced": true },
         *     "png": { "optimizationLevel": 3 },
         *     "svg": { "multipass": true },
         *     "images": {
         *     "media/images/*.{gif,jpg,png,svg}": "media/images/optimized/"
         *     }
         * }
         */
        NA.webconfig.optimizations = NA.openConfiguration(NA.webconfig.optimizations);
    }
};

/**
 * Set default webconfig's value from possibly external files for preprocessor files.
 * @private
 * @function setPreprocessorDirectiveAsWebconfigBase
 * @memberOf NA#
 */
exports.setPreprocessorDirectiveAsWebconfigBase = function () {
    var NA = this;

    /**
     * Enable Pug preprocessor.
     * @public
     * @alias enablePug
     * @type {boolean}
     * @memberOf NA#webconfig
     * @default false
     */
    NA.webconfig.enablePug = NA.webconfig.enablePug || false;

    if (NA.webconfig.enableLess === true) {

        /**
         * Enable Less preprocessor.
         * @namespace enableLess
         * @public
         * @alias enableLess
         * @type {boolean|Object}
         * @memberOf NA#webconfig
         * @default false
         * @property {boolean} compress  - Minify the Less file.
         * @property {boolean} sourceMap - Create a sourceMap file for development.
         */
        NA.webconfig.enableLess = {
            compress: false,
            sourceMap: true
        };
    } else if (typeof NA.webconfig.enableLess === 'object' && typeof NA.webconfig.enableLess.less === 'string') {

        /**
         * Contain Less files required for compilation in JSON format.
         * @public
         * @alias less
         * @type {Object}
         * @memberOf NA#webconfig.enableLess
         * @property {Array.<String>} less The file for compilation in an Array.
         * @example {
         *     "less": [
         *         "stylesheets/common.less",
         *         "stylesheets/component-1.less",
         *         "stylesheets/component-2.less",
         *         "stylesheets/component-3.less"
         *     ]
         * }
         */
        NA.webconfig.enableLess.less = NA.openConfiguration(NA.webconfig.enableLess.less);
    }

    if (NA.webconfig.enableStylus === true) {

        /**
         * Enable Stylus preprocessor.
         * @namespace enableStylus
         * @public
         * @alias enableStylus
         * @type {boolean|Object}
         * @memberOf NA#webconfig
         * @default false
         */
        NA.webconfig.enableStylus = {
            compress: false,
            sourceMap: true
        };
    } else if (typeof NA.webconfig.enableStylus === 'object' && typeof NA.webconfig.enableStylus.stylus === 'string') {

        /**
         * Contain Stylus files required for compilation in JSON format.
         * @public
         * @alias stylus
         * @type {Object}
         * @memberOf NA#webconfig.enableStylus
         * @property {Array.<String>} stylus The file for compilation in an Array.
         * @example {
         *     "stylus": [
         *         "stylesheets/common.styl",
         *         "stylesheets/component-1.styl",
         *         "stylesheets/component-2.styl",
         *         "stylesheets/component-3.styl"
         *     ]
         * }
         */
        NA.webconfig.enableStylus.stylus = NA.openConfiguration(NA.webconfig.enableStylus.stylus);
    }
};

/**
 * Set default webconfig's value from possibly external routes.
 * @private
 * @function setExternalRoutesAsWebconfigBase
 * @memberOf NA#
 */
exports.setExternalRoutesAsWebconfigBase = function () {
    var NA = this;

    /* Adding path to original url. */
    if (typeof NA.webconfig.urlRelativeSubPath !== 'undefined' && NA.webconfig.urlRelativeSubPath) {

        /**
         * Adding subfolder to original url.
         * @public
         * @alias urlRelativeSubPath
         * @type {string}
         * @memberOf NA#webconfig
         * @default undefined.
         * @example
         * // If `NA#webconfig.urlRelativeSubPath` is setted to "example"
         * // Website will run by default to « http://localhost/example/ »
         */
        NA.webconfig.urlRelativeSubPath = '/' + NA.webconfig.urlRelativeSubPath.replace(/^\//g, "").replace(/\/$/g, "");
    } else {
        NA.webconfig.urlRelativeSubPath = "";
    }

    if (typeof NA.webconfig.routes === 'string') {

        /**
         * Contain all routes on JSON format.
         * @public
         * @alias routes
         * @type {Object}
         * @memberOf NA#webconfig
         * @default The webconfig's object property `routes`.
         */
        NA.webconfig.routes = NA.openConfiguration(NA.webconfig.routes);
    }
};


/**
 * Set default webconfig's value possibly undefined from webconfig.
 * @private
 * @function setDirectoriesAsWebconfigBase
 * @memberOf NA#
 */
exports.setDirectoriesAsWebconfigBase = function () {
    var NA = this;

    if (typeof NA.webconfig.variationsRelativePath === 'undefined') {

        /**
         * Language and variable variation files folder depending of languages.
         * @public
         * @alias variationsRelativePath
         * @type {string}
         * @memberOf NA#webconfig
         * @default "variations".
         */
        NA.webconfig.variationsRelativePath = 'variations';
    }

    if (typeof NA.webconfig.controllersRelativePath === 'undefined') {

        /**
         * Controller folder for Back-end part.
         * @public
         * @alias controllersRelativePath
         * @type {string}
         * @memberOf NA#webconfig
         * @default "controllers".
         */
        NA.webconfig.controllersRelativePath = 'controllers';
    }

    /* Path to view. */
    if (typeof NA.webconfig.viewsRelativePath === 'undefined') {

        /**
         * View folder for Template Engine files.
         * @public
         * @alias viewsRelativePath
         * @type {string}
         * @memberOf NA#webconfig
         * @default "views".
         */
        NA.webconfig.viewsRelativePath = 'views';
    }

    if (typeof NA.webconfig.assetsRelativePath === 'undefined') {

        /**
         * Folder for public file like images, CSS, JS...
         * @public
         * @alias assetsRelativePath
         * @type {string}
         * @memberOf NA#webconfig
         * @default "assets".
         */
        NA.webconfig.assetsRelativePath = 'assets';
    }

    if (typeof NA.webconfig.serverlessRelativePath === 'undefined') {

        /**
         * HTML assets generation Folder.
         * @public
         * @alias serverlessRelativePath
         * @type {string}
         * @memberOf NA#webconfig
         * @default "serverless".
         */
        NA.webconfig.serverlessRelativePath = 'serverless';
    }
};

/**
 * Set default Http Port value possibly undefined from webconfig.
 * @private
 * @function setHttpValuesAsWebconfigBase
 * @memberOf NA#
 */
exports.setHttpValuesAsWebconfigBase = function () {
    var NA = this,
        commander = NA.modules.commander;

    /**
     * Avoil all caching at all level (server, template engine...). Do not use in production.
     * @public
     * @alias cache
     * @type {boolean}
     * @memberOf NA#webconfig
     * @default false
     */
    NA.webconfig.cache = commander.cache || NA.webconfig.cache || false;

    /**
     * Define is site is running with HTTP(S) protocol.
     * @public
     * @alias httpSecure
     * @type {boolean}
     * @memberOf NA#webconfig
     */
    NA.webconfig.httpSecure = commander.httpSecure || NA.webconfig.httpSecure;

    /**
     * Server listening port.
     * @public
     * @alias httpPort
     * @type {string}
     * @memberOf NA#webconfig
     * @default « The webconfig's property `httpPort` » || « The `process.env.PORT` if setted » || 80
     */
    NA.webconfig.httpPort = NA.webconfig.httpPort || process.env.PORT || ((NA.webconfig.httpSecure) ? 443 : 80);

    /* `httpPort` manually setted value with `--httpPort`. */
    if (commander.httpPort) {
        NA.configuration.httpPort = commander.httpPort;
    }

    /* `httpPort` manually setted value with `NA.config`. */
    if (NA.configuration.httpPort) {
        NA.webconfig.httpPort = NA.configuration.httpPort;
    }

    /* `cache` manually setted value with `NA.config`. */
    if (NA.configuration.cache) {
        NA.webconfig.cache = NA.configuration.cache;
    }

    /**
     * Url access port (for reverse proxy).
     * @public
     * @alias urlPort
     * @type {string}
     * @memberOf NA#webconfig
     * @default undefined
     */
    NA.webconfig.urlPort = NA.webconfig.urlPort || NA.webconfig.httpPort;

    /**
     * Server listening hostname by http.
     * @public
     * @alias httpHostname
     * @type {string}
     * @memberOf NA#webconfig
     * @default « The webconfig's property `httpHostname` » || « The `process.env.IP_ADDRESS` if setted » || "localhost";
     */
    NA.webconfig.httpHostname = NA.webconfig.httpHostname || process.env.IP_ADDRESS || 'localhost';

    /* `httpHostname` manually setted value with `--httpHostname`. */
    if (commander.httpHostname) {
        NA.configuration.httpHostname = commander.httpHostname;
    }

    /* `httpHostname` manually setted value with `NA.config`. */
    if (NA.configuration.httpHostname) {
        NA.webconfig.httpHostname = NA.configuration.httpHostname;
    }

    /**
     * Url access hostname by http (for reverse proxy).
     * @public
     * @alias urlHostname
     * @type {string}
     * @memberOf NA#webconfig
     * @default undefined.
     */
    NA.webconfig.urlHostname = NA.webconfig.urlHostname || NA.webconfig.httpHostname;
};

/**
 * Set all default webconfig's value into `NA#webconfig`.
 * @private
 * @function improveWebconfigBase
 * @memberOf NA#
 */
exports.improveWebconfigBase = function () {
    var NA = this,
        ejs = NA.modules.ejs;

    /**
     * Content of Webconfig file enhenced by `NA#configuration` and CLI commands.
     * @namespace webconfig
     * @public
     * @alias webconfig
     * @type {Object}
     * @memberOf NA#
     */
    NA.webconfig = NA.openConfiguration(NA.webconfigName);

    /* Set external routes as a part of default webconfig. */
    NA.setExternalRoutesAsWebconfigBase();

    /* Set external files for compression as a part of default webconfig. */
    NA.setCompressionDirectiveAsWebconfigBase();

    /* Set external files for preprocessing as a part of default webconfig. */
    NA.setPreprocessorDirectiveAsWebconfigBase();

    /* Set value possibly undefined from default webconfig. */
    NA.setDirectoriesAsWebconfigBase();

    /* Set the httpPort, httpHost, urlPort and urlHost for default webconfig. */
    NA.setHttpValuesAsWebconfigBase();

    /**
     * Set open and close bracket used by Teplate Engine.
     * @public
     * @alias templateEngineDelimiter
     * @type {string}
     * @memberOf NA#webconfig
     * @default '?'.
     */
    ejs.delimiter = NA.webconfig.templateEngineDelimiter || "?";

    /**
     * Deliver the client-side window.NA.socket and window.NA.io object.
     * @public
     * @alias urlSocketsFile
     * @type {string}
     * @memberOf NA#webconfig
     * @default "/node-atlas/socket.io.js"
     */
    NA.webconfig.urlSocketsFile = (NA.webconfig.urlSocketsFile === false) ? false : (NA.webconfig.urlSocketsFile || "/node-atlas/socket.io.js");

    /**
     * Default Content Type used for all pages.
     * @public
     * @alias mimeType
     * @type {string}
     * @memberOf NA#webconfig
     * @default "text/html"
     */
    NA.webconfig.mimeType = NA.webconfig.mimeType || "text/html";

    /**
     * Default Charset used for all pages.
     * @public
     * @alias charset
     * @type {string}
     * @memberOf NA#webconfig
     * @default "utf-8"
     */
    NA.webconfig.charset = NA.webconfig.charset || "utf-8";

    /**
     * Default Headers used for all pages.
     * @public
     * @alias headers
     * @type {Object}
     * @memberOf NA#webconfig
     * @default {}
     */
    NA.webconfig.headers = NA.webconfig.headers || {};

    /**
     * Define the path to the Private Key for HTTPs.
     * @public
     * @alias httpSecureRelativeKeyPath
     * @type {string}
     * @memberOf NA#webconfig
     */
    NA.webconfig.httpSecureRelativeKeyPath = NA.webconfig.httpSecureRelativeKeyPath || (typeof NA.webconfig.httpSecure === 'string') ? NA.webconfig.httpSecure + '.key' : null;

    /**
     * Define the path to the Certificate for HTTPs.
     * @public
     * @alias httpSecureRelativeCertificatePath
     * @type {string}
     * @memberOf NA#webconfig
     */
    NA.webconfig.httpSecureRelativeCertificatePath = NA.webconfig.httpSecureRelativeCertificatePath || (typeof NA.webconfig.httpSecure === 'string') ? NA.webconfig.httpSecure + '.crt' : null;

    /**
     * Website http(s) absolute url based from `NA#webconfig.httpSecure`, `NA#webconfig.urlHostname` and `NA#webconfig.urlPort`.
     * This value does not contain `NA#webconfig.urlRelativeSubPath`.
     * @public
     * @alias urlRoot
     * @type {string}
     * @memberOf NA#webconfig
     */
    NA.webconfig.urlRoot = 'http' + ((NA.webconfig.httpSecure) ? 's' : '') + '://' + NA.webconfig.urlHostname + ((NA.webconfig.urlPort !== ((NA.webconfig.httpSecure) ? 443 : 80)) ? ':' + NA.webconfig.urlPort : '');
};