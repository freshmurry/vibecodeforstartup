"use strict";
/**
 * Base Database Service Class
 * Provides common database functionality and patterns for all domain services
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseService = void 0;
var database_1 = require("../database");
var drizzle_orm_1 = require("drizzle-orm");
var logger_1 = require("../../logger");
/**
 * Base class for all database domain services
 * Provides shared utilities and database access patterns
 */
var BaseService = /** @class */ (function () {
    function BaseService(env) {
        this.logger = (0, logger_1.createLogger)(this.constructor.name);
        this.db = (0, database_1.createDatabaseService)(env);
        this.env = env;
    }
    /**
     * Helper to build type-safe where conditions
     */
    BaseService.prototype.buildWhereConditions = function (conditions) {
        var validConditions = conditions.filter(function (c) { return c !== undefined; });
        if (validConditions.length === 0)
            return undefined;
        if (validConditions.length === 1)
            return validConditions[0];
        // Use Drizzle's and() function to properly combine conditions
        return drizzle_orm_1.and.apply(void 0, validConditions);
    };
    /**
     * Standard error handling for database operations
     */
    BaseService.prototype.handleDatabaseError = function (error, operation, context) {
        this.logger.error("Database error in ".concat(operation), { error: error, context: context });
        throw error;
    };
    Object.defineProperty(BaseService.prototype, "database", {
        /**
         * Get database connection for direct queries when needed
         */
        get: function () {
            return this.db.db;
        },
        enumerable: false,
        configurable: true
    });
    return BaseService;
}());
exports.BaseService = BaseService;
