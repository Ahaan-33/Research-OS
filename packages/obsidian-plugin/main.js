"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/core/dist/types/index.js
var require_types = __commonJS({
  "packages/core/dist/types/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/util.js
var require_util = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/util.js"(exports2) {
    "use strict";
    exports2.getBooleanOption = (options, key) => {
      let value = false;
      if (key in options && typeof (value = options[key]) !== "boolean") {
        throw new TypeError(`Expected the "${key}" option to be a boolean`);
      }
      return value;
    };
    exports2.cppdb = Symbol();
    exports2.inspect = Symbol.for("nodejs.util.inspect.custom");
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/sqlite-error.js
var require_sqlite_error = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/sqlite-error.js"(exports2, module2) {
    "use strict";
    var descriptor = { value: "SqliteError", writable: true, enumerable: false, configurable: true };
    function SqliteError(message, code) {
      if (new.target !== SqliteError) {
        return new SqliteError(message, code);
      }
      if (typeof code !== "string") {
        throw new TypeError("Expected second argument to be a string");
      }
      Error.call(this, message);
      descriptor.value = "" + message;
      Object.defineProperty(this, "message", descriptor);
      Error.captureStackTrace(this, SqliteError);
      this.code = code;
    }
    Object.setPrototypeOf(SqliteError, Error);
    Object.setPrototypeOf(SqliteError.prototype, Error.prototype);
    Object.defineProperty(SqliteError.prototype, "name", descriptor);
    module2.exports = SqliteError;
  }
});

