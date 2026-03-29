"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCommands = extractCommands;
exports.looksLikeCommand = looksLikeCommand;
function extractCommands(rawOutput, onlyInstallCommands) {
    if (onlyInstallCommands === void 0) { onlyInstallCommands = false; }
    var commands = [];
    // Helper function to check if command is an install command
    var isInstallCommand = function (command) {
        return /^(?:npm|yarn|pnpm|bun)\s+(?:install|add)(?:\s|$)/.test(command);
    };
    // Extract commands from code blocks (with or without language indicators)
    // Handles: ```bash, ```sh, ```, ``` command, etc.
    var codeBlockRegex = /```(?:[a-zA-Z]*)?\s*\n?([\s\S]*?)\n?```/gi;
    var codeBlockMatch;
    while ((codeBlockMatch = codeBlockRegex.exec(rawOutput)) !== null) {
        var blockContent = codeBlockMatch[1].trim();
        // Split by newlines and filter out empty lines and comments
        var blockCommands = blockContent
            .split('\n')
            .map(function (line) { return line.trim(); })
            .filter(function (line) {
            return line && !line.startsWith('#') && !line.startsWith('//');
        })
            .map(function (line) {
            // Remove shell prompts like $ or >
            return line.replace(/^[$>]\s*/, '');
        })
            .filter(function (line) {
            // Filter by install commands if onlyInstallCommands is true
            return !onlyInstallCommands || isInstallCommand(line);
        });
        commands.push.apply(commands, blockCommands);
    }
    // Extract inline commands (wrapped in backticks)
    var inlineCommandRegex = /`([^`\n]+)`/g;
    var inlineMatch;
    while ((inlineMatch = inlineCommandRegex.exec(rawOutput)) !== null) {
        var command = inlineMatch[1].trim();
        // Only include if it looks like a command and matches install filter if needed
        if (looksLikeCommand(command)) {
            if (!onlyInstallCommands || isInstallCommand(command)) {
                commands.push(command);
            }
        }
    }
    // Define command patterns based on whether we only want install commands
    var commandPatterns;
    if (onlyInstallCommands) {
        // Only include package manager install/add commands
        commandPatterns = [
            /(?:^|\s)((?:npm|yarn|pnpm|bun)\s+(?:install|add)(?:\s+[^\n]+)?)/gm,
        ];
    }
    else {
        // Include all command patterns
        commandPatterns = [
            // Package managers
            /(?:^|\s)((?:npm|yarn|pnpm|bun)\s+(?:install|add|run|build|start|dev|test)(?:\s+[^\n]+)?)/gm,
            // Directory operations
            /(?:^|\s)(mkdir\s+[^\n]+)/gm,
            /(?:^|\s)(cd\s+[^\n]+)/gm,
            // File operations
            /(?:^|\s)(touch\s+[^\n]+)/gm,
            /(?:^|\s)(cp\s+[^\n]+)/gm,
            /(?:^|\s)(mv\s+[^\n]+)/gm,
            // Git commands
            /(?:^|\s)(git\s+(?:init|clone|add|commit|push|pull)(?:\s+[^\n]+)?)/gm,
            // Build tools
            /(?:^|\s)((?:make|cmake|gradle|mvn)\s+[^\n]+)/gm,
            // Environment setup
            /(?:^|\s)(export\s+[^\n]+)/gm,
            /(?:^|\s)(source\s+[^\n]+)/gm,
        ];
    }
    // Extract commands using the appropriate patterns
    for (var _i = 0, commandPatterns_1 = commandPatterns; _i < commandPatterns_1.length; _i++) {
        var pattern = commandPatterns_1[_i];
        var match = void 0;
        while ((match = pattern.exec(rawOutput)) !== null) {
            var command = match[1].trim();
            if (command && !commands.includes(command)) {
                commands.push(command);
            }
        }
    }
    // Filter commands if onlyInstallCommands is true
    var filteredCommands = __spreadArray([], new Set(commands), true);
    if (onlyInstallCommands) {
        // Filter to only keep package manager install/add commands
        filteredCommands = filteredCommands.filter(function (command) {
            return /^(?:npm|yarn|pnpm|bun)\s+(?:install|add)(?:\s|$)/.test(command);
        });
    }
    return filteredCommands;
}
function looksLikeCommand(text) {
    // Check if the text looks like a shell command
    var commandIndicators = [
        /^(?:npm|yarn|pnpm|bun|node|deno)\s/,
        /^(?:mkdir|cd|touch|cp|mv|rm|ls|cat|grep|find)\s/,
        /^(?:git|svn|hg)\s/,
        /^(?:make|cmake|gcc|clang)\s/,
        /^(?:docker|podman)\s/,
        /^(?:curl|wget)\s/,
        /^(?:python|pip|conda)\s/,
        /^(?:ruby|gem|bundle)\s/,
        /^(?:go|cargo|rustc)\s/,
        /^(?:java|javac|mvn|gradle)\s/,
        /^(?:php|composer)\s/,
        /^(?:export|source|alias)\s/,
    ];
    return commandIndicators.some(function (pattern) { return pattern.test(text); });
}
