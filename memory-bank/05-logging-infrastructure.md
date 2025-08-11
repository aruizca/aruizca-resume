# Logging Infrastructure Implementation Plan

## 🎯 **Objective**
Replace all `console.log`, `console.warn`, and `console.error` calls with a structured, production-ready logging system using Winston.

## 🔍 **Current State Analysis**

### **Console Usage Inventory**
Based on codebase search, found console calls in:

#### **API Package** (`packages/api/`)
- `src/routes/resume.ts`: 6 console.log calls
- `src/routes/coverLetter.ts`: Console calls for debugging
- `src/middleware/errorHandler.ts`: 1 console.error call
- `src/server.ts`: Console calls for server startup

#### **Core Package** (`packages/core/`)
- `src/main/resume/service/ResumeGenerator.ts`: 8+ console calls
- `src/main/cover-letter/service/CoverLetterGenerator.ts`: Console calls
- `src/main/shared/infrastructure/utils/performanceMonitor.ts`: 4 console.log calls
- `src/main/shared/infrastructure/langchain/LangchainPromptRunner.ts`: 1 console.log call
- `src/main/resume/service/resume-generation-script.ts`: 2 console calls
- `src/main/cover-letter/service/cover-letter-generation-script.ts`: 4 console calls

#### **Webapp Package** (`packages/webapp/`)
- `src/hooks/useResumeGeneration.ts`: 5 console calls
- `src/hooks/useCoverLetterGeneration.ts`: 1 console call

### **Total Console Calls**: ~30+ calls across the codebase

## 🏗️ **Target Architecture**

### **Logger Service Structure**
```
packages/core/src/main/shared/infrastructure/logging/
├── Logger.ts              # Main logger class
├── LoggerConfig.ts        # Configuration and setup
├── LogLevels.ts           # Log level constants
├── LogFormatters.ts       # Custom formatters
└── index.ts              # Barrel exports
```

### **Logging Strategy**
- **Development**: Console + file logging with debug level
- **Production**: File logging only with info level
- **Structured**: JSON format for easy parsing
- **Rotation**: Daily log files with size limits

## 📦 **Dependencies Required**

### **Core Package** (`packages/core/package.json`)
```json
{
  "winston": "^3.11.0",
  "winston-daily-rotate-file": "^4.7.1"
}
```

### **API Package** (`packages/api/package.json`)
```json
{
  "winston": "^3.11.0",
  "winston-daily-rotate-file": "^4.7.1"
}
```

### **Type Definitions**
```json
{
  "@types/winston": "^2.4.4"
}
```

## 🔧 **Implementation Steps**

### **Phase 1: Core Logger Service** (Priority: High)

#### **Step 1: Create Logger Infrastructure**
1. **Create Logger Directory**
   ```bash
   mkdir -p packages/core/src/main/shared/infrastructure/logging
   ```

2. **Install Dependencies**
   ```bash
   cd packages/core
   pnpm add winston winston-daily-rotate-file
   pnpm add -D @types/winston
   ```

3. **Create Logger Service Files**
   - `Logger.ts` - Main logger class
   - `LoggerConfig.ts` - Configuration
   - `LogLevels.ts` - Constants
   - `LogFormatters.ts` - Formatters
   - `index.ts` - Exports

#### **Step 2: Implement Logger Service**
```typescript
// packages/core/src/main/shared/infrastructure/logging/Logger.ts
export class Logger {
  private logger: winston.Logger;
  
  constructor(context: string) {
    this.logger = this.createLogger(context);
  }
  
  info(message: string, meta?: any): void
  warn(message: string, meta?: any): void
  error(message: string, meta?: any): void
  debug(message: string, meta?: any): void
  
  private createLogger(context: string): winston.Logger
}
```

#### **Step 3: Configure Log Levels**
```typescript
// packages/core/src/main/shared/infrastructure/logging/LogLevels.ts
export const LogLevels = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug'
} as const;

export const LogLevelsPriority = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};
```

### **Phase 2: Replace Console Calls** (Priority: High)

#### **Step 1: API Package Console Replacement**
1. **Update Resume Routes**
   - Replace 6 console.log calls with logger.info/logger.debug
   - Add structured metadata (file size, operation type)

2. **Update Error Handler**
   - Replace console.error with logger.error
   - Add error context and stack trace

3. **Update Server**
   - Replace startup console calls with logger.info
   - Add server configuration logging

#### **Step 2: Core Package Console Replacement**
1. **Update ResumeGenerator**
   - Replace 8+ console calls with appropriate log levels
   - Add performance metrics to log metadata

2. **Update PerformanceMonitor**
   - Replace 4 console.log calls with logger.debug
   - Add operation timing to log metadata

3. **Update PromptRunner**
   - Replace console.log with logger.info
   - Add LLM operation context

4. **Update Scripts**
   - Replace console calls in CLI scripts
   - Add structured error logging

#### **Step 3: Webapp Package Console Replacement**
1. **Update Hooks**
   - Replace console calls with logger calls
   - Add user action context to logs

### **Phase 3: Log Configuration** (Priority: Medium)