// node_modules/.pnpm/file-uri-to-path@1.0.0/node_modules/file-uri-to-path/index.js
var require_file_uri_to_path = __commonJS({
  "node_modules/.pnpm/file-uri-to-path@1.0.0/node_modules/file-uri-to-path/index.js"(exports2, module2) {
    var sep = require("path").sep || "/";
    module2.exports = fileUriToPath;
    function fileUriToPath(uri) {
      if ("string" != typeof uri || uri.length <= 7 || "file://" != uri.substring(0, 7)) {
        throw new TypeError("must pass in a file:// URI to convert to a file path");
      }
      var rest = decodeURI(uri.substring(7));
      var firstSlash = rest.indexOf("/");
      var host = rest.substring(0, firstSlash);
      var path2 = rest.substring(firstSlash + 1);
      if ("localhost" == host) host = "";
      if (host) {
        host = sep + sep + host;
      }
      path2 = path2.replace(/^(.+)\|/, "$1:");
      if (sep == "\\") {
        path2 = path2.replace(/\//g, "\\");
      }
      if (/^.+\:/.test(path2)) {
      } else {
        path2 = sep + path2;
      }
      return host + path2;
    }
  }
});

// node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js
var require_bindings = __commonJS({
  "node_modules/.pnpm/bindings@1.5.0/node_modules/bindings/bindings.js"(exports2, module2) {
    var fs = require("fs");
    var path2 = require("path");
    var fileURLToPath = require_file_uri_to_path();
    var join2 = path2.join;
    var dirname = path2.dirname;
    var exists = fs.accessSync && function(path3) {
      try {
        fs.accessSync(path3);
      } catch (e) {
        return false;
      }
      return true;
    } || fs.existsSync || path2.existsSync;
    var defaults = {
      arrow: process.env.NODE_BINDINGS_ARROW || " \u2192 ",
      compiled: process.env.NODE_BINDINGS_COMPILED_DIR || "compiled",
      platform: process.platform,
      arch: process.arch,
      nodePreGyp: "node-v" + process.versions.modules + "-" + process.platform + "-" + process.arch,
      version: process.versions.node,
      bindings: "bindings.node",
      try: [
        // node-gyp's linked version in the "build" dir
        ["module_root", "build", "bindings"],
        // node-waf and gyp_addon (a.k.a node-gyp)
        ["module_root", "build", "Debug", "bindings"],
        ["module_root", "build", "Release", "bindings"],
        // Debug files, for development (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Debug", "bindings"],
        ["module_root", "Debug", "bindings"],
        // Release files, but manually compiled (legacy behavior, remove for node v0.9)
        ["module_root", "out", "Release", "bindings"],
        ["module_root", "Release", "bindings"],
        // Legacy from node-waf, node <= 0.4.x
        ["module_root", "build", "default", "bindings"],
        // Production "Release" buildtype binary (meh...)
        ["module_root", "compiled", "version", "platform", "arch", "bindings"],
        // node-qbs builds
        ["module_root", "addon-build", "release", "install-root", "bindings"],
        ["module_root", "addon-build", "debug", "install-root", "bindings"],
        ["module_root", "addon-build", "default", "install-root", "bindings"],
        // node-pre-gyp path ./lib/binding/{node_abi}-{platform}-{arch}
        ["module_root", "lib", "binding", "nodePreGyp", "bindings"]
      ]
    };
    function bindings(opts) {
      if (typeof opts == "string") {
        opts = { bindings: opts };
      } else if (!opts) {
        opts = {};
      }
      Object.keys(defaults).map(function(i2) {
        if (!(i2 in opts)) opts[i2] = defaults[i2];
      });
      if (!opts.module_root) {
        opts.module_root = exports2.getRoot(exports2.getFileName());
      }
      if (path2.extname(opts.bindings) != ".node") {
        opts.bindings += ".node";
      }
      var requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
      var tries = [], i = 0, l = opts.try.length, n, b, err;
      for (; i < l; i++) {
        n = join2.apply(
          null,
          opts.try[i].map(function(p) {
            return opts[p] || p;
          })
        );
        tries.push(n);
        try {
          b = opts.path ? requireFunc.resolve(n) : requireFunc(n);
          if (!opts.path) {
            b.path = n;
          }
          return b;
        } catch (e) {
          if (e.code !== "MODULE_NOT_FOUND" && e.code !== "QUALIFIED_PATH_RESOLUTION_FAILED" && !/not find/i.test(e.message)) {
            throw e;
          }
        }
      }
      err = new Error(
        "Could not locate the bindings file. Tried:\n" + tries.map(function(a) {
          return opts.arrow + a;
        }).join("\n")
      );
      err.tries = tries;
      throw err;
    }
    module2.exports = exports2 = bindings;
    exports2.getFileName = function getFileName(calling_file) {
      var origPST = Error.prepareStackTrace, origSTL = Error.stackTraceLimit, dummy = {}, fileName;
      Error.stackTraceLimit = 10;
      Error.prepareStackTrace = function(e, st) {
        for (var i = 0, l = st.length; i < l; i++) {
          fileName = st[i].getFileName();
          if (fileName !== __filename) {
            if (calling_file) {
              if (fileName !== calling_file) {
                return;
              }
            } else {
              return;
            }
          }
        }
      };
      Error.captureStackTrace(dummy);
      dummy.stack;
      Error.prepareStackTrace = origPST;
      Error.stackTraceLimit = origSTL;
      var fileSchema = "file://";
      if (fileName.indexOf(fileSchema) === 0) {
        fileName = fileURLToPath(fileName);
      }
      return fileName;
    };
    exports2.getRoot = function getRoot(file) {
      var dir = dirname(file), prev;
      while (true) {
        if (dir === ".") {
          dir = process.cwd();
        }
        if (exists(join2(dir, "package.json")) || exists(join2(dir, "node_modules"))) {
          return dir;
        }
        if (prev === dir) {
          throw new Error(
            'Could not find module root given file: "' + file + '". Do you have a `package.json` file? '
          );
        }
        prev = dir;
        dir = join2(dir, "..");
      }
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/wrappers.js
var require_wrappers = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/wrappers.js"(exports2) {
    "use strict";
    var { cppdb } = require_util();
    exports2.prepare = function prepare(sql) {
      return this[cppdb].prepare(sql, this, false);
    };
    exports2.exec = function exec(sql) {
      this[cppdb].exec(sql);
      return this;
    };
    exports2.close = function close() {
      this[cppdb].close();
      return this;
    };
    exports2.loadExtension = function loadExtension(...args) {
      this[cppdb].loadExtension(...args);
      return this;
    };
    exports2.defaultSafeIntegers = function defaultSafeIntegers(...args) {
      this[cppdb].defaultSafeIntegers(...args);
      return this;
    };
    exports2.unsafeMode = function unsafeMode(...args) {
      this[cppdb].unsafeMode(...args);
      return this;
    };
    exports2.getters = {
      name: {
        get: function name() {
          return this[cppdb].name;
        },
        enumerable: true
      },
      open: {
        get: function open() {
          return this[cppdb].open;
        },
        enumerable: true
      },
      inTransaction: {
        get: function inTransaction() {
          return this[cppdb].inTransaction;
        },
        enumerable: true
      },
      readonly: {
        get: function readonly() {
          return this[cppdb].readonly;
        },
        enumerable: true
      },
      memory: {
        get: function memory() {
          return this[cppdb].memory;
        },
        enumerable: true
      }
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/transaction.js
var require_transaction = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/transaction.js"(exports2, module2) {
    "use strict";
    var { cppdb } = require_util();
    var controllers = /* @__PURE__ */ new WeakMap();
    module2.exports = function transaction(fn) {
      if (typeof fn !== "function") throw new TypeError("Expected first argument to be a function");
      const db = this[cppdb];
      const controller = getController(db, this);
      const { apply } = Function.prototype;
      const properties = {
        default: { value: wrapTransaction(apply, fn, db, controller.default) },
        deferred: { value: wrapTransaction(apply, fn, db, controller.deferred) },
        immediate: { value: wrapTransaction(apply, fn, db, controller.immediate) },
        exclusive: { value: wrapTransaction(apply, fn, db, controller.exclusive) },
        database: { value: this, enumerable: true }
      };
      Object.defineProperties(properties.default.value, properties);
      Object.defineProperties(properties.deferred.value, properties);
      Object.defineProperties(properties.immediate.value, properties);
      Object.defineProperties(properties.exclusive.value, properties);
      return properties.default.value;
    };
    var getController = (db, self) => {
      let controller = controllers.get(db);
      if (!controller) {
        const shared = {
          commit: db.prepare("COMMIT", self, false),
          rollback: db.prepare("ROLLBACK", self, false),
          savepoint: db.prepare("SAVEPOINT `	_bs3.	`", self, false),
          release: db.prepare("RELEASE `	_bs3.	`", self, false),
          rollbackTo: db.prepare("ROLLBACK TO `	_bs3.	`", self, false)
        };
        controllers.set(db, controller = {
          default: Object.assign({ begin: db.prepare("BEGIN", self, false) }, shared),
          deferred: Object.assign({ begin: db.prepare("BEGIN DEFERRED", self, false) }, shared),
          immediate: Object.assign({ begin: db.prepare("BEGIN IMMEDIATE", self, false) }, shared),
          exclusive: Object.assign({ begin: db.prepare("BEGIN EXCLUSIVE", self, false) }, shared)
        });
      }
      return controller;
    };
    var wrapTransaction = (apply, fn, db, { begin, commit, rollback, savepoint, release, rollbackTo }) => function sqliteTransaction() {
      let before, after, undo;
      if (db.inTransaction) {
        before = savepoint;
        after = release;
        undo = rollbackTo;
      } else {
        before = begin;
        after = commit;
        undo = rollback;
      }
      before.run();
      try {
        const result = apply.call(fn, this, arguments);
        if (result && typeof result.then === "function") {
          throw new TypeError("Transaction function cannot return a promise");
        }
        after.run();
        return result;
      } catch (ex) {
        if (db.inTransaction) {
          undo.run();
          if (undo !== rollback) after.run();
        }
        throw ex;
      }
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/pragma.js
var require_pragma = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/pragma.js"(exports2, module2) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module2.exports = function pragma(source, options) {
      if (options == null) options = {};
      if (typeof source !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      const simple = getBooleanOption(options, "simple");
      const stmt = this[cppdb].prepare(`PRAGMA ${source}`, this, true);
      return simple ? stmt.pluck().get() : stmt.all();
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/backup.js
var require_backup = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/backup.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path2 = require("path");
    var { promisify } = require("util");
    var { cppdb } = require_util();
    var fsAccess = promisify(fs.access);
    module2.exports = async function backup(filename, options) {
      if (options == null) options = {};
      if (typeof filename !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      filename = filename.trim();
      const attachedName = "attached" in options ? options.attached : "main";
      const handler = "progress" in options ? options.progress : null;
      if (!filename) throw new TypeError("Backup filename cannot be an empty string");
      if (filename === ":memory:") throw new TypeError('Invalid backup filename ":memory:"');
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      if (handler != null && typeof handler !== "function") throw new TypeError('Expected the "progress" option to be a function');
      await fsAccess(path2.dirname(filename)).catch(() => {
        throw new TypeError("Cannot save backup because the directory does not exist");
      });
      const isNewFile = await fsAccess(filename).then(() => false, () => true);
      return runBackup(this[cppdb].backup(this, attachedName, filename, isNewFile), handler || null);
    };
    var runBackup = (backup, handler) => {
      let rate = 0;
      let useDefault = true;
      return new Promise((resolve, reject) => {
        setImmediate(function step() {
          try {
            const progress = backup.transfer(rate);
            if (!progress.remainingPages) {
              backup.close();
              resolve(progress);
              return;
            }
            if (useDefault) {
              useDefault = false;
              rate = 100;
            }
            if (handler) {
              const ret = handler(progress);
              if (ret !== void 0) {
                if (typeof ret === "number" && ret === ret) rate = Math.max(0, Math.min(2147483647, Math.round(ret)));
                else throw new TypeError("Expected progress callback to return a number or undefined");
              }
            }
            setImmediate(step);
          } catch (err) {
            backup.close();
            reject(err);
          }
        });
      });
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/serialize.js
var require_serialize = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/serialize.js"(exports2, module2) {
    "use strict";
    var { cppdb } = require_util();
    module2.exports = function serialize(options) {
      if (options == null) options = {};
      if (typeof options !== "object") throw new TypeError("Expected first argument to be an options object");
      const attachedName = "attached" in options ? options.attached : "main";
      if (typeof attachedName !== "string") throw new TypeError('Expected the "attached" option to be a string');
      if (!attachedName) throw new TypeError('The "attached" option cannot be an empty string');
      return this[cppdb].serialize(attachedName);
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/function.js
var require_function = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/function.js"(exports2, module2) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module2.exports = function defineFunction(name, options, fn) {
      if (options == null) options = {};
      if (typeof options === "function") {
        fn = options;
        options = {};
      }
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof fn !== "function") throw new TypeError("Expected last argument to be a function");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = fn.length;
        if (!Number.isInteger(argCount) || argCount < 0) throw new TypeError("Expected function.length to be a positive integer");
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].function(fn, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/aggregate.js
var require_aggregate = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/aggregate.js"(exports2, module2) {
    "use strict";
    var { getBooleanOption, cppdb } = require_util();
    module2.exports = function defineAggregate(name, options) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object" || options === null) throw new TypeError("Expected second argument to be an options object");
      if (!name) throw new TypeError("User-defined function name cannot be an empty string");
      const start = "start" in options ? options.start : null;
      const step = getFunctionOption(options, "step", true);
      const inverse = getFunctionOption(options, "inverse", false);
      const result = getFunctionOption(options, "result", false);
      const safeIntegers = "safeIntegers" in options ? +getBooleanOption(options, "safeIntegers") : 2;
      const deterministic = getBooleanOption(options, "deterministic");
      const directOnly = getBooleanOption(options, "directOnly");
      const varargs = getBooleanOption(options, "varargs");
      let argCount = -1;
      if (!varargs) {
        argCount = Math.max(getLength(step), inverse ? getLength(inverse) : 0);
        if (argCount > 0) argCount -= 1;
        if (argCount > 100) throw new RangeError("User-defined functions cannot have more than 100 arguments");
      }
      this[cppdb].aggregate(start, step, inverse, result, name, argCount, safeIntegers, deterministic, directOnly);
      return this;
    };
    var getFunctionOption = (options, key, required) => {
      const value = key in options ? options[key] : null;
      if (typeof value === "function") return value;
      if (value != null) throw new TypeError(`Expected the "${key}" option to be a function`);
      if (required) throw new TypeError(`Missing required option "${key}"`);
      return null;
    };
    var getLength = ({ length }) => {
      if (Number.isInteger(length) && length >= 0) return length;
      throw new TypeError("Expected function.length to be a positive integer");
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/table.js
var require_table = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/table.js"(exports2, module2) {
    "use strict";
    var { cppdb } = require_util();
    module2.exports = function defineTable(name, factory) {
      if (typeof name !== "string") throw new TypeError("Expected first argument to be a string");
      if (!name) throw new TypeError("Virtual table module name cannot be an empty string");
      let eponymous = false;
      if (typeof factory === "object" && factory !== null) {
        eponymous = true;
        factory = defer(parseTableDefinition(factory, "used", name));
      } else {
        if (typeof factory !== "function") throw new TypeError("Expected second argument to be a function or a table definition object");
        factory = wrapFactory(factory);
      }
      this[cppdb].table(factory, name, eponymous);
      return this;
    };
    function wrapFactory(factory) {
      return function virtualTableFactory(moduleName, databaseName, tableName, ...args) {
        const thisObject = {
          module: moduleName,
          database: databaseName,
          table: tableName
        };
        const def = apply.call(factory, thisObject, args);
        if (typeof def !== "object" || def === null) {
          throw new TypeError(`Virtual table module "${moduleName}" did not return a table definition object`);
        }
        return parseTableDefinition(def, "returned", moduleName);
      };
    }
    function parseTableDefinition(def, verb, moduleName) {
      if (!hasOwnProperty.call(def, "rows")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "rows" property`);
      }
      if (!hasOwnProperty.call(def, "columns")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition without a "columns" property`);
      }
      const rows = def.rows;
      if (typeof rows !== "function" || Object.getPrototypeOf(rows) !== GeneratorFunctionPrototype) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "rows" property (should be a generator function)`);
      }
      let columns = def.columns;
      if (!Array.isArray(columns) || !(columns = [...columns]).every((x) => typeof x === "string")) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "columns" property (should be an array of strings)`);
      }
      if (columns.length !== new Set(columns).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate column names`);
      }
      if (!columns.length) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with zero columns`);
      }
      let parameters;
      if (hasOwnProperty.call(def, "parameters")) {
        parameters = def.parameters;
        if (!Array.isArray(parameters) || !(parameters = [...parameters]).every((x) => typeof x === "string")) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "parameters" property (should be an array of strings)`);
        }
      } else {
        parameters = inferParameters(rows);
      }
      if (parameters.length !== new Set(parameters).size) {
        throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with duplicate parameter names`);
      }
      if (parameters.length > 32) {
        throw new RangeError(`Virtual table module "${moduleName}" ${verb} a table definition with more than the maximum number of 32 parameters`);
      }
      for (const parameter of parameters) {
        if (columns.includes(parameter)) {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with column "${parameter}" which was ambiguously defined as both a column and parameter`);
        }
      }
      let safeIntegers = 2;
      if (hasOwnProperty.call(def, "safeIntegers")) {
        const bool = def.safeIntegers;
        if (typeof bool !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "safeIntegers" property (should be a boolean)`);
        }
        safeIntegers = +bool;
      }
      let directOnly = false;
      if (hasOwnProperty.call(def, "directOnly")) {
        directOnly = def.directOnly;
        if (typeof directOnly !== "boolean") {
          throw new TypeError(`Virtual table module "${moduleName}" ${verb} a table definition with an invalid "directOnly" property (should be a boolean)`);
        }
      }
      const columnDefinitions = [
        ...parameters.map(identifier).map((str) => `${str} HIDDEN`),
        ...columns.map(identifier)
      ];
      return [
        `CREATE TABLE x(${columnDefinitions.join(", ")});`,
        wrapGenerator(rows, new Map(columns.map((x, i) => [x, parameters.length + i])), moduleName),
        parameters,
        safeIntegers,
        directOnly
      ];
    }
    function wrapGenerator(generator, columnMap, moduleName) {
      return function* virtualTable(...args) {
        const output = args.map((x) => Buffer.isBuffer(x) ? Buffer.from(x) : x);
        for (let i = 0; i < columnMap.size; ++i) {
          output.push(null);
        }
        for (const row of generator(...args)) {
          if (Array.isArray(row)) {
            extractRowArray(row, output, columnMap.size, moduleName);
            yield output;
          } else if (typeof row === "object" && row !== null) {
            extractRowObject(row, output, columnMap, moduleName);
            yield output;
          } else {
            throw new TypeError(`Virtual table module "${moduleName}" yielded something that isn't a valid row object`);
          }
        }
      };
    }
    function extractRowArray(row, output, columnCount, moduleName) {
      if (row.length !== columnCount) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an incorrect number of columns`);
      }
      const offset = output.length - columnCount;
      for (let i = 0; i < columnCount; ++i) {
        output[i + offset] = row[i];
      }
    }
    function extractRowObject(row, output, columnMap, moduleName) {
      let count = 0;
      for (const key of Object.keys(row)) {
        const index = columnMap.get(key);
        if (index === void 0) {
          throw new TypeError(`Virtual table module "${moduleName}" yielded a row with an undeclared column "${key}"`);
        }
        output[index] = row[key];
        count += 1;
      }
      if (count !== columnMap.size) {
        throw new TypeError(`Virtual table module "${moduleName}" yielded a row with missing columns`);
      }
    }
    function inferParameters({ length }) {
      if (!Number.isInteger(length) || length < 0) {
        throw new TypeError("Expected function.length to be a positive integer");
      }
      const params = [];
      for (let i = 0; i < length; ++i) {
        params.push(`$${i + 1}`);
      }
      return params;
    }
    var { hasOwnProperty } = Object.prototype;
    var { apply } = Function.prototype;
    var GeneratorFunctionPrototype = Object.getPrototypeOf(function* () {
    });
    var identifier = (str) => `"${str.replace(/"/g, '""')}"`;
    var defer = (x) => () => x;
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/inspect.js
var require_inspect = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/methods/inspect.js"(exports2, module2) {
    "use strict";
    var DatabaseInspection = function Database() {
    };
    module2.exports = function inspect(depth, opts) {
      return Object.assign(new DatabaseInspection(), this);
    };
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/database.js
var require_database = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/database.js"(exports2, module2) {
    "use strict";
    var fs = require("fs");
    var path2 = require("path");
    var util = require_util();
    var SqliteError = require_sqlite_error();
    var DEFAULT_ADDON;
    function Database(filenameGiven, options) {
      if (new.target == null) {
        return new Database(filenameGiven, options);
      }
      let buffer;
      if (Buffer.isBuffer(filenameGiven)) {
        buffer = filenameGiven;
        filenameGiven = ":memory:";
      }
      if (filenameGiven == null) filenameGiven = "";
      if (options == null) options = {};
      if (typeof filenameGiven !== "string") throw new TypeError("Expected first argument to be a string");
      if (typeof options !== "object") throw new TypeError("Expected second argument to be an options object");
      if ("readOnly" in options) throw new TypeError('Misspelled option "readOnly" should be "readonly"');
      if ("memory" in options) throw new TypeError('Option "memory" was removed in v7.0.0 (use ":memory:" filename instead)');
      const filename = filenameGiven.trim();
      const anonymous = filename === "" || filename === ":memory:";
      const readonly = util.getBooleanOption(options, "readonly");
      const fileMustExist = util.getBooleanOption(options, "fileMustExist");
      const timeout = "timeout" in options ? options.timeout : 5e3;
      const verbose = "verbose" in options ? options.verbose : null;
      const nativeBinding = "nativeBinding" in options ? options.nativeBinding : null;
      if (readonly && anonymous && !buffer) throw new TypeError("In-memory/temporary databases cannot be readonly");
      if (!Number.isInteger(timeout) || timeout < 0) throw new TypeError('Expected the "timeout" option to be a positive integer');
      if (timeout > 2147483647) throw new RangeError('Option "timeout" cannot be greater than 2147483647');
      if (verbose != null && typeof verbose !== "function") throw new TypeError('Expected the "verbose" option to be a function');
      if (nativeBinding != null && typeof nativeBinding !== "string" && typeof nativeBinding !== "object") throw new TypeError('Expected the "nativeBinding" option to be a string or addon object');
      let addon;
      if (nativeBinding == null) {
        addon = DEFAULT_ADDON || (DEFAULT_ADDON = require_bindings()("better_sqlite3.node"));
      } else if (typeof nativeBinding === "string") {
        const requireFunc = typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : require;
        addon = requireFunc(path2.resolve(nativeBinding).replace(/(\.node)?$/, ".node"));
      } else {
        addon = nativeBinding;
      }
      if (!addon.isInitialized) {
        addon.setErrorConstructor(SqliteError);
        addon.isInitialized = true;
      }
      if (!anonymous && !filename.startsWith("file:") && !fs.existsSync(path2.dirname(filename))) {
        throw new TypeError("Cannot open database because the directory does not exist");
      }
      Object.defineProperties(this, {
        [util.cppdb]: { value: new addon.Database(filename, filenameGiven, anonymous, readonly, fileMustExist, timeout, verbose || null, buffer || null) },
        ...wrappers.getters
      });
    }
    var wrappers = require_wrappers();
    Database.prototype.prepare = wrappers.prepare;
    Database.prototype.transaction = require_transaction();
    Database.prototype.pragma = require_pragma();
    Database.prototype.backup = require_backup();
    Database.prototype.serialize = require_serialize();
    Database.prototype.function = require_function();
    Database.prototype.aggregate = require_aggregate();
    Database.prototype.table = require_table();
    Database.prototype.loadExtension = wrappers.loadExtension;
    Database.prototype.exec = wrappers.exec;
    Database.prototype.close = wrappers.close;
    Database.prototype.defaultSafeIntegers = wrappers.defaultSafeIntegers;
    Database.prototype.unsafeMode = wrappers.unsafeMode;
    Database.prototype[util.inspect] = require_inspect();
    module2.exports = Database;
  }
});

