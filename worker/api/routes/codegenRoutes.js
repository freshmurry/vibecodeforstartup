"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupCodegenRoutes = setupCodegenRoutes;
var controller_1 = require("../controllers/agent/controller");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
var honoAdapter_1 = require("../honoAdapter");
/**
 * Setup and configure the application router
 */
function setupCodegenRoutes(app) {
    // ========================================
    // CODE GENERATION ROUTES
    // ========================================
    // CRITICAL: Create new app - requires full authentication
    app.post('/api/agent', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.CodingAgentController, controller_1.CodingAgentController.startCodeGeneration));
    // ========================================
    // APP EDITING ROUTES (/chat/:id frontend)
    // ========================================
    // WebSocket for app editing - OWNER ONLY (for /chat/:id route)
    // Only the app owner should be able to connect and modify via WebSocket
    app.get('/api/agent/:agentId/ws', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.ownerOnly), (0, honoAdapter_1.adaptController)(controller_1.CodingAgentController, controller_1.CodingAgentController.handleWebSocketConnection));
    // Connect to existing agent for editing - OWNER ONLY
    // Only the app owner should be able to connect for editing purposes
    app.get('/api/agent/:agentId/connect', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.ownerOnly), (0, honoAdapter_1.adaptController)(controller_1.CodingAgentController, controller_1.CodingAgentController.connectToExistingAgent));
    app.get('/api/agent/:agentId/preview', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.CodingAgentController, controller_1.CodingAgentController.deployPreview));
}
