/*
 * Core Application
 *
 * The Core Application manages the life cycle of modules.
 */
/*global define,window */
/*jslint nomen:true*/
define([
    'scalejs!core'
], function (
    core
) {
    'use strict';

    var addOne = core.array.addOne,
        toArray = core.array.toArray,
        partial = core.functional.partial,
        _ = core.functional._,
        has = core.object.has,
        error = core.log.error,
        debug = core.log.debug,
        moduleRegistrations = [],
        moduleInstances = [];

    function registerModules() {
        var moduleNames,
            modules;
        // Dynamic module loading is no longer supported for simplicity.
        // Module is free to load any of its resources dynamically.
        // Or an extension can provide dynamic module loading capabilities as needed.
        if (core.isApplicationStarted()) {
            moduleNames = toArray(arguments).reduce(function (ns, m) { return ns + ',' + m; });
            throw new Error('Can\'t register module "' + moduleNames + '" since the application is already running.',
                            'Dynamic module loading is not supported.');
        }

        modules = toArray(arguments).filter(partial(has, _, 'getModuleId'));
        Array.prototype.push.apply(moduleRegistrations, modules);
    }

    function createModule(module) {
        var moduleInstance;

        try {
            moduleInstance = module.newInstance();
            addOne(moduleInstances, moduleInstance);

            return moduleInstance;
        } catch (ex) {
            error('Fatal error during application initialization.',
                  'Failed to create an instance of module "' + module.getModuleId() + '".',
                  'See following exception for more details.',
                  ex);
            throw ex;
        }
    }

    function createAll() {
        moduleRegistrations.forEach(function (registration) {
            createModule(registration);
        });
    }

    function startAll() {
        debug("Application started.");

        core.notifyApplicationStarted();
    }

    function run() {
        createAll();
        startAll();
    }

    return {
        registerModules: registerModules,
        run: run
    };
});