// node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/index.js
var require_lib = __commonJS({
  "node_modules/.pnpm/better-sqlite3@12.11.1/node_modules/better-sqlite3/lib/index.js"(exports2, module2) {
    "use strict";
    module2.exports = require_database();
    module2.exports.SqliteError = require_sqlite_error();
  }
});

// packages/core/dist/persistent-research-state/db.js
var require_db = __commonJS({
  "packages/core/dist/persistent-research-state/db.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.openStore = openStore2;
    exports2.closeStore = closeStore2;
    var better_sqlite3_1 = __importDefault(require_lib());
    var fs = __importStar(require("node:fs"));
    var path2 = __importStar(require("node:path"));
    var MIGRATIONS_DIR = path2.join(__dirname, "migrations");
    function migrationFiles() {
      return fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
    }
    function currentVersion(db) {
      const row = db.prepare("SELECT MAX(version) as v FROM schema_version").get();
      return row?.v ?? 0;
    }
    function openStore2(filePath, nativeBindingPath) {
      const db = new better_sqlite3_1.default(filePath, nativeBindingPath ? { nativeBinding: nativeBindingPath } : void 0);
      db.pragma("journal_mode = WAL");
      db.exec("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)");
      const applied = currentVersion(db);
      const files = migrationFiles();
      for (const file of files) {
        const version = Number(file.split("_")[0]);
        if (version > applied) {
          const sql = fs.readFileSync(path2.join(MIGRATIONS_DIR, file), "utf8");
          db.exec(sql);
          db.prepare("INSERT INTO schema_version (version) VALUES (?)").run(version);
        }
      }
      return { db };
    }
    function closeStore2(store) {
      store.db.close();
    }
  }
});

