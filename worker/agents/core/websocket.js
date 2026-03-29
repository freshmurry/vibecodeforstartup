"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleWebSocketMessage = handleWebSocketMessage;
exports.handleWebSocketClose = handleWebSocketClose;
exports.broadcastToConnections = broadcastToConnections;
exports.sendToConnection = sendToConnection;
exports.sendError = sendError;
var logger_1 = require("../../logger");
var constants_1 = require("../constants");
var logger = (0, logger_1.createLogger)('CodeGeneratorWebSocket');
function handleWebSocketMessage(agent, connection, message) {
    var _a;
    try {
        logger.info("Received WebSocket message from ".concat(connection.id, ": ").concat(message));
        var parsedMessage_1 = JSON.parse(message);
        switch (parsedMessage_1.type) {
            case constants_1.WebSocketMessageRequests.GENERATE_ALL:
                // Set shouldBeGenerating flag to indicate persistent intent
                agent.setState(__assign(__assign({}, agent.state), { shouldBeGenerating: true }));
                // Check if generation is already active to avoid duplicate processes
                if (agent.isGenerating) {
                    logger.info('Generation already in progress, skipping duplicate request');
                    // sendToConnection(connection, WebSocketMessageResponses.GENERATION_STARTED, {
                    //     message: 'Code generation is already in progress'
                    // });
                    return;
                }
                // Start generation process
                logger.info('Starting code generation process');
                agent.generateAllFiles().catch(function (error) {
                    logger.error('Error during code generation:', error);
                    sendError(connection, "Error generating files: ".concat(error instanceof Error ? error.message : String(error)));
                }).finally(function () {
                    // Only clear shouldBeGenerating on successful completion
                    // (errors might want to retry, so this could be handled differently)
                    if (!agent.isGenerating) {
                        agent.setState(__assign(__assign({}, agent.state), { shouldBeGenerating: false }));
                    }
                });
                break;
            case constants_1.WebSocketMessageRequests.CODE_REVIEW:
                if (agent.isGenerating) {
                    sendError(connection, 'Cannot perform code review while generating files');
                    return;
                }
                sendToConnection(connection, constants_1.WebSocketMessageResponses.CODE_REVIEW, {
                    message: 'Starting code review'
                });
                agent.reviewCode().then(function (reviewResult) {
                    if (!reviewResult) {
                        sendError(connection, 'Failed to perform code review');
                        return;
                    }
                    sendToConnection(connection, constants_1.WebSocketMessageResponses.CODE_REVIEW, {
                        review: reviewResult,
                        issuesFound: reviewResult.issuesFound,
                    });
                    if (reviewResult.issuesFound && parsedMessage_1.autoFix === true) {
                        var _loop_1 = function (fileToFix) {
                            var fileToRegenerate = agent.state.generatedFilesMap[fileToFix.filePath];
                            if (!fileToRegenerate) {
                                logger.warn("File to fix not found in generated files: ".concat(fileToFix.filePath));
                                return "continue";
                            }
                            agent.regenerateFile(fileToRegenerate, fileToFix.issues, 0).catch(function (error) {
                                logger.error("Error regenerating file ".concat(fileToRegenerate.filePath, ":"), error);
                                sendError(connection, "Error regenerating file: ".concat(error instanceof Error ? error.message : String(error)));
                            });
                        };
                        for (var _i = 0, _a = reviewResult.filesToFix; _i < _a.length; _i++) {
                            var fileToFix = _a[_i];
                            _loop_1(fileToFix);
                        }
                    }
                }).catch(function (error) {
                    logger.error('Error during code review:', error);
                    sendError(connection, "Error during code review: ".concat(error instanceof Error ? error.message : String(error)));
                });
                break;
            case constants_1.WebSocketMessageRequests.DEPLOY:
                agent.deployToCloudflare().then(function (deploymentResult) {
                    if (!deploymentResult) {
                        logger.error('Failed to deploy to Cloudflare Workers');
                        return;
                    }
                    logger.info('Successfully deployed to Cloudflare Workers!', deploymentResult);
                }).catch(function (error) {
                    logger.error('Error during deployment:', error);
                });
                break;
            case constants_1.WebSocketMessageRequests.PREVIEW:
                // Deploy current state for preview
                logger.info('Deploying for preview');
                agent.deployToSandbox().then(function (deploymentResult) {
                    logger.info('Preview deployed successfully!, deploymentResult: ', deploymentResult);
                }).catch(function (error) {
                    logger.error('Error during preview deployment:', error);
                });
                break;
            case constants_1.WebSocketMessageRequests.RUNTIME_ERROR_FOUND:
                logger.info("Client reported errors: ".concat(parsedMessage_1.data));
                agent.setState(__assign(__assign({}, agent.state), { clientReportedErrors: parsedMessage_1.data }));
                break;
            case constants_1.WebSocketMessageRequests.SCREENSHOT_CAPTURED:
                logger.info('Screenshot captured from client', {
                    url: parsedMessage_1.data.url,
                    viewport: parsedMessage_1.data.viewport
                });
                // // Save screenshot to agent state
                // agent.setState({ 
                //     ...agent.state, 
                //     latestScreenshot: parsedMessage.data
                // });
                // Update database with screenshot
                agent.saveScreenshotToDatabase(parsedMessage_1.data).catch(function (error) {
                    logger.error('Error saving screenshot to database:', error);
                });
                logger.info("Screenshot saved to state and database update initiated.");
                break;
            case constants_1.WebSocketMessageRequests.STOP_GENERATION:
                // Clear shouldBeGenerating flag when user manually stops
                logger.info('Stopping code generation and clearing shouldBeGenerating flag');
                agent.setState(__assign(__assign({}, agent.state), { shouldBeGenerating: false }));
                // If there's an active generation, we should signal it to stop
                // (This depends on how the generation process is implemented)
                agent.isGenerating = false;
                sendToConnection(connection, constants_1.WebSocketMessageResponses.GENERATION_STOPPED, {
                    message: 'Code generation stopped by user'
                });
                break;
            case constants_1.WebSocketMessageRequests.RESUME_GENERATION:
                // Set shouldBeGenerating and restart generation
                logger.info('Resuming code generation');
                agent.setState(__assign(__assign({}, agent.state), { shouldBeGenerating: true }));
                if (!agent.isGenerating) {
                    sendToConnection(connection, constants_1.WebSocketMessageResponses.GENERATION_RESUMED, {
                        message: 'Code generation resumed'
                    });
                    agent.generateAllFiles().catch(function (error) {
                        logger.error('Error resuming code generation:', error);
                        sendError(connection, "Error resuming generation: ".concat(error instanceof Error ? error.message : String(error)));
                    });
                }
                else {
                    // sendToConnection(connection, WebSocketMessageResponses.GENERATION_STARTED, {
                    //     message: 'Code generation is already in progress'
                    // });
                }
                break;
            case constants_1.WebSocketMessageRequests.GITHUB_EXPORT:
                // DEPRECATED: WebSocket-based GitHub export replaced with OAuth flow
                // GitHub Apps require OAuth user access tokens for user repository creation
                sendToConnection(connection, constants_1.WebSocketMessageResponses.GITHUB_EXPORT_ERROR, {
                    message: 'GitHub export via WebSocket is deprecated',
                    error: 'Please use the GitHub export button which will redirect you to authorize with GitHub OAuth'
                });
                break;
            case constants_1.WebSocketMessageRequests.USER_SUGGESTION:
                // Handle user suggestion for conversational AI
                logger.info('Received user suggestion', {
                    messageLength: ((_a = parsedMessage_1.message) === null || _a === void 0 ? void 0 : _a.length) || 0
                });
                if (!parsedMessage_1.message) {
                    sendError(connection, 'No message provided in user suggestion');
                    return;
                }
                agent.handleUserInput(parsedMessage_1.message).catch(function (error) {
                    logger.error('Error handling user suggestion:', error);
                    sendError(connection, "Error processing user suggestion: ".concat(error instanceof Error ? error.message : String(error)));
                });
                break;
            case constants_1.WebSocketMessageRequests.GET_MODEL_CONFIGS:
                logger.info('Fetching model configurations');
                agent.getModelConfigsInfo().then(function (configsInfo) {
                    sendToConnection(connection, constants_1.WebSocketMessageResponses.MODEL_CONFIGS_INFO, {
                        message: 'Model configurations retrieved',
                        configs: configsInfo
                    });
                }).catch(function (error) {
                    logger.error('Error fetching model configs:', error);
                    sendError(connection, "Error fetching model configurations: ".concat(error instanceof Error ? error.message : String(error)));
                });
                break;
            // Disabled it for now
            // case WebSocketMessageRequests.TERMINAL_COMMAND:
            //     // Handle terminal command execution
            //     logger.info('Received terminal command', {
            //         command: parsedMessage.command,
            //         timestamp: parsedMessage.timestamp
            //     });
            //     if (!parsedMessage.command) {
            //         sendError(connection, 'No command provided');
            //         return;
            //     }
            //     // Execute terminal command  
            //     agent.executeTerminalCommand(parsedMessage.command, connection as any)
            //         .catch((error: unknown) => {
            //             logger.error('Error executing terminal command:', error);
            //             sendToConnection(connection, WebSocketMessageResponses.TERMINAL_OUTPUT, {
            //                 output: `Error: ${error instanceof Error ? error.message : String(error)}`,
            //                 outputType: 'stderr' as const,
            //                 timestamp: Date.now()
            //             });
            //         });
            //     break;
            default:
                sendError(connection, "Unknown message type: ".concat(parsedMessage_1.type));
        }
    }
    catch (error) {
        logger.error('Error processing WebSocket message:', error);
        sendError(connection, "Error processing message: ".concat(error instanceof Error ? error.message : String(error)));
    }
}
function handleWebSocketClose(connection) {
    logger.info("WebSocket connection closed: ".concat(connection.id));
}
function broadcastToConnections(agent, type, data) {
    var connections = agent.getWebSockets();
    for (var _i = 0, connections_1 = connections; _i < connections_1.length; _i++) {
        var connection = connections_1[_i];
        sendToConnection(connection, type, data);
    }
}
function sendToConnection(connection, type, data) {
    try {
        var message = __assign({ type: type }, data);
        connection.send(JSON.stringify(message));
    }
    catch (error) {
        console.error("Error sending message to connection ".concat(connection.url, ":"), error);
    }
}
function sendError(connection, errorMessage) {
    sendToConnection(connection, 'error', { error: errorMessage });
}
