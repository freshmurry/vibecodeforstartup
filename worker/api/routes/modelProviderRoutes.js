"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModelProviderRoutes = setupModelProviderRoutes;
var controller_1 = require("../controllers/modelProviders/controller");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
var honoAdapter_1 = require("../honoAdapter");
function setupModelProviderRoutes(app) {
    // Custom model provider routes
    app.get('/api/user/providers', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.getProviders));
    app.get('/api/user/providers/:id', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.getProvider));
    app.post('/api/user/providers', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.createProvider));
    app.put('/api/user/providers/:id', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.updateProvider));
    app.delete('/api/user/providers/:id', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.deleteProvider));
    app.post('/api/user/providers/test', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelProvidersController, controller_1.ModelProvidersController.testProvider));
}