// packages/core/dist/persistent-research-state/reads.js
var require_reads = __commonJS({
  "packages/core/dist/persistent-research-state/reads.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getElement = getElement;
    exports2.getDimension = getDimension;
    exports2.getCoordinate = getCoordinate;
    exports2.currentElements = currentElements;
    exports2.conflictRegions = conflictRegions;
    exports2.snapshot = snapshot;
    exports2.elementExists = elementExists;
    exports2.dimensionExists = dimensionExists;
    exports2.supersessionChainContains = supersessionChainContains;
    function rowToElement(row) {
      const prov = JSON.parse(row.prov);
      if (row.role === "content") {
        return { id: row.id, role: "content", kind: row.kind, payload: row.payload ? JSON.parse(row.payload) : null, prov };
      }
      return { id: row.id, role: "relation", relationType: row.relation_type, endpoints: JSON.parse(row.endpoints), prov };
    }
    function getElement(store, id) {
      const row = store.db.prepare("SELECT * FROM elements WHERE id = ?").get(id);
      return row ? rowToElement(row) : void 0;
    }
    function getDimension(store, id) {
      const row = store.db.prepare("SELECT * FROM dimensions WHERE id = ?").get(id);
      if (!row)
        return void 0;
      return {
        dimension: row.id,
        valueSpace: JSON.parse(row.value_space),
        registeredAt: row.registered_at,
        registeredBy: JSON.parse(row.registered_by)
      };
    }
    function getCoordinate(store, element, dimension) {
      const valueRows = store.db.prepare("SELECT value, prov, written_at FROM coordinate_values WHERE element = ? AND dimension = ? ORDER BY seq").all(element, dimension);
      const statusRow = store.db.prepare("SELECT status FROM coordinate_status WHERE element = ? AND dimension = ?").get(element, dimension);
      if (valueRows.length === 0 && !statusRow)
        return void 0;
      const values = valueRows.map((r) => ({
        value: JSON.parse(r.value),
        prov: JSON.parse(r.prov),
        writtenAt: r.written_at
      }));
      return { element, dimension, values, status: statusRow ? "examined" : "unexamined" };
    }
    function currentElements(store) {
      const rows = store.db.prepare(`SELECT id FROM elements WHERE id NOT IN (SELECT old_id FROM supersessions)`).all();
      return rows.map((r) => r.id);
    }
    function conflictRegions(store) {
      const rows = store.db.prepare(`SELECT element, dimension FROM coordinate_values GROUP BY element, dimension HAVING COUNT(DISTINCT value) >= 2`).all();
      return rows.map((r) => [r.element, r.dimension]);
    }
    function snapshot(store) {
      const elementRows = store.db.prepare("SELECT * FROM elements").all();
      const evidence = elementRows.map(rowToElement);
      const coordRows = store.db.prepare("SELECT DISTINCT element, dimension FROM coordinate_values").all();
      const statusOnlyRows = store.db.prepare("SELECT element, dimension FROM coordinate_status").all();
      const keys = new Set([...coordRows, ...statusOnlyRows].map((r) => `${r.element}\0${r.dimension}`));
      const interpretation = [...keys].map((k) => {
        const [element, dimension] = k.split("\0");
        return getCoordinate(store, element, dimension);
      });
      const dimRows = store.db.prepare("SELECT id FROM dimensions").all();
      const dimensions = dimRows.map((r) => getDimension(store, r.id));
      return { evidence, interpretation, dimensions };
    }
    function elementExists(store, id) {
      return store.db.prepare("SELECT 1 FROM elements WHERE id = ?").get(id) !== void 0;
    }
    function dimensionExists(store, id) {
      return store.db.prepare("SELECT 1 FROM dimensions WHERE id = ?").get(id) !== void 0;
    }
    function supersessionChainContains(store, old, target) {
      let frontier = [old];
      const seen = /* @__PURE__ */ new Set();
      while (frontier.length > 0) {
        const next = [];
        for (const id of frontier) {
          if (id === target)
            return true;
          if (seen.has(id))
            continue;
          seen.add(id);
          const rows = store.db.prepare("SELECT old_id FROM supersessions WHERE new_id = ?").all(id);
          next.push(...rows.map((r) => r.old_id));
        }
        frontier = next;
      }
      return false;
    }
  }
});

