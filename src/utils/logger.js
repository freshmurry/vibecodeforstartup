export class Logger {
    level;
    prefix;
    enabled;
    static levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
    };
    constructor(options = {}) {
        this.level = options.level ?? 'info';
        this.prefix = options.prefix ?? '';
        this.enabled = options.enabled ?? true;
    }
    shouldLog(level) {
        return this.enabled && Logger.levels[level] >= Logger.levels[this.level];
    }
    formatMessage(_level, args) {
        // const time = new Date().toISOString();
        const prefix = this.prefix ? `[${this.prefix}]` : '';
        // return [`[${time}] ${prefix} [${level.toUpperCase()}]`, ...args];
        return [prefix, ...args];
        // return args;
    }
    debug(...args) {
        if (this.shouldLog('debug')) {
            console.debug(...this.formatMessage('debug', args));
        }
    }
    info(...args) {
        if (this.shouldLog('info')) {
            console.info(...this.formatMessage('info', args));
        }
    }
    warn(...args) {
        if (this.shouldLog('warn')) {
            console.warn(...this.formatMessage('warn', args));
        }
    }
    error(...args) {
        if (this.shouldLog('error')) {
            console.error(...this.formatMessage('error', args));
        }
    }
    setLevel(level) {
        this.level = level;
    }
    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
}
export const logger = new Logger({
    level: import.meta.env.DEV ? 'debug' : 'info',
});
