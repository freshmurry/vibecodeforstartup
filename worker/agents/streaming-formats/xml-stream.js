"use strict";
/**
 * General Purpose XML Streaming Format
 * Robust streaming parser for any XML structure with LLM error resilience
 * Extends the proven streaming infrastructure from SCOF format
 */
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
exports.XmlStreamFormat = void 0;
exports.createXmlStreamParser = createXmlStreamParser;
exports.parseXmlString = parseXmlString;
var base_1 = require("./base");
/**
 * XmlStreamFormat - General purpose XML streaming parser
 * Uses the same reliability patterns as SCOF format for robust chunk handling
 */
var XmlStreamFormat = /** @class */ (function (_super) {
    __extends(XmlStreamFormat, _super);
    function XmlStreamFormat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    XmlStreamFormat.prototype.parseStreamingChunks = function (_chunk, state, _onFileOpen, _onFileChunk, _onFileClose) {
        // This method is required by the abstract class but not used for XML parsing
        // The actual XML parsing is done via parseXmlStream method
        return state;
    };
    XmlStreamFormat.prototype.serialize = function (_files) {
        // Not directly applicable for XML format
        return '';
    };
    XmlStreamFormat.prototype.deserialize = function (_serialized) {
        // Not directly applicable for XML format
        return [];
    };
    XmlStreamFormat.prototype.formatInstructions = function () {
        return "\n<XML OUTPUT FORMAT>\nStructure your response using well-formed XML:\n\n<element_name>\n[Content here]\n</element_name>\n\n<another_element attribute=\"value\">\n[More content]\n</another_element>\n\nIMPORTANT:\n- Use proper XML formatting with matching opening/closing tags\n- Attributes should be quoted with double quotes\n- Content can span multiple lines\n- Nested elements are supported\n- Self-closing tags: <element />\n</XML OUTPUT FORMAT>\n";
    };
    /**
     * Parse XML stream with robust error handling and fallback
     */
    XmlStreamFormat.prototype.parseXmlStream = function (chunk, state, callbacks, config) {
        if (config === void 0) { config = {}; }
        // Initialize state if null or corrupted
        var workingState;
        if (!state || !this.isValidXmlState(state)) {
            workingState = this.initializeXmlState(config);
        }
        else {
            workingState = state;
        }
        // Add chunk to both content buffer and raw XML buffer
        workingState.contentBuffer += chunk;
        workingState.rawXmlBuffer += chunk;
        // Process the accumulated content
        this.processXmlContent(workingState, callbacks);
        return workingState;
    };
    /**
     * Finalize XML parsing and return all extracted elements
     */
    XmlStreamFormat.prototype.finalizeXmlParsing = function (state) {
        // Try final parsing attempt on remaining buffer
        if (state.contentBuffer.length > 0) {
            this.attemptFallbackExtraction(state);
        }
        return state.extractedElements;
    };
    /**
     * Get specific element by tag name (returns first match)
     */
    XmlStreamFormat.prototype.getElement = function (state, tagName) {
        var elements = state.extractedElements.get(tagName.toLowerCase());
        return elements && elements.length > 0 ? elements[0] : null;
    };
    /**
     * Get all elements by tag name
     */
    XmlStreamFormat.prototype.getElements = function (state, tagName) {
        return state.extractedElements.get(tagName.toLowerCase()) || [];
    };
    XmlStreamFormat.prototype.isValidXmlState = function (state) {
        return state &&
            typeof state.xmlParserState === 'string' &&
            Array.isArray(state.elementStack) &&
            state.extractedElements instanceof Map &&
            state.targetElements instanceof Set &&
            typeof state.contentBuffer === 'string' &&
            Array.isArray(state.errorMessages);
    };
    XmlStreamFormat.prototype.initializeXmlState = function (config) {
        return {
            // Base parsing state (required by interface)
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
            extractedInstallCommands: [],
            // XML-specific state
            xmlParserState: 'seeking_element',
            elementStack: [],
            currentElement: null,
            extractedElements: new Map(),
            potentialTagBuffer: '',
            targetElements: new Set((config.targetElements || []).map(function (t) { return config.caseSensitive ? t : t.toLowerCase(); })),
            streamingElements: new Set((config.streamingElements || []).map(function (t) { return config.caseSensitive ? t : t.toLowerCase(); })),
            hasParsingErrors: false,
            errorMessages: [],
            rawXmlBuffer: ''
        };
    };
    XmlStreamFormat.prototype.processXmlContent = function (state, callbacks) {
        var changed = true;
        var iterations = 0;
        var maxIterations = 1000; // Prevent infinite loops
        // Process buffer until no more changes or max iterations
        while (changed && state.xmlParserState !== 'complete' && iterations < maxIterations) {
            changed = false;
            iterations++;
            try {
                // Look for XML tags in the buffer
                var tagMatch = this.findNextXmlTag(state.contentBuffer);
                if (tagMatch) {
                    changed = this.processXmlTag(tagMatch, state, callbacks);
                }
                else {
                    // No complete tags found, handle partial content
                    this.handlePartialContent(state, callbacks);
                    break;
                }
            }
            catch (error) {
                this.handleParsingError(state, "XML processing error: ".concat(error instanceof Error ? error.message : 'Unknown error'), callbacks);
                break;
            }
        }
        // Prevent buffer from growing too large
        if (state.contentBuffer.length > state.maxBufferSize || 10000) {
            // Keep last portion in case we have partial tags
            var keepSize = Math.min(2000, state.contentBuffer.length);
            state.contentBuffer = state.contentBuffer.substring(state.contentBuffer.length - keepSize);
        }
    };
    XmlStreamFormat.prototype.findNextXmlTag = function (buffer) {
        // Regex for XML tags (opening, closing, or self-closing)
        var xmlTagRegex = /<\/?([a-zA-Z_][a-zA-Z0-9_-]*)[^>]*\/?>/;
        var match = buffer.match(xmlTagRegex);
        if (!match)
            return null;
        var fullMatch = match[0];
        var tagName = match[1];
        var index = match.index;
        // Determine tag type
        var type;
        if (fullMatch.startsWith('</')) {
            type = 'closing';
        }
        else if (fullMatch.endsWith('/>')) {
            type = 'self-closing';
        }
        else {
            type = 'opening';
        }
        // Extract attributes (simple implementation)
        var attributes = this.extractAttributes(fullMatch);
        return { type: type, tagName: tagName, attributes: attributes, fullMatch: fullMatch, index: index };
    };
    XmlStreamFormat.prototype.extractAttributes = function (tagString) {
        var attributes = {};
        // Simple attribute extraction (handles most cases)
        var attrRegex = /([a-zA-Z_][a-zA-Z0-9_-]*)\s*=\s*["']([^"']*)["']/g;
        var match;
        while ((match = attrRegex.exec(tagString)) !== null) {
            attributes[match[1]] = match[2];
        }
        return attributes;
    };
    XmlStreamFormat.prototype.processXmlTag = function (tagMatch, state, callbacks) {
        var type = tagMatch.type, tagName = tagMatch.tagName, attributes = tagMatch.attributes, fullMatch = tagMatch.fullMatch, index = tagMatch.index;
        // Extract content before this tag
        var contentBefore = state.contentBuffer.substring(0, index);
        if (contentBefore && state.currentElement) {
            this.addContentToCurrentElement(state, contentBefore, callbacks);
        }
        // Remove processed content from buffer
        state.contentBuffer = state.contentBuffer.substring(index + fullMatch.length);
        if (type === 'opening') {
            return this.handleOpeningTag(tagName, attributes, state, callbacks);
        }
        else if (type === 'closing') {
            return this.handleClosingTag(tagName, state, callbacks);
        }
        else if (type === 'self-closing') {
            return this.handleSelfClosingTag(tagName, attributes, state, callbacks);
        }
        return false;
    };
    XmlStreamFormat.prototype.handleOpeningTag = function (tagName, attributes, state, callbacks) {
        // Create new element
        var element = {
            tagName: tagName,
            attributes: attributes,
            content: '',
            isComplete: false,
            children: []
        };
        // Add to parent element if we have one
        if (state.currentElement) {
            state.currentElement.children.push(element);
        }
        // Push to stack and set as current
        state.elementStack.push(element);
        state.currentElement = element;
        // Call callback if configured
        if (callbacks.onElementStart) {
            callbacks.onElementStart(element);
        }
        return true;
    };
    XmlStreamFormat.prototype.handleClosingTag = function (tagName, state, callbacks) {
        var normalizedTagName = tagName.toLowerCase();
        if (!state.currentElement) {
            this.handleParsingError(state, "Unexpected closing tag: ".concat(tagName), callbacks);
            return false;
        }
        // Verify tag matching (case insensitive)
        if (state.currentElement.tagName.toLowerCase() !== normalizedTagName) {
            this.handleParsingError(state, "Mismatched closing tag: expected ".concat(state.currentElement.tagName, ", got ").concat(tagName), callbacks);
            return false;
        }
        // Mark element as complete
        state.currentElement.isComplete = true;
        // Mark streaming as complete (don't re-stream content, just mark complete)
        if (state.streamingElements.has(normalizedTagName) && callbacks.onElementContent) {
            callbacks.onElementContent(tagName, '', true);
        }
        // Store completed element
        this.storeElement(state, state.currentElement);
        // Call completion callback
        if (callbacks.onElementComplete) {
            callbacks.onElementComplete(state.currentElement);
        }
        // Pop from stack
        state.elementStack.pop();
        state.currentElement = state.elementStack.length > 0 ? state.elementStack[state.elementStack.length - 1] : null;
        return true;
    };
    XmlStreamFormat.prototype.handleSelfClosingTag = function (tagName, attributes, state, callbacks) {
        // Create complete element
        var element = {
            tagName: tagName,
            attributes: attributes,
            content: '',
            isComplete: true,
            children: []
        };
        // Add to parent if we have one
        if (state.currentElement) {
            state.currentElement.children.push(element);
        }
        // Store element
        this.storeElement(state, element);
        // Call callbacks
        if (callbacks.onElementStart) {
            callbacks.onElementStart(element);
        }
        if (callbacks.onElementComplete) {
            callbacks.onElementComplete(element);
        }
        return true;
    };
    XmlStreamFormat.prototype.addContentToCurrentElement = function (state, content, callbacks) {
        if (!state.currentElement || !content)
            return;
        // Add content to current element
        state.currentElement.content += content;
        // Stream content if configured
        var normalizedTagName = state.currentElement.tagName.toLowerCase();
        if (state.streamingElements.has(normalizedTagName) && callbacks.onElementContent) {
            callbacks.onElementContent(state.currentElement.tagName, content, false);
        }
    };
    XmlStreamFormat.prototype.handlePartialContent = function (state, callbacks) {
        // If we have a current element and significant content, it might be partial content
        if (state.currentElement && state.contentBuffer.length > 50) {
            // Check if buffer might end with partial tag
            var hasPartialTag = state.contentBuffer.includes('<');
            if (!hasPartialTag) {
                // Safe to process all content
                this.addContentToCurrentElement(state, state.contentBuffer, callbacks);
                state.contentBuffer = '';
            }
            else {
                // Process content before the last '<' character
                var lastTagIndex = state.contentBuffer.lastIndexOf('<');
                if (lastTagIndex > 0) {
                    var safeContent = state.contentBuffer.substring(0, lastTagIndex);
                    this.addContentToCurrentElement(state, safeContent, callbacks);
                    state.contentBuffer = state.contentBuffer.substring(lastTagIndex);
                }
            }
        }
    };
    XmlStreamFormat.prototype.storeElement = function (state, element) {
        var normalizedTagName = element.tagName.toLowerCase();
        // Store if it's a target element or if no targets specified
        if (state.targetElements.size === 0 || state.targetElements.has(normalizedTagName)) {
            if (!state.extractedElements.has(normalizedTagName)) {
                state.extractedElements.set(normalizedTagName, []);
            }
            state.extractedElements.get(normalizedTagName).push(element);
        }
    };
    XmlStreamFormat.prototype.handleParsingError = function (state, error, callbacks) {
        state.hasParsingErrors = true;
        state.errorMessages.push(error);
        if (callbacks.onParsingError) {
            callbacks.onParsingError(error);
        }
        // Try fallback extraction
        this.attemptFallbackExtraction(state);
    };
    XmlStreamFormat.prototype.attemptFallbackExtraction = function (state) {
        try {
            // Try to extract elements using lenient regex
            for (var _i = 0, _a = state.targetElements; _i < _a.length; _i++) {
                var targetElement = _a[_i];
                if (!state.extractedElements.has(targetElement)) {
                    var regex = new RegExp("<".concat(targetElement, "[^>]*>(.*?)(?:<\\/").concat(targetElement, ">|$)"), 'is');
                    var match = state.rawXmlBuffer.match(regex);
                    if (match) {
                        var element = {
                            tagName: targetElement,
                            attributes: {},
                            content: match[1].trim(),
                            isComplete: true,
                            children: []
                        };
                        state.extractedElements.set(targetElement, [element]);
                    }
                }
            }
        }
        catch (error) {
            console.warn('Fallback XML extraction failed:', error);
        }
    };
    return XmlStreamFormat;
}(base_1.CodeGenerationFormat));
exports.XmlStreamFormat = XmlStreamFormat;
/**
 * Utility function to create XML stream parser
 */
function createXmlStreamParser(_config) {
    return new XmlStreamFormat();
}
/**
 * Utility function to parse complete XML string
 */
function parseXmlString(xmlString, config) {
    var parser = new XmlStreamFormat();
    var state = parser.initializeXmlState(config || {});
    parser.parseXmlStream(xmlString, state, {}, config);
    return parser.finalizeXmlParsing(state);
}