// packages/core/dist/persistent-research-state/index.js
var require_persistent_research_state = __commonJS({
  "packages/core/dist/persistent-research-state/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.supersessionChainContains = exports2.dimensionExists = exports2.elementExists = exports2.snapshot = exports2.conflictRegions = exports2.currentElements = exports2.getCoordinate = exports2.getDimension = exports2.getElement = exports2.closeStore = exports2.openStore = void 0;
    var db_1 = require_db();
    Object.defineProperty(exports2, "openStore", { enumerable: true, get: function() {
      return db_1.openStore;
    } });
    Object.defineProperty(exports2, "closeStore", { enumerable: true, get: function() {
      return db_1.closeStore;
    } });
    var reads_1 = require_reads();
    Object.defineProperty(exports2, "getElement", { enumerable: true, get: function() {
      return reads_1.getElement;
    } });
    Object.defineProperty(exports2, "getDimension", { enumerable: true, get: function() {
      return reads_1.getDimension;
    } });
    Object.defineProperty(exports2, "getCoordinate", { enumerable: true, get: function() {
      return reads_1.getCoordinate;
    } });
    Object.defineProperty(exports2, "currentElements", { enumerable: true, get: function() {
      return reads_1.currentElements;
    } });
    Object.defineProperty(exports2, "conflictRegions", { enumerable: true, get: function() {
      return reads_1.conflictRegions;
    } });
    Object.defineProperty(exports2, "snapshot", { enumerable: true, get: function() {
      return reads_1.snapshot;
    } });
    Object.defineProperty(exports2, "elementExists", { enumerable: true, get: function() {
      return reads_1.elementExists;
    } });
    Object.defineProperty(exports2, "dimensionExists", { enumerable: true, get: function() {
      return reads_1.dimensionExists;
    } });
    Object.defineProperty(exports2, "supersessionChainContains", { enumerable: true, get: function() {
      return reads_1.supersessionChainContains;
    } });
  }
});

// packages/core/dist/util/uuid7.js
var require_uuid7 = __commonJS({
  "packages/core/dist/util/uuid7.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uuidv7 = uuidv7;
    var node_crypto_1 = require("node:crypto");
    function uuidv7() {
      const ts = BigInt(Date.now());
      const rand = (0, node_crypto_1.randomBytes)(10);
      const bytes = Buffer.alloc(16);
      bytes[0] = Number(ts >> 40n & 0xffn);
      bytes[1] = Number(ts >> 32n & 0xffn);
      bytes[2] = Number(ts >> 24n & 0xffn);
      bytes[3] = Number(ts >> 16n & 0xffn);
      bytes[4] = Number(ts >> 8n & 0xffn);
      bytes[5] = Number(ts & 0xffn);
      bytes[6] = 112 | rand[0] & 15;
      bytes[7] = rand[1];
      bytes[8] = 128 | rand[2] & 63;
      bytes[9] = rand[3];
      rand.copy(bytes, 10, 4, 10);
      const hex = bytes.toString("hex");
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }
  }
});

