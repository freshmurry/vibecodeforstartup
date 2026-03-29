"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
var authRoutes_1 = require("./authRoutes");
var appRoutes_1 = require("./appRoutes");
var userRoutes_1 = require("./userRoutes");
var statsRoutes_1 = require("./statsRoutes");
var analyticsRoutes_1 = require("./analyticsRoutes");
var secretsRoutes_1 = require("./secretsRoutes");
var modelConfigRoutes_1 = require("./modelConfigRoutes");
var modelProviderRoutes_1 = require("./modelProviderRoutes");
var githubExporterRoutes_1 = require("./githubExporterRoutes");
var codegenRoutes_1 = require("./codegenRoutes");
var screenshotRoutes_1 = require("./screenshotRoutes");
var sentryRoutes_1 = require("./sentryRoutes");
function setupRoutes(app) {
    // Health check route
    app.get('/api/health', function (c) {
        return c.json({ status: 'ok' });
    });
    // Sentry tunnel routes (public - no auth required)
    (0, sentryRoutes_1.setupSentryRoutes)(app);
    // Authentication and user management routes
    (0, authRoutes_1.setupAuthRoutes)(app);
    // Codegen routes
    (0, codegenRoutes_1.setupCodegenRoutes)(app);
    // User dashboard and profile routes
    (0, userRoutes_1.setupUserRoutes)(app);
    // App management routes
    (0, appRoutes_1.setupAppRoutes)(app);
    // Stats routes
    (0, statsRoutes_1.setupStatsRoutes)(app);
    // AI Gateway Analytics routes
    (0, analyticsRoutes_1.setupAnalyticsRoutes)(app);
    // Secrets management routes
    (0, secretsRoutes_1.setupSecretsRoutes)(app);
    // Model configuration and provider keys routes
    (0, modelConfigRoutes_1.setupModelConfigRoutes)(app);
    // Model provider routes
    (0, modelProviderRoutes_1.setupModelProviderRoutes)(app);
    // GitHub Exporter routes
    (0, githubExporterRoutes_1.setupGitHubExporterRoutes)(app);
    // Screenshot serving routes (public)
    (0, screenshotRoutes_1.setupScreenshotRoutes)(app);
}
