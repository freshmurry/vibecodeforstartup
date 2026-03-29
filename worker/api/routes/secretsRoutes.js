"use strict";
/**
 * Secrets Routes
 * API routes for user secrets management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSecretsRoutes = setupSecretsRoutes;
var controller_1 = require("../controllers/secrets/controller");
var hono_1 = require("hono");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup secrets-related routes
 */
function setupSecretsRoutes(app) {
    // Create a sub-router for secrets routes
    var secretsRouter = new hono_1.Hono();
    // Secrets management routes
    secretsRouter.get('/', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.SecretsController, controller_1.SecretsController.getAllSecrets));
    // DISABLED: BYOK Disabled for security reasons
    // secretsRouter.post('/', setAuthLevel(AuthConfig.authenticated), adaptController(SecretsController, SecretsController.storeSecret));
    secretsRouter.post('/', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), function (c) {
        return c.json({ message: 'BYOK is not supported for now' });
    });
    // secretsRouter.patch('/:secretId/toggle', setAuthLevel(AuthConfig.authenticated), adaptController(SecretsController, SecretsController.toggleSecret));
    // secretsRouter.delete('/:secretId', setAuthLevel(AuthConfig.authenticated), adaptController(SecretsController, SecretsController.deleteSecret));
    // Templates route
    secretsRouter.get('/templates', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.SecretsController, controller_1.SecretsController.getTemplates));
    // Mount the router under /api/secrets
    app.route('/api/secrets', secretsRouter);
}
