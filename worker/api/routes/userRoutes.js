"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupUserRoutes = setupUserRoutes;
var controller_1 = require("../controllers/user/controller");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup user management routes
 */
function setupUserRoutes(app) {
    // User apps with pagination (this is what the frontend needs)
    app.get('/api/user/apps', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.UserController, controller_1.UserController.getApps));
    // User profile
    app.put('/api/user/profile', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.UserController, controller_1.UserController.updateProfile));
}
