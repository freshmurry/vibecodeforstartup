"use strict";
/**
 * Comprehensive tests for XmlStreamFormat
 * Tests streaming parsing, error handling, fallback logic, and edge cases
 */
Object.defineProperty(exports, "__esModule", { value: true });
var xml_stream_1 = require("./xml-stream");
describe('XmlStreamFormat', function () {
    var parser;
    var mockCallbacks;
    beforeEach(function () {
        parser = new xml_stream_1.XmlStreamFormat();
        mockCallbacks = {
            onElementStart: jest.fn(),
            onElementContent: jest.fn(),
            onElementComplete: jest.fn(),
            onParsingError: jest.fn(),
        };
    });
    describe('Basic XML Parsing', function () {
        test('should parse simple XML elements', function () {
            var xml = '<user_response>Hello world</user_response>';
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var userResponse = elements.get('user_response');
            expect(userResponse).toBeDefined();
            expect(userResponse[0].content).toBe('Hello world');
            expect(userResponse[0].isComplete).toBe(true);
        });
        test('should parse multiple elements', function () {
            var xml = "\n                <user_response>Response here</user_response>\n                <enhanced_user_request>Enhanced request</enhanced_user_request>\n            ";
            var config = { targetElements: ['user_response', 'enhanced_user_request'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')[0].content.trim()).toBe('Response here');
            expect(elements.get('enhanced_user_request')[0].content.trim()).toBe('Enhanced request');
        });
        test('should parse elements with attributes', function () {
            var xml = '<element id="123" class="test">Content</element>';
            var config = { targetElements: ['element'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var element = elements.get('element')[0];
            expect(element.attributes.id).toBe('123');
            expect(element.attributes.class).toBe('test');
            expect(element.content).toBe('Content');
        });
        test('should handle self-closing tags', function () {
            var xml = '<empty_element id="test" />';
            var config = { targetElements: ['empty_element'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var element = elements.get('empty_element')[0];
            expect(element.attributes.id).toBe('test');
            expect(element.content).toBe('');
            expect(element.isComplete).toBe(true);
        });
    });
    describe('Streaming Functionality', function () {
        test('should stream element content in real-time', function () {
            var config = {
                targetElements: ['user_response'],
                streamingElements: ['user_response']
            };
            var state = parser.initializeXmlState(config);
            // Stream opening tag and partial content
            state = parser.parseXmlStream('<user_response>Hello', state, mockCallbacks, config);
            expect(mockCallbacks.onElementContent).toHaveBeenCalledWith('user_response', 'Hello', false);
            // Stream more content
            state = parser.parseXmlStream(' world', state, mockCallbacks, config);
            expect(mockCallbacks.onElementContent).toHaveBeenCalledWith('user_response', ' world', false);
            // Stream closing tag
            state = parser.parseXmlStream('</user_response>', state, mockCallbacks, config);
            expect(mockCallbacks.onElementComplete).toHaveBeenCalled();
        });
        test('should handle chunked XML tags', function () {
            var config = { targetElements: ['test'] };
            var state = parser.initializeXmlState(config);
            // Tag split across chunks
            state = parser.parseXmlStream('<te', state, mockCallbacks, config);
            state = parser.parseXmlStream('st>Content</te', state, mockCallbacks, config);
            state = parser.parseXmlStream('st>', state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('test')[0].content).toBe('Content');
        });
        test('should handle large content chunks', function () {
            var largeContent = 'x'.repeat(5000);
            var xml = "<large_element>".concat(largeContent, "</large_element>");
            var config = { targetElements: ['large_element'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('large_element')[0].content).toBe(largeContent);
        });
    });
    describe('Error Handling and Fallback', function () {
        test('should handle malformed XML gracefully', function () {
            var malformedXml = '<user_response>Content without closing tag';
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(malformedXml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            // Should still extract content via fallback
            expect(elements.get('user_response')).toBeDefined();
            expect(state.hasParsingErrors).toBe(false); // Fallback handles this gracefully
        });
        test('should handle mismatched tags', function () {
            var mismatchedXml = '<user_response>Content</wrong_tag>';
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(mismatchedXml, state, mockCallbacks, config);
            expect(mockCallbacks.onParsingError).toHaveBeenCalled();
            expect(state.hasParsingErrors).toBe(true);
        });
        test('should handle empty input', function () {
            var config = { targetElements: ['test'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream('', state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.size).toBe(0);
            expect(state.hasParsingErrors).toBe(false);
        });
        test('should handle XML with no target elements', function () {
            var xml = '<other_element>Content</other_element>';
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')).toBeUndefined();
            expect(elements.get('other_element')).toBeUndefined();
        });
        test('should use fallback extraction for malformed content', function () {
            var malformedXml = '<user_response>Good content</user_response><enhanced_user_request>Also good';
            var config = { targetElements: ['user_response', 'enhanced_user_request'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(malformedXml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')[0].content).toBe('Good content');
            expect(elements.get('enhanced_user_request')[0].content).toBe('Also good');
        });
    });
    describe('Buffer Management', function () {
        test('should limit buffer size to prevent memory issues', function () {
            var hugeContent = 'x'.repeat(20000);
            var config = {
                targetElements: ['test'],
                maxBufferSize: 5000
            };
            var state = parser.initializeXmlState(config);
            // This should not cause memory issues
            state = parser.parseXmlStream(hugeContent, state, mockCallbacks, config);
            // Buffer should be limited
            expect(state.contentBuffer.length).toBeLessThan(15000);
        });
        test('should handle partial XML tags at buffer boundaries', function () {
            var config = { targetElements: ['test'] };
            var state = parser.initializeXmlState(config);
            // Add content that ends with partial tag
            var contentWithPartialTag = 'some content <tes';
            state = parser.parseXmlStream(contentWithPartialTag, state, mockCallbacks, config);
            // Complete the tag
            state = parser.parseXmlStream('t>Final content</test>', state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('test')[0].content).toBe('Final content');
        });
    });
    describe('Configuration Options', function () {
        test('should respect case sensitivity setting', function () {
            var xml = '<USER_RESPONSE>Content</USER_RESPONSE>';
            // Case insensitive (default)
            var insensitiveConfig = {
                targetElements: ['user_response'],
                caseSensitive: false
            };
            var state1 = parser.initializeXmlState(insensitiveConfig);
            state1 = parser.parseXmlStream(xml, state1, mockCallbacks, insensitiveConfig);
            var elements1 = parser.finalizeXmlParsing(state1);
            expect(elements1.get('user_response')).toBeDefined();
            // Case sensitive
            var sensitiveConfig = {
                targetElements: ['user_response'],
                caseSensitive: true
            };
            var state2 = parser.initializeXmlState(sensitiveConfig);
            state2 = parser.parseXmlStream(xml, state2, mockCallbacks, sensitiveConfig);
            var elements2 = parser.finalizeXmlParsing(state2);
            expect(elements2.get('user_response')).toBeUndefined();
        });
        test('should only extract target elements when specified', function () {
            var xml = "\n                <user_response>Response</user_response>\n                <enhanced_user_request>Request</enhanced_user_request>\n                <other_element>Other</other_element>\n            ";
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')).toBeDefined();
            expect(elements.get('enhanced_user_request')).toBeUndefined();
            expect(elements.get('other_element')).toBeUndefined();
        });
        test('should extract all elements when no targets specified', function () {
            var xml = "\n                <element1>Content1</element1>\n                <element2>Content2</element2>\n            ";
            var config = {}; // No target elements = extract all
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('element1')).toBeDefined();
            expect(elements.get('element2')).toBeDefined();
        });
    });
    describe('Nested Elements', function () {
        test('should handle simple nested elements', function () {
            var xml = '<parent><child>Child content</child>Parent content</parent>';
            var config = { targetElements: ['parent'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var parent = elements.get('parent')[0];
            expect(parent.children).toHaveLength(1);
            expect(parent.children[0].tagName).toBe('child');
            expect(parent.children[0].content).toBe('Child content');
        });
        test('should handle deeply nested elements', function () {
            var xml = "\n                <level1>\n                    <level2>\n                        <level3>Deep content</level3>\n                    </level2>\n                </level1>\n            ";
            var config = { targetElements: ['level1'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var level1 = elements.get('level1')[0];
            expect(level1.children).toHaveLength(1);
            expect(level1.children[0].children).toHaveLength(1);
            expect(level1.children[0].children[0].content.trim()).toBe('Deep content');
        });
    });
    describe('Real-world LLM Response Scenarios', function () {
        test('should handle typical conversation response format', function () {
            var conversationXml = "\n                <user_response>\n                I understand your request. I'll help you implement this feature in the next development phase.\n                </user_response>\n                \n                <enhanced_user_request>\n                Add a dark mode toggle to the application header with persistent user preference storage\n                </enhanced_user_request>\n            ";
            var config = {
                targetElements: ['user_response', 'enhanced_user_request'],
                streamingElements: ['user_response']
            };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(conversationXml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var userResponse = elements.get('user_response')[0];
            var enhancedRequest = elements.get('enhanced_user_request')[0];
            expect(userResponse.content.trim()).toContain('I understand your request');
            expect(enhancedRequest.content.trim()).toContain('dark mode toggle');
            expect(mockCallbacks.onElementContent).toHaveBeenCalled();
        });
        test('should handle streaming chunks that break mid-word', function () {
            var config = {
                targetElements: ['user_response'],
                streamingElements: ['user_response']
            };
            var state = parser.initializeXmlState(config);
            // Simulate real streaming where words can be broken
            state = parser.parseXmlStream('<user_response>The quick bro', state, mockCallbacks, config);
            state = parser.parseXmlStream('wn fox jumps over the', state, mockCallbacks, config);
            state = parser.parseXmlStream(' lazy dog</user_response>', state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')[0].content).toBe('The quick brown fox jumps over the lazy dog');
        });
        test('should handle LLM responses with extra whitespace and formatting', function () {
            var messyXml = "\n                \n                    <user_response>\n                        \n                        This is a response with lots of\n                        whitespace and line breaks.\n                        \n                    </user_response>\n                    \n                    <enhanced_user_request>\n                        \n                        Clean up the formatting\n                        \n                    </enhanced_user_request>\n                \n            ";
            var config = { targetElements: ['user_response', 'enhanced_user_request'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(messyXml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('user_response')).toBeDefined();
            expect(elements.get('enhanced_user_request')).toBeDefined();
            expect(elements.get('user_response')[0].content).toContain('This is a response');
        });
        test('should handle incomplete LLM responses gracefully', function () {
            var incompleteXml = '<user_response>This response was cut off mid-sente';
            var config = { targetElements: ['user_response'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(incompleteXml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            // Should still extract what content is available
            expect(elements.get('user_response')[0].content).toContain('This response was cut off');
        });
    });
    describe('Edge Cases and Stress Tests', function () {
        test('should handle empty elements', function () {
            var xml = '<empty></empty><self_empty/>';
            var config = { targetElements: ['empty', 'self_empty'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('empty')[0].content).toBe('');
            expect(elements.get('self_empty')[0].content).toBe('');
        });
        test('should handle elements with special characters', function () {
            var xml = '<test>Content with &lt;special&gt; chars &amp; symbols</test>';
            var config = { targetElements: ['test'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get('test')[0].content).toContain('&lt;special&gt;');
        });
        test('should handle very long element names', function () {
            var longElementName = 'very_long_element_name_that_goes_on_and_on_and_on';
            var xml = "<".concat(longElementName, ">Content</").concat(longElementName, ">");
            var config = { targetElements: [longElementName] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            expect(elements.get(longElementName.toLowerCase())).toBeDefined();
        });
        test('should handle multiple instances of the same element', function () {
            var xml = '<item>First</item><item>Second</item><item>Third</item>';
            var config = { targetElements: ['item'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            var elements = parser.finalizeXmlParsing(state);
            var items = elements.get('item');
            expect(items).toHaveLength(3);
            expect(items[0].content).toBe('First');
            expect(items[1].content).toBe('Second');
            expect(items[2].content).toBe('Third');
        });
    });
    describe('Utility Functions', function () {
        test('should provide helper methods for element access', function () {
            var xml = '<test>Content</test><other>Other content</other>';
            var config = { targetElements: ['test', 'other'] };
            var state = parser.initializeXmlState(config);
            state = parser.parseXmlStream(xml, state, mockCallbacks, config);
            parser.finalizeXmlParsing(state);
            var testElement = parser.getElement(state, 'test');
            var allOtherElements = parser.getElements(state, 'other');
            expect(testElement === null || testElement === void 0 ? void 0 : testElement.content).toBe('Content');
            expect(allOtherElements).toHaveLength(1);
            expect(allOtherElements[0].content).toBe('Other content');
        });
        test('should return null for non-existent elements', function () {
            var state = parser.initializeXmlState({});
            var nonExistent = parser.getElement(state, 'nonexistent');
            var nonExistentArray = parser.getElements(state, 'nonexistent');
            expect(nonExistent).toBeNull();
            expect(nonExistentArray).toHaveLength(0);
        });
    });
});
