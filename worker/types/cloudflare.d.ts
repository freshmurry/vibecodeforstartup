/**
 * Cloudflare Workers types
 * Provides type definitions for Cloudflare Workers runtime
 */

// Make this a module
export {};

// Base Durable Object class - implementation will be provided by runtime
declare class DurableObject<Env = any> {
  constructor(ctx: DurableObjectState, env: Env);
  ctx: DurableObjectState;
  env: Env;
}

// Basic runtime types
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<Env = unknown> {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}

// WebSocket types
interface WebSocketPair {
  0: WebSocket;
  1: WebSocket;
}

declare const WebSocketPair: {
  new(): WebSocketPair;
};

// Headers init type
type HeadersInit = string[][] | Record<string, string> | Headers;

// Durable Object types
interface DurableObjectState {
  storage: DurableObjectStorage;
  id: DurableObjectId;
  acceptWebSocket(webSocket: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): WebSocket[];
  setWebSocketAutoResponse(webSocketAutoResponse?: WebSocketRequestResponsePair): void;
  getWebSocketAutoResponse(): WebSocketRequestResponsePair | null;
  getTags(ws: WebSocket): string[];
}

interface DurableObjectStorage {
  get<T = any>(key: string): Promise<T | undefined>;
  get<T = any>(keys: string[]): Promise<Map<string, T>>;
  put<T = any>(key: string, value: T): Promise<void>;
  put<T = any>(entries: Record<string, T>): Promise<void>;
  delete(key: string): Promise<boolean>;
  delete(keys: string[]): Promise<number>;
  list<T = any>(options?: DurableObjectListOptions): Promise<Map<string, T>>;
  transaction<T>(closure: (txn: DurableObjectTransaction) => Promise<T>): Promise<T>;
  deleteAll(): Promise<void>;
}

interface DurableObjectListOptions {
  start?: string;
  startAfter?: string;
  end?: string;
  prefix?: string;
  reverse?: boolean;
  limit?: number;
}

interface DurableObjectTransaction {
  get<T = any>(key: string): Promise<T | undefined>;
  get<T = any>(keys: string[]): Promise<Map<string, T>>;
  put<T = any>(key: string, value: T): void;
  put<T = any>(entries: Record<string, T>): void;
  delete(key: string): void;
  delete(keys: string[]): void;
  list<T = any>(options?: DurableObjectListOptions): Promise<Map<string, T>>;
  deleteAll(): void;
  rollback(): void;
}

interface DurableObjectId {
  toString(): string;
  equals(other: DurableObjectId): boolean;
  getName(): string | undefined;
}

interface DurableObjectStub<T = any> {
  get(id: DurableObjectId | string, options?: { locationHint?: DurableObjectLocationHint }): T;
  idFromName(name: string): DurableObjectId;
  idFromString(id: string): DurableObjectId;
  newUniqueId(options?: { jurisdiction?: DurableObjectJurisdiction }): DurableObjectId;
  fetch(request: Request): Promise<Response>;
}

type DurableObjectLocationHint = "wnam" | "enam" | "weur" | "eeur" | "apac" | "oc";
type DurableObjectJurisdiction = "eu" | "fedramp";

// KV types
interface KVNamespace {
  get(key: string, options?: KVNamespaceGetOptions<undefined>): Promise<string | null>;
  get(key: string, type: "text"): Promise<string | null>;
  get(key: string, type: "json"): Promise<any>;
  get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
  get(key: string, type: "stream"): Promise<ReadableStream | null>;
  get<ExpectedValue = unknown>(key: string, options: KVNamespaceGetOptions<"json">): Promise<ExpectedValue | null>;
  
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: KVNamespacePutOptions): Promise<void>;
  
  delete(key: string): Promise<void>;
  
  list<Metadata = unknown>(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult<Metadata>>;
}

interface KVNamespaceGetOptions<Type> {
  type: Type;
  cacheTtl?: number;
}

interface KVNamespacePutOptions {
  expiration?: number;
  expirationTtl?: number;
  metadata?: any;
}

interface KVNamespaceListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
}

interface KVNamespaceListResult<Metadata = unknown> {
  keys: KVNamespaceListKey<Metadata>[];
  list_complete: boolean;
  cursor?: string;
}

interface KVNamespaceListKey<Metadata = unknown> {
  name: string;
  expiration?: number;
  metadata?: Metadata;
}

// D1 types
interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T>;
  run(): Promise<D1Result<Record<string, unknown>>>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

interface D1Result<T = Record<string, unknown>> {
  results?: T[];
  success: boolean;
  error?: string;
  meta: {
    duration: number;
    size_after: number;
    rows_read: number;
    rows_written: number;
    last_row_id: number;
    changed_db: boolean;
  };
}

interface D1ExecResult {
  count: number;
  duration: number;
}

// R2 types
interface R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null, options?: R2PutOptions): Promise<R2Object>;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

interface R2Object {
  key: string;
  version: string;
  size: number;
  etag: string;
  httpEtag: string;
  uploaded: Date;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
  range?: R2Range;
}

interface R2ObjectBody extends R2Object {
  body: ReadableStream;
  bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
  json<T = any>(): Promise<T>;
  blob(): Promise<Blob>;
}

interface R2GetOptions {
  onlyIf?: R2Conditional;
  range?: R2Range;
}

interface R2PutOptions {
  onlyIf?: R2Conditional;
  httpMetadata?: R2HTTPMetadata;
  customMetadata?: Record<string, string>;
}

interface R2ListOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  delimiter?: string;
  startAfter?: string;
  include?: ("httpMetadata" | "customMetadata")[];
}

interface R2Objects {
  objects: R2Object[];
  truncated: boolean;
  cursor?: string;
  delimitedPrefixes: string[];
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}

interface R2Range {
  offset?: number;
  length?: number;
  suffix?: number;
}

interface R2Conditional {
  etagMatches?: string;
  etagDoesNotMatch?: string;
  uploadedBefore?: Date;
  uploadedAfter?: Date;
}

// AI types
interface Ai {
  run(model: string, options: AiOptions): Promise<any>;
}

interface AiOptions {
  messages?: AiMessage[];
  prompt?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  [key: string]: any;
}

interface AiMessage {
  role: string;
  content: string;
}

// Rate limiting types
interface RateLimit {
  limit(options: { key: string }): Promise<RateLimitResult>;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  pending: number;
  reset: string;
}

// Images binding
interface ImagesBinding {
  // Add specific methods as needed
}

// AI Gateway types
type AIGatewayProviders = "openai" | "anthropic" | "google" | "groq" | "cerebras" | "openrouter";

// Caches API
declare const caches: CacheStorage;

interface CacheStorage {
  default: Cache;
  open(cacheName: string): Promise<Cache>;
}

// Make caches available globally
declare global {
  const caches: CacheStorage;
}

// WebSocket types extension
interface WebSocketRequestResponsePair {
  request: string;
  response: string;
}

// Crypto extensions
interface SubtleCrypto {
  timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean;
}

// Export types for use in other modules
declare global {
  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }
}

// Export specific types
export type {
  ExecutionContext,
  ExportedHandler,
  DurableObjectStub,
  DurableObjectState,
  DurableObjectJurisdiction,
  KVNamespace,
  D1Database,
  R2Bucket,
  AIGatewayProviders,
  WebSocketPair,
  HeadersInit,
  RateLimit
};