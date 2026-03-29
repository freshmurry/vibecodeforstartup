"use strict";
/**
 * GitHub Exporter Routes
 * Handles GitHub repository export flows
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGitHubExporterRoutes = setupGitHubExporterRoutes;
var controller_1 = require("../controllers/githubExporter/controller");
var honoAdapter_1 = require("../honoAdapter");
var routeAuth_1 = require("../../middleware/auth/routeAuth");
/**
 * Setup GitHub Exporter routes
 */
function setupGitHubExporterRoutes(app) {
    app.get('/api/github-exporter/callback', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.public), (0, honoAdapter_1.adaptController)(controller_1.GitHubExporterController, controller_1.GitHubExporterController.handleOAuthCallback));
    // Repository export routes with OAuth flow
    app.post('/api/github-app/export', (0, routeAuth_1.setAuthLevel)(routeAuth_1.AuthConfig.authenticated), (0, honoAdapter_1.adaptController)(controller_1.GitHubExporterController, controller_1.GitHubExporterController.initiateGitHubExport));
}