// packages/core/dist/persistent-research-state/writes.js
var require_writes = __commonJS({
  "packages/core/dist/persistent-research-state/writes.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.commitCapture = commitCapture;
    exports2.commitSupersede = commitSupersede;
    exports2.commitInterpret = commitInterpret;
    exports2.commitExamined = commitExamined;
    var reads = __importStar(require_reads());
    function ok(value) {
      return { ok: true, value };
    }
    function err(error) {
      return { ok: false, error };
    }
    function insertElementRow(store, e) {
      store.db.prepare(`INSERT INTO elements (id, role, kind, relation_type, endpoints, payload, prov) VALUES (?,?,?,?,?,?,?)`).run(e.id, e.role, e.role === "content" ? e.kind : null, e.role === "relation" ? e.relationType : null, e.role === "relation" ? JSON.stringify(e.endpoints) : null, e.role === "content" ? JSON.stringify(e.payload) : null, JSON.stringify(e.prov));
    }
    function logEvent(store, actType, payload) {
      store.db.prepare("INSERT INTO events (act_type, payload, committed_at) VALUES (?,?,?)").run(actType, JSON.stringify(payload), Date.now());
    }
    function commitCapture(store, id, kind, payload, prov) {
      if (reads.elementExists(store, id))
        return err({ code: "DUPLICATE_ID", id });
      const el = { id, role: "content", kind, payload, prov };
      const tx = store.db.transaction(() => {
        insertElementRow(store, el);
        logEvent(store, "capture", el);
      });
      tx();
      return ok(id);
    }
    function commitSupersede(store, newId, old, kind, payload, relId, prov) {
      if (!reads.elementExists(store, old))
        return err({ code: "UNKNOWN_ELEMENT", element: old });
      if (reads.elementExists(store, newId))
        return err({ code: "DUPLICATE_ID", id: newId });
      if (reads.supersessionChainContains(store, old, newId)) {
        return err({ code: "SUPERSESSION_CYCLE", old, next: newId });
      }
      const content = { id: newId, role: "content", kind, payload, prov };
      const rel = { id: relId, role: "relation", relationType: "supersedes", endpoints: [newId, old], prov };
      const tx = store.db.transaction(() => {
        insertElementRow(store, content);
        insertElementRow(store, rel);
        store.db.prepare("INSERT INTO supersessions (new_id, old_id) VALUES (?,?)").run(newId, old);
        logEvent(store, "supersede", { content, rel });
      });
      tx();
      return ok([newId, relId]);
    }
    function commitInterpret(store, element, dimension, value, prov) {
      if (!reads.elementExists(store, element))
        return err({ code: "UNKNOWN_ELEMENT", element });
      const dim = reads.getDimension(store, dimension);
      if (!dim)
        return err({ code: "UNKNOWN_DIMENSION", dimension });
      if (!validateValue(dim, value))
        return err({ code: "INVALID_VALUE", dimension, value });
      const existing = reads.getCoordinate(store, element, dimension);
      const already = existing?.values.some((v) => JSON.stringify(v.value) === JSON.stringify(value));
      const tx = store.db.transaction(() => {
        if (!already) {
          const seq = existing ? existing.values.length : 0;
          store.db.prepare("INSERT INTO coordinate_values (element, dimension, seq, value, prov, written_at) VALUES (?,?,?,?,?,?)").run(element, dimension, seq, JSON.stringify(value), JSON.stringify(prov), Date.now());
          logEvent(store, "interpret", { element, dimension, value, prov });
        }
      });
      tx();
      return ok(`${element}:${dimension}`);
    }
    function commitExamined(store, element, dimension) {
      if (!reads.elementExists(store, element))
        return err({ code: "UNKNOWN_ELEMENT", element });
      if (!reads.dimensionExists(store, dimension))
        return err({ code: "UNKNOWN_DIMENSION", dimension });
      store.db.prepare("INSERT OR IGNORE INTO coordinate_status (element, dimension, status) VALUES (?,?,?)").run(element, dimension, "examined");
      return ok(`${element}:${dimension}`);
    }
    function validateValue(dim, value) {
      const vs = dim.valueSpace;
      switch (vs.kind) {
        case "enum":
          return typeof value === "string" && vs.values.includes(value);
        case "scalar": {
          if (typeof value !== "number")
            return false;
          if (vs.min !== void 0 && value < vs.min)
            return false;
          if (vs.max !== void 0 && value > vs.max)
            return false;
          return true;
        }
        case "ref":
          return typeof value === "string";
        case "freeText":
          return typeof value === "string";
        default:
          return false;
      }
    }
  }
});

// packages/core/dist/provenance/index.js
var require_provenance = __commonJS({
  "packages/core/dist/provenance/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.joint = joint2;
    exports2.alternative = alternative;
    exports2.mergeProvenance = mergeProvenance;
    exports2.attribute = attribute2;
    exports2.compose = compose;
    var uuid7_1 = require_uuid7();
    function actKey(a) {
      return a.id;
    }
    function dedupeSet(s) {
      const byId = /* @__PURE__ */ new Map();
      for (const a of s)
        byId.set(actKey(a), a);
      return [...byId.values()];
    }
    function setKey(s) {
      return dedupeSet(s).map(actKey).sort().join(",");
    }
    function isSubsetOf(a, b) {
      const as = dedupeSet(a);
      const bs = new Set(dedupeSet(b).map(actKey));
      return as.every((x) => bs.has(actKey(x)));
    }
    function normalize(expr) {
      const deduped = expr.map(dedupeSet);
      const seen = /* @__PURE__ */ new Map();
      for (const s of deduped) {
        const k = setKey(s);
        if (!seen.has(k))
          seen.set(k, s);
      }
      const sets = [...seen.values()];
      const minimal = sets.filter((s) => {
        const sk = setKey(s);
        return !sets.some((other) => setKey(other) !== sk && isSubsetOf(other, s));
      });
      return minimal;
    }
    function joint2(refs) {
      if (refs.length === 0)
        return [];
      return normalize([refs]);
    }
    function alternative(...exprs) {
      return normalize(exprs.flat());
    }
    function mergeProvenance(a, b) {
      return alternative(a, b);
    }
    var counter = 0;
    function attribute2(actType, agent, timestamp = Date.now()) {
      counter += 1;
      return { id: `${(0, uuid7_1.uuidv7)()}-${counter}`, actType, agent, timestamp };
    }
    function compose(refs, mode) {
      return mode === "joint" ? joint2(refs) : alternative(...refs.map((r) => joint2([r])));
    }
  }
});