#### **Step 1: Environment-Based Configuration**
```typescript
// packages/core/src/main/shared/infrastructure/logging/LoggerConfig.ts
export const LoggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'simple',
  fileRotation: {
    maxSize: '20m',
    maxFiles: '14d'
  }
};
```

#### **Step 2: Log File Structure**
```
logs/
├── app.log              # Current day logs
├── app-2024-01-15.log  # Previous day logs
├── error.log            # Error-only logs
└── combined.log         # All levels combined
```

#### **Step 3: Log Formatting**
```typescript
// Development format
[2024-01-15 10:30:45] [INFO] [ResumeGenerator] Starting JSON resume generation...

// Production format (JSON)
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "context": "ResumeGenerator",
  "message": "Starting JSON resume generation",
  "metadata": {
    "operation": "generateFromZip",
    "fileSize": "2.5MB"
  }
}
```

### **Phase 4: Integration & Testing** (Priority: Medium)

#### **Step 1: Update Package Exports**
1. **Update Barrel Exports**
   ```typescript
   // packages/core/src/main/shared/infrastructure/index.ts
   export * from './logging';
   ```

2. **Update Service Imports**
   - Import logger in all services
   - Replace console calls systematically

#### **Step 2: Testing**
1. **Unit Tests**
   - Test logger configuration
   - Test log level filtering
   - Test log rotation

2. **Integration Tests**
   - Test logging in resume generation
   - Test logging in API endpoints
   - Test log file creation

## 📊 **Log Content Examples**

### **Resume Generation Log**
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "context": "ResumeGenerator",
  "message": "Starting JSON resume generation",
  "metadata": {
    "operation": "generateFromZip",
    "fileSize": "2.5MB",
    "forceRefresh": false
  }
}
```

### **API Request Log**
```json
{
  "timestamp": "2024-01-15T10:30:46.456Z",
  "level": "info",
  "context": "ResumeAPI",
  "message": "Resume generation request received",
  "metadata": {
    "endpoint": "/api/resume/generate",
    "fileSize": "2.5MB",
    "userAgent": "Mozilla/5.0...",
    "ip": "192.168.1.100"
  }
}
```

### **Error Log**
```json
{
  "timestamp": "2024-01-15T10:30:47.789Z",
  "level": "error",
  "context": "ResumeGenerator",
  "message": "LinkedIn parsing failed",
  "metadata": {
    "operation": "parseLinkedInData",
    "error": "Invalid ZIP file format",
    "stack": "Error: Invalid ZIP file format\n    at LinkedInParser.parse...",
    "fileSize": "2.5MB"
  }
}
```

## 🔄 **Migration Strategy**

### **Step-by-Step Replacement**
1. **Start with Core Package** - Most console calls, foundational
2. **Update API Package** - Server-side logging
3. **Update Webapp Package** - Client-side logging
4. **Test Each Package** - Ensure logging works correctly
5. **Remove Console Calls** - Clean up old console statements

### **Backward Compatibility**
- **Development**: Console + file logging
- **Production**: File logging only
- **Environment Variable**: `LOG_LEVEL` controls verbosity
- **Fallback**: Graceful degradation if logger fails

## 🎯 **Success Metrics**

### **Logging Coverage**
- **Console Replacement**: 100% of console calls replaced
- **Log Levels**: Appropriate level for each log entry
- **Structured Data**: Metadata included in all logs
- **File Rotation**: Daily log files with size limits

### **Performance Impact**
- **Logging Overhead**: <5ms per log entry
- **File I/O**: Asynchronous logging to prevent blocking
- **Memory Usage**: Minimal memory footprint
- **Disk Usage**: Controlled log file sizes

### **Operational Benefits**
- **Debugging**: Easy log search and filtering
- **Monitoring**: Structured data for analytics
- **Compliance**: Audit trail for user actions
- **Maintenance**: Centralized logging configuration

## 🚧 **Potential Challenges**

### **Technical Challenges**
- **Async Logging**: Ensure non-blocking operation
- **File Permissions**: Log directory access in production
- **Disk Space**: Log rotation and cleanup
- **Performance**: Minimal impact on application speed

### **Migration Challenges**
- **Console Dependencies**: Some packages may expect console output
- **Testing**: Ensuring logs are written correctly
- **Debugging**: Console output still needed in development
- **CI/CD**: Log file handling in build processes

## 📚 **Resources & References**

### **Winston Documentation**
- [Winston Getting Started](https://github.com/winstonjs/winston#quick-start)
- [Winston Daily Rotate File](https://github.com/winstonjs/winston-daily-rotate-file)
- [Winston Transports](https://github.com/winstonjs/winston#transports)

### **Best Practices**
- [Node.js Logging Best Practices](https://nodejs.org/en/docs/guides/logging/)
- [Production Logging Guidelines](https://12factor.net/logs)
- [Structured Logging](https://www.elastic.co/guide/en/ecs/current/ecs-log.html)

### **Implementation Examples**
- [Express.js with Winston](https://github.com/winstonjs/winston/tree/master/examples)
- [Node.js Production Logging](https://github.com/nodejs/node/blob/main/doc/guides/logging.md)
- [Winston Configuration Examples](https://github.com/winstonjs/winston/tree/master/examples)
