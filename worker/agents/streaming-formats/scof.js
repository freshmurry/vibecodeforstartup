"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCOFFormat = void 0;
var base_1 = require("./base");
var udiff_1 = require("../diff-formats/udiff");
var common_1 = require("../utils/common");
/**
 * SCOF (Shell Command Output Format) implementation with robust chunk handling
 * Handles arbitrary chunk boundaries, mixed formats, and ensures single callback calls per file
 */
var SCOFFormat = /** @class */ (function (_super) {
    __extends(SCOFFormat, _super);
    function SCOFFormat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SCOFFormat.prototype.parseStreamingChunks = function (chunk, state, onFileOpen, onFileChunk, onFileClose) {
        // Initialize SCOF-specific parsing state if not present or corrupted
        if (!state.parsingState || !this.isValidSCOFState(state.parsingState)) {
            state.parsingState = this.initializeSCOFState();
        }
        var scofState = state.parsingState;
        // Add new chunk to accumulator
        state.accumulator += chunk;
        // Process the accumulated content with robust chunk handling
        this.processAccumulatedContent(state, scofState, onFileOpen, onFileChunk, onFileClose);
        return state;
    };
    SCOFFormat.prototype.isValidSCOFState = function (parsingState) {
        return parsingState &&
            typeof parsingState.currentMode === 'string' &&
            parsingState.openedFiles instanceof Set &&
            parsingState.closedFiles instanceof Set &&
            typeof parsingState.contentBuffer === 'string' &&
            typeof parsingState.partialLineBuffer === 'string';
    };
    SCOFFormat.prototype.initializeSCOFState = function () {
        return {
            currentMode: 'idle',
            currentFile: null,
            currentFileFormat: null,
            contentBuffer: '',
            eofMarker: null,
            insideEofBlock: false,
            openedFiles: new Set(),
            closedFiles: new Set(),
            partialLineBuffer: '',
            commandBuffer: '',
            parsingMultiLineCommand: false,
            potentialEofBuffer: '',
            tailBuffer: '',
            lastChunkEndedWithNewline: false,
            betweenFilesBuffer: '',
            extractedInstallCommands: []
        };
    };
    SCOFFormat.prototype.processAccumulatedContent = function (state, scofState, onFileOpen, onFileChunk, onFileClose) {
        // Combine any partial line from previous chunk with new content
        var fullContent = scofState.partialLineBuffer + state.accumulator;
        // Split into lines, keeping track of whether the last line is complete
        var lines = fullContent.split('\n');
        var lastLineComplete = state.accumulator.endsWith('\n');
        // Process complete lines
        var linesToProcess = lastLineComplete ? lines : lines.slice(0, -1);
        for (var i = 0; i < linesToProcess.length; i++) {
            var line = linesToProcess[i];
            this.processLine(line, scofState, onFileOpen, onFileChunk, onFileClose, state);
        }
        // Handle the last incomplete line
        if (!lastLineComplete && lines.length > 0) {
            var lastLine = lines[lines.length - 1];
            // Check if the partial line might be an EOF marker
            if (scofState.insideEofBlock && scofState.eofMarker && lastLine.trim() === scofState.eofMarker) {
                // This is a complete EOF marker, process it
                this.processLine(lastLine, scofState, onFileOpen, onFileChunk, onFileClose, state);
                scofState.partialLineBuffer = '';
            }
            else {
                // Store as partial line buffer for next chunk
                scofState.partialLineBuffer = lastLine;
            }
            state.accumulator = '';
        }
        else {
            scofState.partialLineBuffer = '';
            state.accumulator = '';
        }
        scofState.lastChunkEndedWithNewline = lastLineComplete;
    };
    SCOFFormat.prototype.processLine = function (line, scofState, onFileOpen, onFileChunk, onFileClose, state) {
        var trimmedLine = line.trim();
        // Check for EOF marker (end of content block)
        if (scofState.insideEofBlock && scofState.eofMarker) {
            // ENHANCED: Robust EOF detection with LLM error resilience
            if (this.isEOFMarker(line, scofState.eofMarker)) {
                this.finalizeCurrentFile(scofState, onFileClose, state);
                return;
            }
        }
        // Content line within EOF block
        if (scofState.insideEofBlock) {
            // ENHANCED: Handle nested EOF-like patterns in content
            if (scofState.currentFile && scofState.currentFileFormat) {
                // Check if this line looks like a command but we're inside content
                if (this.looksLikeCommand(line) && !this.isValidNestedCommand(line, scofState)) {
                    console.warn("SCOF: Detected command-like content inside EOF block: \"".concat(line.trim(), "\". Treating as content."));
                }
                // Add line to content buffer with smart formatting
                this.addContentLine(line, scofState, onFileChunk);
            }
            return;
        }
        // Accumulate content between files for command extraction
        if (trimmedLine === '' || trimmedLine.startsWith('#')) {
            // Add content (including empty lines and comments) to between-files buffer
            scofState.betweenFilesBuffer += line + '\n';
            return;
        }
        // Process any accumulated content between files before handling new command
        if (scofState.betweenFilesBuffer.trim()) {
            this.processAccumulatedBetweenFilesContent(scofState);
        }
        // Also accumulate non-empty, non-comment lines that aren't commands
        // This ensures we capture all potential command content between SCOF blocks
        var isCommand = this.tryParseCommand(trimmedLine) !== null;
        if (!isCommand) {
            scofState.betweenFilesBuffer += line + '\n';
        }
        // Try to parse command from current line first
        var command = this.tryParseCommand(trimmedLine);
        if (command) {
            this.handleCommand(command, scofState, onFileOpen);
            scofState.commandBuffer = '';
            scofState.parsingMultiLineCommand = false;
            return;
        }
        // Handle potential multi-line commands
        if (scofState.parsingMultiLineCommand) {
            scofState.commandBuffer += ' ' + trimmedLine;
            // Try to parse complete command
            var multiLineCommand = this.tryParseCommand(scofState.commandBuffer);
            if (multiLineCommand) {
                this.handleCommand(multiLineCommand, scofState, onFileOpen);
                scofState.commandBuffer = '';
                scofState.parsingMultiLineCommand = false;
            }
        }
        else if (trimmedLine.includes('cat')) {
            scofState.commandBuffer = trimmedLine;
            scofState.parsingMultiLineCommand = true;
            // Try immediate parsing in case it's a complete command
            var immediateCommand = this.tryParseCommand(scofState.commandBuffer);
            if (immediateCommand) {
                this.handleCommand(immediateCommand, scofState, onFileOpen);
                scofState.commandBuffer = '';
                scofState.parsingMultiLineCommand = false;
            }
        }
    };
    SCOFFormat.prototype.tryParseCommand = function (commandStr) {
        // ENHANCED: Normalize command with specific LLM error resilience
        var normalizedCommand = this.normalizeCommand(commandStr);
        // ENHANCED: Try file creation with comprehensive LLM error patterns
        var fileCreationResult = this.tryParseFileCreation(normalizedCommand);
        if (fileCreationResult)
            return fileCreationResult;
        // ENHANCED: Try diff patch with comprehensive LLM error patterns
        var diffPatchResult = this.tryParseDiffPatch(normalizedCommand);
        if (diffPatchResult)
            return diffPatchResult;
        return null;
    };
    /**
     * ENHANCED: Normalize command string to handle specific LLM mistakes
     */
    SCOFFormat.prototype.normalizeCommand = function (commandStr) {
        var normalized = commandStr;
        // Fix case sensitivity (common LLM mistake)
        normalized = normalized.replace(/\bCAT\b/gi, 'cat');
        normalized = normalized.replace(/\bCat\b/g, 'cat');
        // Normalize excessive whitespace (LLMs often add extra spaces)
        normalized = normalized.replace(/\s+/g, ' ').trim();
        // Fix missing spaces around operators (cat>file instead of cat > file)
        normalized = normalized.replace(/cat>/gi, 'cat >');
        normalized = normalized.replace(/>\s*([^<\s])/g, '> $1');
        normalized = normalized.replace(/<<\s*([^|\s])/g, '<< $1');
        normalized = normalized.replace(/\|\s*patch/gi, ' | patch');
        // Fix heredoc spacing variations
        normalized = normalized.replace(/<<\s*'([^']+)'\s*/g, " << '$1' ");
        normalized = normalized.replace(/<<\s*"([^"]+)"\s*/g, ' << "$1" ');
        normalized = normalized.replace(/<<\s*([^\s|'"]+)\s*/g, " << '$1' ");
        return normalized;
    };
    /**
     * ENHANCED: Parse file creation commands with LLM error resilience
     */
    SCOFFormat.prototype.tryParseFileCreation = function (command) {
        // Pattern 1: Quoted filenames (handles spaces and special chars)
        var quotedPatterns = [
            /cat\s*>\s*"([^"]+)"\s*<<\s*'([^']+)'/i, // cat > "file name.js" << 'EOF'
            /cat\s*>\s*'([^']+)'\s*<<\s*'([^']+)'/i, // cat > 'file name.js' << 'EOF'
            /cat\s*>\s*"([^"]+)"\s*<<\s*"([^"]+)"/i, // cat > "file.js" << "EOF"
            /cat\s*>\s*'([^']+)'\s*<<\s*"([^"]+)"/i, // cat > 'file.js' << "EOF"
        ];
        for (var _i = 0, quotedPatterns_1 = quotedPatterns; _i < quotedPatterns_1.length; _i++) {
            var pattern = quotedPatterns_1[_i];
            var match = command.match(pattern);
            if (match) {
                return {
                    type: 'file_creation',
                    filePath: match[1],
                    eofMarker: match[2]
                };
            }
        }
        // Pattern 2: ENHANCED - Handle mismatched quotes (common LLM mistake)
        var mismatchedQuotePatterns = [
            /cat\s*>\s*"([^"']+)'\s*<<\s*'([^']+)'/i, // cat > "file.js' << 'EOF'
            /cat\s*>\s*'([^"']+)"\s*<<\s*'([^']+)'/i, // cat > 'file.js" << 'EOF'
            /cat\s*>\s*"([^"']+)'\s*<<\s*"([^"]+)'/i, // cat > "file.js" << "EOF'
            /cat\s*>\s*'([^"']+)"\s*<<\s*'([^']+)"/i, // cat > 'file.js' << 'EOF"
            /cat\s*>\s*([^\s<"']+)\s*<<\s*"([^"]+)'/i, // cat > file.js << "EOF'
            /cat\s*>\s*([^\s<"']+)\s*<<\s*'([^']+)"/i, // cat > file.js << 'EOF"
        ];
        for (var _a = 0, mismatchedQuotePatterns_1 = mismatchedQuotePatterns; _a < mismatchedQuotePatterns_1.length; _a++) {
            var pattern = mismatchedQuotePatterns_1[_a];
            var match = command.match(pattern);
            if (match) {
                var filename = match[1];
                var eofMarker = match[2];
                console.warn("SCOF: Auto-correcting mismatched quotes in filename: \"".concat(filename, "\""));
                return {
                    type: 'file_creation',
                    filePath: filename,
                    eofMarker: eofMarker
                };
            }
        }
        // Pattern 3: Unquoted filenames (no spaces, simpler cases)
        var unquotedPatterns = [
            /cat\s*>\s*([^\s<"']+)\s*<<\s*'([^']+)'/i, // cat > file.js << 'EOF'
            /cat\s*>\s*([^\s<"']+)\s*<<\s*"([^"]+)"/i, // cat > file.js << "EOF"
            /cat\s*>\s*([^\s|"']+)\s*<<\s*([^\s|]+)/i, // cat > file.js << EOF
        ];
        for (var _b = 0, unquotedPatterns_1 = unquotedPatterns; _b < unquotedPatterns_1.length; _b++) {
            var pattern = unquotedPatterns_1[_b];
            var match = command.match(pattern);
            if (match) {
                return {
                    type: 'file_creation',
                    filePath: match[1],
                    eofMarker: match[2]
                };
            }
        }
        // Pattern 4: Handle LLM mistakes with spaces in unquoted filenames
        var spacedFilenameMatch = command.match(/cat\s*>\s*([^<]+?)\s*<<\s*([^\s|]+)/i);
        if (spacedFilenameMatch) {
            var rawFilename = spacedFilenameMatch[1].trim();
            var eofMarker = spacedFilenameMatch[2].replace(/['"]/g, '');
            // If filename has spaces but no quotes, this is likely an LLM mistake
            // Try to recover by assuming the entire string before << is the filename
            if (rawFilename.includes(' ') && !rawFilename.match(/^["'].*["']$/)) {
                console.warn("SCOF: Detected unquoted filename with spaces: \"".concat(rawFilename, "\". Auto-correcting."));
                return {
                    type: 'file_creation',
                    filePath: rawFilename,
                    eofMarker: eofMarker
                };
            }
        }
        return null;
    };
    /**
     * ENHANCED: Parse diff patch commands with LLM error resilience
     */
    SCOFFormat.prototype.tryParseDiffPatch = function (command) {
        // Pattern 1: Quoted filenames
        var quotedPatchPatterns = [
            /cat\s*<<\s*'([^']+)'\s*\|\s*patch\s+"([^"]+)"/i, // cat << 'EOF' | patch "file.js"
            /cat\s*<<\s*'([^']+)'\s*\|\s*patch\s+'([^']+)'/i, // cat << 'EOF' | patch 'file.js'
            /cat\s*<<\s*"([^"]+)"\s*\|\s*patch\s+"([^"]+)"/i, // cat << "EOF" | patch "file.js"
            /cat\s*<<\s*"([^"]+)"\s*\|\s*patch\s+'([^']+)'/i, // cat << "EOF" | patch 'file.js'
        ];
        for (var _i = 0, quotedPatchPatterns_1 = quotedPatchPatterns; _i < quotedPatchPatterns_1.length; _i++) {
            var pattern = quotedPatchPatterns_1[_i];
            var match = command.match(pattern);
            if (match) {
                return {
                    type: 'diff_patch',
                    filePath: match[2],
                    eofMarker: match[1]
                };
            }
        }
        // Pattern 2: Unquoted filenames
        var unquotedPatchPatterns = [
            /cat\s*<<\s*'([^']+)'\s*\|\s*patch\s+([^\s"']+)/i, // cat << 'EOF' | patch file.js
            /cat\s*<<\s*"([^"]+)"\s*\|\s*patch\s+([^\s"']+)/i, // cat << "EOF" | patch file.js
            /cat\s*<<\s*([^\s|'"]+)\s*\|\s*patch\s+([^\s"']+)/i, // cat << EOF | patch file.js (UNQUOTED)
        ];
        for (var _a = 0, unquotedPatchPatterns_1 = unquotedPatchPatterns; _a < unquotedPatchPatterns_1.length; _a++) {
            var pattern = unquotedPatchPatterns_1[_a];
            var match = command.match(pattern);
            if (match) {
                var eofMarker = match[1];
                var filePath = match[2];
                // Check if this is an unquoted malformed pattern
                if (!eofMarker.match(/^['"]/) && !filePath.match(/^['"]/)) {
                    console.warn("SCOF: Detected potentially malformed patch command. Auto-correcting: EOF=\"".concat(eofMarker, "\", file=\"").concat(filePath, "\""));
                }
                return {
                    type: 'diff_patch',
                    filePath: filePath,
                    eofMarker: eofMarker
                };
            }
        }
        // Pattern 3: ENHANCED - Handle malformed patch commands (common LLM mistake)
        var malformedPatchMatch = command.match(/cat\s*<<\s*([^|]+?)\s*\|\s*patch\s+(.+)/i);
        if (malformedPatchMatch) {
            var eofMarker = malformedPatchMatch[1].replace(/['"]/g, '').trim();
            var filePath = malformedPatchMatch[2].replace(/['"]/g, '').trim();
            // Enhanced detection: check if this looks like a legitimate patch command
            if (eofMarker && filePath && !eofMarker.includes(' ') && filePath.includes('.')) {
                console.warn("SCOF: Detected potentially malformed patch command. Auto-correcting: EOF=\"".concat(eofMarker, "\", file=\"").concat(filePath, "\""));
                return {
                    type: 'diff_patch',
                    filePath: filePath,
                    eofMarker: eofMarker
                };
            }
            else {
                // Handle basic malformed patterns
                console.warn("SCOF: Detected potentially malformed patch command. Auto-correcting: EOF=\"".concat(eofMarker, "\", file=\"").concat(filePath, "\""));
                return {
                    type: 'diff_patch',
                    filePath: filePath,
                    eofMarker: eofMarker
                };
            }
        }
        // Pattern 4: ENHANCED - Handle extremely malformed patch commands (spacing issues)
        var spacingIssueMatch = command.match(/cat\s*<<\s*([^\s|'"]+)\s*\|\s*patch\s+([^\s'"]+)/i);
        if (spacingIssueMatch) {
            var eofMarker = spacingIssueMatch[1];
            var filePath = spacingIssueMatch[2];
            console.warn("SCOF: Auto-correcting patch command spacing: EOF=\"".concat(eofMarker, "\", file=\"").concat(filePath, "\""));
            return {
                type: 'diff_patch',
                filePath: filePath,
                eofMarker: eofMarker
            };
        }
        return null;
    };
    SCOFFormat.prototype.handleCommand = function (command, scofState, onFileOpen) {
        var type = command.type, filePath = command.filePath, eofMarker = command.eofMarker;
        // Ensure we don't have overlapping file operations
        if (scofState.currentFile) {
            console.warn("Warning: Starting new file ".concat(filePath, " while ").concat(scofState.currentFile, " is still open"));
        }
        // Set up new file operation
        scofState.currentMode = type;
        scofState.currentFile = filePath;
        scofState.currentFileFormat = type === 'file_creation' ? 'full_content' : 'unified_diff';
        scofState.eofMarker = eofMarker;
        scofState.insideEofBlock = true;
        scofState.contentBuffer = '';
        // Call onFileOpen only once per file
        if (!scofState.openedFiles.has(filePath)) {
            scofState.openedFiles.add(filePath);
            onFileOpen(filePath);
        }
        else {
            // This should NEVER happen - log critical error if it does
            console.error("CRITICAL RELIABILITY ERROR: Attempted to open file ".concat(filePath, " twice"));
        }
        // Clear the file from the closedFiles set
        if (scofState.closedFiles.has(filePath)) {
            scofState.closedFiles.delete(filePath);
        }
    };
    SCOFFormat.prototype.finalizeCurrentFile = function (scofState, onFileClose, state) {
        if (!scofState.currentFile || !scofState.currentFileFormat) {
            return;
        }
        var filePath = scofState.currentFile;
        var finalContent = scofState.contentBuffer;
        // Apply diff if this is a diff patch operation
        if (scofState.currentMode === 'diff_patch') {
            var existingFile = state.completedFiles.get(filePath);
            var existingContent = (existingFile === null || existingFile === void 0 ? void 0 : existingFile.fileContents) || '';
            if (existingContent) {
                try {
                    finalContent = (0, udiff_1.applyDiff)(existingContent, finalContent);
                }
                catch (error) {
                    console.warn("Failed to apply diff to ".concat(filePath, ", using raw content:"), error);
                    // Fallback to raw content if diff application fails
                }
            }
        }
        // Store completed file with format information
        var fileObject = {
            filePath: filePath,
            fileContents: finalContent,
            format: scofState.currentFileFormat,
            filePurpose: '',
        };
        state.completedFiles.set(filePath, fileObject);
        // Call onFileClose only once per file, with comprehensive tracking
        if (!scofState.closedFiles.has(filePath)) {
            scofState.closedFiles.add(filePath);
            onFileClose(filePath);
        }
        else {
            // This should NEVER happen - log critical error if it does
            console.error("CRITICAL RELIABILITY ERROR: Attempted multiple file close for ".concat(filePath));
        }
        // Clear from openedFiles
        if (scofState.openedFiles.has(filePath)) {
            scofState.openedFiles.delete(filePath);
        }
        // Reset current file state
        scofState.currentMode = 'idle';
        scofState.currentFile = null;
        scofState.currentFileFormat = null;
        scofState.eofMarker = null;
        scofState.insideEofBlock = false;
        scofState.contentBuffer = '';
    };
    SCOFFormat.prototype.isEOFMarker = function (line, eofMarker) {
        // ENHANCED: Robust EOF detection with LLM error resilience
        return line.trim() === eofMarker;
    };
    SCOFFormat.prototype.looksLikeCommand = function (line) {
        // ENHANCED: Handle nested EOF-like patterns in content
        return line.includes('cat') || line.includes('patch');
    };
    SCOFFormat.prototype.isValidNestedCommand = function (line, scofState) {
        // ENHANCED: Handle nested EOF-like patterns in content
        return scofState.eofMarker ? line.includes(scofState.eofMarker) : false;
    };
    SCOFFormat.prototype.addContentLine = function (line, scofState, onFileChunk) {
        // ENHANCED: Handle nested EOF-like patterns in content
        if (scofState.currentFile && scofState.currentFileFormat) {
            // Add line to content buffer (preserve original line formatting)
            // Only add newline separator if we have existing content and this line isn't empty
            if (scofState.contentBuffer.length > 0 && !scofState.contentBuffer.endsWith('\n') && line.trim() !== '') {
                scofState.contentBuffer += '\n';
            }
            // Add the line content (don't add empty lines that are just whitespace)
            if (line.trim() !== '' || scofState.contentBuffer.length === 0) {
                scofState.contentBuffer += line;
            }
            // Send chunk callback with format information (only for non-empty content)
            if (line.trim() !== '') {
                onFileChunk(scofState.currentFile, line + '\n', scofState.currentFileFormat);
            }
        }
    };
    SCOFFormat.prototype.serialize = function (files) {
        var output = '';
        var formatAsComment = function (purpose) {
            // Replace all newlines with \n# 
            return "# File Purpose: ".concat(purpose.replace(/\n/g, '\n# '), "\n\n");
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            if (file.format === 'unified_diff') {
                output += "# Applying diff to file: ".concat(file.filePath, "\n");
                output += formatAsComment(file.filePurpose);
                output += "cat << 'EOF' | patch ".concat(file.filePath, "\n");
                output += file.fileContents;
                if (!file.fileContents.endsWith('\n')) {
                    output += '\n';
                }
                output += 'EOF\n\n';
            }
            else {
                // Default to full_content format
                output += "# Creating new file: ".concat(file.filePath, "\n");
                output += formatAsComment(file.filePurpose);
                output += "cat > ".concat(file.filePath, " << 'EOF'\n");
                output += file.fileContents;
                if (!file.fileContents.endsWith('\n')) {
                    output += '\n';
                }
                output += 'EOF\n\n';
            }
        }
        return output;
    };
    SCOFFormat.prototype.deserialize = function (serialized) {
        var state = {
            accumulator: '',
            completedFiles: new Map(),
            parsingState: this.initializeSCOFState()
        };
        // Process the entire serialized content
        this.parseStreamingChunks(serialized, state, function () { }, // onFileOpen
        function () { }, // onFileChunk  
        function () { } // onFileClose
        );
        // Convert completed files map to array
        return Array.from(state.completedFiles.values());
    };
    /**
     * Process accumulated content between SCOF file blocks to extract install commands
     */
    SCOFFormat.prototype.processAccumulatedBetweenFilesContent = function (scofState) {
        if (!scofState.betweenFilesBuffer.trim()) {
            return;
        }
        // Extract only install commands from the accumulated content
        var installCommands = (0, common_1.extractCommands)(scofState.betweenFilesBuffer, true);
        // Add unique install commands to the extracted commands array
        for (var _i = 0, installCommands_1 = installCommands; _i < installCommands_1.length; _i++) {
            var command = installCommands_1[_i];
            if (!scofState.extractedInstallCommands.includes(command)) {
                scofState.extractedInstallCommands.push(command);
            }
        }
        // Clear the buffer after processing
        scofState.betweenFilesBuffer = '';
    };
    SCOFFormat.prototype.formatInstructions = function () {
        return "\n<OUTPUT FORMAT>\nUse familiar shell patterns (using cat and pipes) for multi-file code generation:\n\nFILE CREATION as `full_content`:\n\n```\n# Optional: Add bash comments to explain the file contents just before the file creation\ncat > filename.ext << 'EOF'\n[file content here]\nEOF\n```\n\nDIFF PATCHES as `unified_diff`:\n\n```\n# Optional: Add bash comments to explain the diff contents just before the patch\ncat << 'EOF' | patch filename.ext\n[diff content here]\nEOF\n```\n\nYou may optionally suggest install commands if needed for any dependencies (only bun is available)\n\n```\n# Optional: Add bash comments to explain the install commands just before the install commands\n# Install well known compatible major versions or simply the latest rather than specific versions. Eg: bun install react react-dom\n# Do not suggest install commands for already installed dependencies\nbun install <dependencies>\n```\n\nIMPORTANT RULES:\n1. Command-line paths (cat > filename) ALWAYS override comment paths\n2. Use single quotes around EOF markers for consistency\n3. Ensure proper line endings and EOF markers\n4. Adhere to the above instructions for file creation and patching\n5. Each file can use consistently either full content OR unified diff depending on other instructions.\n6. Write multiple files in sequence, separated by newlines\n7. At the end of the output, there should always be a EOF marker\n8. Do not add any additional bash commands or instructions. This would be parsed by a custom parser, not by the shell. No commands are supported other than bun add/install\n</OUTPUT FORMAT>\n";
    };
    return SCOFFormat;
}(base_1.CodeGenerationFormat));
exports.SCOFFormat = SCOFFormat;
