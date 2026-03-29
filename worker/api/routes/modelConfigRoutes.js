"use strict";
/**
 * Routes for managing user model configurations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupModelConfigRoutes = setupModelConfigRoutes;
var controller_1 = require("../controllers/modelConfig/controller");
var hono_1 = require("hono");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup model configuration routes
 * All routes are protected and require authentication
 */
function setupModelConfigRoutes(app) {
    // Create a sub-router for model config routes
    var modelConfigRouter = new hono_1.Hono();
    // Model Configuration Routes
    modelConfigRouter.get('/', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.getModelConfigs));
    modelConfigRouter.get('/defaults', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.getDefaults));
    modelConfigRouter.get('/byok-providers', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.getByokProviders));
    modelConfigRouter.get('/:agentAction', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.getModelConfig));
    modelConfigRouter.put('/:agentAction', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.updateModelConfig));
    modelConfigRouter.delete('/:agentAction', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.deleteModelConfig));
    modelConfigRouter.post('/test', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.testModelConfig));
    modelConfigRouter.post('/reset-all', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.ModelConfigController, controller_1.ModelConfigController.resetAllConfigs));
    // Mount the router under /api/model-configs
    app.route('/api/model-configs', modelConfigRouter);
}
