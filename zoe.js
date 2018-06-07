(function () {

    /**
     * To override hooks, use the following example:
     *
     * window.zoeJsApi.prototype.hooks.onRequestLoaderEnd = window.ninShadowHelper.onRequestLoaderEnd;
     *
     */
    if ('undefined' === typeof window.zoe) {

        var zoe = null;


        /**
         * zoeIntent is a helper variable to hook with the bionic framework,
         * see the bionic framework for more details:
         * https://github.com/lingtalfi/bionic
         *
         */
        window.zoeIntent = null;
        window.zoeRequestOnSuccessAfter = null;

        var instance = null;
        //----------------------------------------
        // UTILS
        //----------------------------------------
        var devError = console.log;
        /**
         * @param target: (module:)?action
         * @param type: ecp|html
         * @param options:
         *          - ?onInvalidError
         *          - ?onPublicError
         */
        var request = function (target, data, onSuccess, options, type) {
            var zis = instance;

            // intent implementation
            var intent = window.zoeIntent; // this should be an array
            window.zoeIntent = null; // reset for the next time

            var module = "Zoe"; // You should always define your module using the target syntax
            var action = target;
            type = type || "ecp";
            options = $.extend({
                onInvalidError: null,
                onPublicError: null,
                onSuccessMessage: null
            }, options);

            var onInvalidError = options.onInvalidError || instance.hooks.onRequestInvalidError;
            var onPublicError = options.onPublicError || instance.hooks.onRequestPublicError;
            var onSuccessMessage = options.onSuccessMessage || instance.hooks.onRequestSuccessMessage;


            var p = target.split(":", 2);
            if (2 === p.length) {
                module = p[0];
                action = p[1];
            }
            zis.hooks.onRequestLoaderPrepare(action, module);
            zis.hooks.onRequestLoaderStart(action, module);

            var url = "/service/" + module + "/" + type + "/api?action=" + action;
            if (null !== intent) {
                data.intent = intent;
            }
            if ('ecp' === type) {

                $.post(url, data, function (response) {
                    if ($.isPlainObject(response)) {
                        var hasError = false;
                        if ('$$success$$' in response) {
                            onSuccessMessage && onSuccessMessage(response['$$success$$']);
                        }
                        else if ('$$invalid$$' in response) {
                            hasError = true;
                            onInvalidError && onInvalidError(response['$$invalid$$']);
                        }
                        else if ('$$error$$' in response) {
                            hasError = true;
                            onPublicError && onPublicError(response['$$error$$']);
                        }


                        if (false === hasError) {
                            onSuccess && onSuccess(response);
                            window.ekomRequestOnSuccessAfter && window.ekomRequestOnSuccessAfter(response);
                        }


                    }
                    else {
                        devError("A plain object has not been returned, check your console.log");
                        console.log(response);
                    }
                }, 'json').always(function () {

                    zis.hooks.onRequestLoaderEnd(target);
                });
            }
            else {
                console.log("not handled yet");
            }
        };


        // https://davidwalsh.name/javascript-debounce-function
        var debounce = function (func, wait, immediate) {
            var timeout;
            return function () {
                var context = this, args = arguments;
                var later = function () {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                var callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        };


        /**
         * Use this function internally,
         * when your api public method allows the user to provide
         * an error callback, which handles an exceptional error.
         * Since the exceptional error is the dev's fault,
         * it should be handled server side already (you might have a trace in the logs),
         * and so on the client side the default behaviour is just to log the error message,
         * so that the local dev can see it in the browser.
         */
        var getErrorCallback = function (error) {
            if ('undefined' !== typeof error && null !== error) {
                return error;
            }
            return function (m) {
                console.log("Exceptional Error from zoeJsApi: " + m);
            };
        };


        //----------------------------------------
        // OBSERVER
        //----------------------------------------
        var observer = function () {
            this.listeners = {};
            this.onceListeners = {};
        };
        observer.prototype = {
            notify: function (eventName) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (eventName in this.listeners) {
                    var listeners = this.listeners[eventName];
                    for (var i  in listeners) {
                        var cb = listeners[i];
                        // console.log(eventName, args, 'end');
                        cb.apply(this, args);
                    }

                    if (eventName in this.onceListeners) {
                        delete this.listeners[eventName];
                    }
                }
            },
            addListener: function (eventName, cb, options) {

                if (false === $.isArray(eventName)) {
                    eventName = [eventName];
                }

                for (var i in eventName) {
                    var event = eventName[i];
                    if (false === (event in this.listeners)) {
                        this.listeners[event] = [];
                    }
                    this.listeners[event].push(cb);


                    if ($.isPlainObject(options) && 'once' in options && true === options.once) {
                        this.onceListeners[event] = true;
                    }
                }
            },
            setListener: function (eventName, cb) {

                if (false === $.isArray(eventName)) {
                    eventName = [eventName];
                }
                for (var i in eventName) {
                    var event = eventName[i];
                    this.listeners[event] = [cb];
                }
            },
            removeListener: function (eventName) {
                if (false === $.isArray(eventName)) {
                    eventName = [eventName];
                }
                for (var i in eventName) {
                    var event = eventName[i];
                    delete this.listeners[event];
                }
            }
        };
        var obs = new observer();


        //----------------------------------------
        // ZOE JS API
        //----------------------------------------
        window.zoeJsApi = function () {
        };
        window.zoeJsApi.prototype = {
            hooks: { // external code can override this
                onRequestInvalidError: function (msg) {
                    console.log("zoe: " + msg);
                },
                onRequestPublicError: function (msg) {
                    alert(msg);
                },
                onRequestSuccessMessage: function (msg) {
                    alert(msg);
                },
                onRequestLoaderPrepare: function (action, module) {

                },
                onRequestLoaderStart: function (action, module) {

                },
                onRequestLoaderEnd: function (action, module) {

                }
            },
            utils: {
                sqlDateToFormat: function (sqlDate, format, sep) {
                    if ('undefined' === typeof sep) {
                        sep = '/';
                    }
                    if ('dmy' === format) {
                        // https://stackoverflow.com/questions/6040515/how-do-i-get-month-and-date-of-javascript-in-2-digit-format
                        var oDate = new Date(sqlDate);
                        return ("0" + oDate.getDate()).slice(-2) + sep + ("0" + (oDate.getMonth() + 1)).slice(-2) + sep + oDate.getFullYear();
                    }
                    else {
                        console.log("zoeJsApi: error: unknown format " + format);
                    }
                },
                /**
                 * A parse_str simpler equivalent (not perfect, but enough for simple values).
                 * https://stackoverflow.com/questions/2090551/parse-query-string-in-javascript
                 */
                parseQuery: function (qstr) {
                    var query = {};
                    var a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
                    for (var i = 0; i < a.length; i++) {
                        var b = a[i].split('=');
                        query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
                    }
                    return query;
                },
                debounce: function (func, wait, immediate) {
                    return debounce(func, wait, immediate);
                }
            },
            request: request,
            // observer
            on: function (eventName, cb) {
                obs.addListener(eventName, cb);
                return this;
            },
            off: function (eventName) {
                obs.removeListener(eventName);
                return this;
            },
            once: function (eventName, cb) {
                obs.addListener(eventName, cb, {
                    once: true
                });
            },
            trigger: function (eventName) { // you can pass any number of args if you want
                var args = Array.prototype.slice.call(arguments, 1);
                var zeArgs = [eventName];
                for (var i in args) {
                    zeArgs.push(args[i]);
                }
                obs.notify.apply(obs, zeArgs);
            }
        };

        //----------------------------------------
        // SPREADING OUT
        //----------------------------------------
        window.zoe = {
            inst: function () {
                if(null===zoe){
                    zoe = new zoeJsApi();
                }
                return zoe;
            }
        };
    }
})();