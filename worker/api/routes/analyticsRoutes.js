"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAnalyticsRoutes = setupAnalyticsRoutes;
/**
 * Setup routes for AI Gateway analytics endpoints
 */
var controller_1 = require("../controllers/analytics/controller");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
var honoAdapter_1 = require("../honoAdapter");
/**
 * Setup analytics routes
 */
function setupAnalyticsRoutes(app) {
    // User analytics - requires authentication
    app.get('/api/user/:id/analytics', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AnalyticsController, controller_1.AnalyticsController.getUserAnalytics));
    // Agent/Chat analytics - requires authentication
    app.get('/api/agent/:id/analytics', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.AnalyticsController, controller_1.AnalyticsController.getAgentAnalytics));
}