// packages/core/dist/transformation-engine/index.js
var require_transformation_engine = __commonJS({
  "packages/core/dist/transformation-engine/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TransformationEngine = void 0;
    var uuid7_1 = require_uuid7();
    var writes = __importStar(require_writes());
    var provenance_1 = require_provenance();
    var TransformationEngine2 = class {
      store;
      tracker;
      agent;
      constructor(store, tracker, agent = "researcher") {
        this.store = store;
        this.tracker = tracker;
        this.agent = agent;
      }
      capture(payload, kind) {
        const id = (0, uuid7_1.uuidv7)();
        const act = (0, provenance_1.attribute)("capture", this.agent);
        const res = writes.commitCapture(this.store, id, kind, payload, (0, provenance_1.joint)([act]));
        return this.finish(res, id ? /* @__PURE__ */ new Set([id]) : /* @__PURE__ */ new Set());
      }
      supersede(old, payload, kind) {
        const newId = (0, uuid7_1.uuidv7)();
        const relId = (0, uuid7_1.uuidv7)();
        const act = (0, provenance_1.attribute)("supersede", this.agent);
        const res = writes.commitSupersede(this.store, newId, old, kind, payload, relId, (0, provenance_1.joint)([act]));
        if (!res.ok)
          return res;
        this.tracker.notify(/* @__PURE__ */ new Set([newId, old]), newId);
        return { ok: true, value: newId };
      }
      interpret(e, d, v) {
        const act = (0, provenance_1.attribute)("interpret", this.agent);
        const res = writes.commitInterpret(this.store, e, d, v, (0, provenance_1.joint)([act]));
        if (!res.ok)
          return res;
        this.tracker.notify(/* @__PURE__ */ new Set([res.value]), e);
        return { ok: true, value: void 0 };
      }
      /** Called only by Subsystem 3 (Synthesis Engine) — deferred in v0 per
       *  Reference Implementation Strategy §7, but the commit path is complete
       *  and independently testable ahead of the Synthesis Engine's own build. */
      applySynthesisBatch(batch) {
        const act = (0, provenance_1.attribute)("synthesis_run", "synthesis_engine");
        const touched = /* @__PURE__ */ new Set();
        for (const w of batch.writes) {
          const res = writes.commitInterpret(this.store, w.element, w.dimension, w.value, (0, provenance_1.joint)([act]));
          if (!res.ok)
            return res;
          touched.add(res.value);
        }
        for (const ex of batch.newlyExamined) {
          const res = writes.commitExamined(this.store, ex.element, ex.dimension);
          if (!res.ok)
            return res;
          touched.add(res.value);
        }
        this.tracker.notify(touched, "synthesis-run");
        return { ok: true, value: touched };
      }
      finish(res, changed) {
        if (res.ok)
          this.tracker.notify(changed, res.value);
        return res;
      }
    };
    exports2.TransformationEngine = TransformationEngine2;
  }
});

// packages/core/dist/dependency-tracker/index.js
var require_dependency_tracker = __commonJS({
  "packages/core/dist/dependency-tracker/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DependencyTracker = void 0;
    var DependencyTracker2 = class {
      dirty = true;
      // start dirty: nothing has been computed yet
      register(_artifactId, _dependsOn) {
      }
      notify(_delta, _causedBy) {
        this.dirty = true;
      }
      isDirty(_artifactId) {
        return this.dirty;
      }
      clear(_artifactId) {
        this.dirty = false;
      }
    };
    exports2.DependencyTracker = DependencyTracker2;
  }
});

// packages/core/dist/configuration/registry-writes.js
var require_registry_writes = __commonJS({
  "packages/core/dist/configuration/registry-writes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.registerDimensionRow = registerDimensionRow;
    var persistent_research_state_1 = require_persistent_research_state();
    function registerDimensionRow(store, def) {
      if ((0, persistent_research_state_1.dimensionExists)(store, def.dimension)) {
        return { ok: false, error: { code: "DUPLICATE_DIMENSION", dimension: def.dimension } };
      }
      store.db.prepare("INSERT INTO dimensions (id, value_space, registered_at, registered_by) VALUES (?,?,?,?)").run(def.dimension, JSON.stringify(def.valueSpace), def.registeredAt, JSON.stringify(def.registeredBy));
      return { ok: true, value: def.dimension };
    }
  }
});

// packages/core/dist/configuration/index.js
var require_configuration = __commonJS({
  "packages/core/dist/configuration/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar = exports2 && exports2.__importStar || /* @__PURE__ */ function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    }();
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.registerDimension = registerDimension2;
    exports2.getDimension = getDimension;
    exports2.defaultWeightConfig = defaultWeightConfig;
    var writes = __importStar(require_registry_writes());
    var persistent_research_state_1 = require_persistent_research_state();
    function registerDimension2(store, def) {
      return writes.registerDimensionRow(store, def);
    }
    function getDimension(store, id) {
      return (0, persistent_research_state_1.getDimension)(store, id);
    }
    function defaultWeightConfig() {
      return {
        weights: /* @__PURE__ */ new Map(),
        agreeFns: /* @__PURE__ */ new Map()
      };
    }
  }
});

// packages/core/dist/semantic-computation/index.js
var require_semantic_computation = __commonJS({
  "packages/core/dist/semantic-computation/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.proximity = proximity;
    var persistent_research_state_1 = require_persistent_research_state();
    function agree(fn, a, b) {
      if (a === void 0 || b === void 0)
        return 0;
      switch (fn) {
        case "enum-overlap":
        case "ref-equality":
        case "freetext-equality":
          return a === b ? 1 : 0;
        case "scalar-decay": {
          if (typeof a !== "number" || typeof b !== "number")
            return 0;
          return Math.max(0, 1 - Math.abs(a - b));
        }
        default:
          return 0;
      }
    }
    function proximity(store, e1, e2, config) {
      let total = 0;
      let weightSum = 0;
      for (const [dim, w] of config.weights) {
        const c1 = (0, persistent_research_state_1.getCoordinate)(store, e1, dim);
        const c2 = (0, persistent_research_state_1.getCoordinate)(store, e2, dim);
        const v1 = c1?.values[0]?.value;
        const v2 = c2?.values[0]?.value;
        const fn = config.agreeFns.get(dim) ?? "freetext-equality";
        total += w * agree(fn, v1, v2);
        weightSum += w;
      }
      return weightSum === 0 ? 0 : total / weightSum;
    }
  }
});

// packages/core/dist/projection-engine/index.js
var require_projection_engine = __commonJS({
  "packages/core/dist/projection-engine/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.render = render;
    var persistent_research_state_1 = require_persistent_research_state();
    var SUPPORTED = /* @__PURE__ */ new Set(["thread_view", "timeline"]);
    function render(store, q) {
      if (!SUPPORTED.has(q.operator)) {
        throw new Error(`Projection operator '${q.operator}' is deferred per Reference Implementation Strategy \xA77 (only thread_view and timeline are implemented in v0).`);
      }
      const conflicted = new Set((0, persistent_research_state_1.conflictRegions)(store).map(([e, d]) => `${e}\0${d}`));
      const elementConflicted = (e) => [...conflicted].some((k) => k.startsWith(`${e}\0`));
      if (q.operator === "thread_view") {
        const threadDim = q.parameters["dimension"] ?? "thread";
        const content2 = (0, persistent_research_state_1.currentElements)(store).filter((e) => (0, persistent_research_state_1.getCoordinate)(store, e, threadDim) !== void 0).map((e) => ({ element: e, conflicted: elementConflicted(e) }));
        return { operator: "thread_view", abstraction: "finest", content: content2, conflictFaithful: true };
      }
      const content = (0, persistent_research_state_1.currentElements)(store).map((e) => {
        const el = (0, persistent_research_state_1.getElement)(store, e);
        const t = el.prov[0]?.[0]?.timestamp ?? 0;
        return { element: e, writtenAt: t, conflicted: elementConflicted(e) };
      }).sort((a, b) => a.writtenAt - b.writtenAt);
      return { operator: "timeline", abstraction: "finest", content, conflictFaithful: true };
    }
  }
});

