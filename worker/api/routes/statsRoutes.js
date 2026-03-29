"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupStatsRoutes = setupStatsRoutes;
var controller_1 = require("../controllers/stats/controller");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup user statistics routes
 */
function setupStatsRoutes(app) {
    // User statistics
    app.get('/api/stats', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.StatsController, controller_1.StatsController.getUserStats));
    // User activity timeline
    app.get('/api/stats/activity', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.StatsController, controller_1.StatsController.getUserActivity));
}