// packages/core/dist/index.js
var require_dist = __commonJS({
  "packages/core/dist/index.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mergeProvenance = exports2.alternative = exports2.joint = exports2.compose = exports2.attribute = exports2.renderProjection = exports2.proximity = exports2.defaultWeightConfig = exports2.getDimensionConfig = exports2.registerDimension = exports2.DependencyTracker = exports2.TransformationEngine = exports2.snapshot = exports2.conflictRegions = exports2.currentElements = exports2.getCoordinate = exports2.getDimension = exports2.getElement = exports2.closeStore = exports2.openStore = void 0;
    __exportStar(require_types(), exports2);
    var persistent_research_state_1 = require_persistent_research_state();
    Object.defineProperty(exports2, "openStore", { enumerable: true, get: function() {
      return persistent_research_state_1.openStore;
    } });
    Object.defineProperty(exports2, "closeStore", { enumerable: true, get: function() {
      return persistent_research_state_1.closeStore;
    } });
    var persistent_research_state_2 = require_persistent_research_state();
    Object.defineProperty(exports2, "getElement", { enumerable: true, get: function() {
      return persistent_research_state_2.getElement;
    } });
    Object.defineProperty(exports2, "getDimension", { enumerable: true, get: function() {
      return persistent_research_state_2.getDimension;
    } });
    Object.defineProperty(exports2, "getCoordinate", { enumerable: true, get: function() {
      return persistent_research_state_2.getCoordinate;
    } });
    Object.defineProperty(exports2, "currentElements", { enumerable: true, get: function() {
      return persistent_research_state_2.currentElements;
    } });
    Object.defineProperty(exports2, "conflictRegions", { enumerable: true, get: function() {
      return persistent_research_state_2.conflictRegions;
    } });
    Object.defineProperty(exports2, "snapshot", { enumerable: true, get: function() {
      return persistent_research_state_2.snapshot;
    } });
    var transformation_engine_1 = require_transformation_engine();
    Object.defineProperty(exports2, "TransformationEngine", { enumerable: true, get: function() {
      return transformation_engine_1.TransformationEngine;
    } });
    var dependency_tracker_1 = require_dependency_tracker();
    Object.defineProperty(exports2, "DependencyTracker", { enumerable: true, get: function() {
      return dependency_tracker_1.DependencyTracker;
    } });
    var configuration_1 = require_configuration();
    Object.defineProperty(exports2, "registerDimension", { enumerable: true, get: function() {
      return configuration_1.registerDimension;
    } });
    Object.defineProperty(exports2, "getDimensionConfig", { enumerable: true, get: function() {
      return configuration_1.getDimension;
    } });
    Object.defineProperty(exports2, "defaultWeightConfig", { enumerable: true, get: function() {
      return configuration_1.defaultWeightConfig;
    } });
    var semantic_computation_1 = require_semantic_computation();
    Object.defineProperty(exports2, "proximity", { enumerable: true, get: function() {
      return semantic_computation_1.proximity;
    } });
    var projection_engine_1 = require_projection_engine();
    Object.defineProperty(exports2, "renderProjection", { enumerable: true, get: function() {
      return projection_engine_1.render;
    } });
    var provenance_1 = require_provenance();
    Object.defineProperty(exports2, "attribute", { enumerable: true, get: function() {
      return provenance_1.attribute;
    } });
    Object.defineProperty(exports2, "compose", { enumerable: true, get: function() {
      return provenance_1.compose;
    } });
    Object.defineProperty(exports2, "joint", { enumerable: true, get: function() {
      return provenance_1.joint;
    } });
    Object.defineProperty(exports2, "alternative", { enumerable: true, get: function() {
      return provenance_1.alternative;
    } });
    Object.defineProperty(exports2, "mergeProvenance", { enumerable: true, get: function() {
      return provenance_1.mergeProvenance;
    } });
  }
});

// packages/obsidian-plugin/src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ResearchOperatingSystemPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var path = __toESM(require("node:path"));
var import_core = __toESM(require_dist());
var ResearchOperatingSystemPlugin = class extends import_obsidian.Plugin {
  store;
  engine;
  async onload() {
    const vaultBasePath = this.app.vault.adapter.basePath ?? ".";
    const pluginDir = path.join(vaultBasePath, this.manifest.dir ?? ".obsidian/plugins/ros");
    const dbPath = path.join(pluginDir, "state.sqlite");
    const nativeBindingPath = path.join(pluginDir, "better_sqlite3.node");
    this.store = (0, import_core.openStore)(dbPath, nativeBindingPath);
    this.engine = new import_core.TransformationEngine(this.store, new import_core.DependencyTracker());
    (0, import_core.registerDimension)(this.store, {
      dimension: "thread",
      valueSpace: { kind: "freeText" },
      registeredAt: Date.now(),
      registeredBy: (0, import_core.joint)([(0, import_core.attribute)("capture", "plugin-init")])
    });
    this.addCommand({
      id: "ros-capture",
      name: "ROS: Capture note",
      callback: () => new CaptureModal(this.app, (text) => this.handleCapture(text)).open()
    });
    this.addCommand({
      id: "ros-render-thread-view",
      name: "ROS: Render Thread View",
      callback: () => this.renderView("thread_view")
    });
    this.addCommand({
      id: "ros-render-timeline",
      name: "ROS: Render Timeline",
      callback: () => this.renderView("timeline")
    });
  }
  onunload() {
    if (this.store) (0, import_core.closeStore)(this.store);
  }
  handleCapture(text) {
    const res = this.engine.capture({ text }, "observation");
    if (res.ok) {
      new import_obsidian.Notice("Captured.");
    } else {
      new import_obsidian.Notice(`Capture rejected: ${res.error.code}`);
    }
  }
  renderView(operator) {
    const view = (0, import_core.renderProjection)(this.store, { operator, parameters: {} });
    const count = Array.isArray(view.content) ? view.content.length : 0;
    new import_obsidian.Notice(`${operator}: ${count} element(s), conflictFaithful=${view.conflictFaithful}`);
  }
};
var CaptureModal = class extends import_obsidian.Modal {
  constructor(app, onSubmit) {
    super(app);
    this.onSubmit = onSubmit;
  }
  value = "";
  onOpen() {
    const { contentEl } = this;
    contentEl.createEl("h3", { text: "Capture" });
    new import_obsidian.Setting(contentEl).setName("Content").addText((t) => t.onChange((v) => {
      this.value = v;
    }));
    new import_obsidian.Setting(contentEl).addButton((b) => b.setButtonText("Capture").setCta().onClick(() => {
      this.close();
      this.onSubmit(this.value);
    }));
  }
  onClose() {
    this.contentEl.empty();
  }
};
//# sourceMappingURL=main.js.map
