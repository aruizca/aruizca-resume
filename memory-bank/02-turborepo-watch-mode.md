# Turborepo Watch Mode Implementation Plan

## Overview
Replace the current multiple watch processes (using `concurrently`) with Turborepo's built-in `turbo watch` command for single-instance file watching and automatic build orchestration across all packages.

## Current State Analysis

### **Current Watch Implementation**
**Root Package (`package.json`)**:
- `"dev": "turbo run dev --parallel"` - Runs dev scripts in all packages concurrently
- `"dev:core": "pnpm --filter @aruizca-resume/core run build:watch"`
- `"dev:webapp": "pnpm --filter @aruizca-resume/webapp run dev"`
- `"dev:api": "pnpm --filter @aruizca-resume/api run dev"`

**Core Package (`packages/core/package.json`)**:
- `"build:watch": "tsc && concurrently \"esbuild ... --watch\" \"esbuild ... --watch\" \"esbuild ... --watch\""`
- Uses `concurrently` to run multiple esbuild watch processes
- Creates multiple processes instead of single shell instance

**Turbo Configuration (`turbo.json`)**:
- `"dev": { "cache": false, "persistent": true }` - Already configured for persistent tasks
- Missing `build:watch` task configuration

### **Problems with Current Approach**
1. **Multiple Processes**: `concurrently` creates multiple watch processes
2. **Complex Dependencies**: Manual management of package build order
3. **Resource Overhead**: Multiple file watchers running simultaneously
4. **Maintenance Complexity**: Custom watch logic in each package

## Target Architecture

### **What We're Changing**
- **From**: Multiple watch processes using `concurrently`
- **To**: Single `turbo watch` command with automatic dependency management

### **What We're Keeping**
- **Package-specific watch scripts**: Each package maintains its own watch logic
- **Build processes**: Same build tools (tsc, esbuild, vite, tsx)
- **Development workflow**: Same commands, different implementation

### **New System Pattern**
- **Turborepo Watch Mode**: Single command watches all packages
- **Automatic Dependency Management**: Turborepo handles build order
- **Single Shell Instance**: One process managing all file watching
- **Optimized Performance**: Built-in monorepo optimization

## Implementation Plan

### **Phase 1: Update turbo.json Configuration** (1 day)
1. **Add build:watch Task**
   ```json
   {
     "tasks": {
       "build:watch": {
         "cache": false,
         "persistent": true
       },
       "dev": {
         "cache": false,
         "persistent": true
       }
     }
   }
   ```

2. **Configure Task Dependencies**
   - Ensure proper dependency order for watch tasks
   - Configure outputs for caching where appropriate

3. **Test Configuration**
   - Verify turbo.json syntax
   - Test basic task execution

### **Phase 2: Update Package Scripts** (1-2 days)
1. **Core Package (`packages/core/package.json`)**
   - Simplify `build:watch` script to remove `concurrently`
   - Keep TypeScript compilation and esbuild watching
   - Ensure single watch process per package

2. **Webapp Package (`packages/webapp/package.json`)**
   - Verify `dev` script uses Vite's built-in watch mode
   - Ensure proper output configuration

3. **API Package (`packages/api/package.json`)**
   - Verify `dev` script uses tsx watch mode
   - Ensure proper output configuration

### **Phase 3: Update Root Package Scripts** (1 day)
1. **Replace Current Dev Scripts**
   ```json
   {
     "scripts": {
       "dev": "turbo watch build:watch dev",
       "dev:core": "turbo watch build:watch --filter=@aruizca-resume/core",
       "dev:webapp": "turbo watch dev --filter=@aruizca-resume/webapp",
       "dev:api": "turbo watch dev --filter=@aruizca-resume/api"
     }
   }
   ```

2. **Add New Watch Commands**
   - `"watch": "turbo watch build:watch dev"` - Watch all packages
   - `"watch:build": "turbo watch build:watch"` - Watch builds only
   - `"watch:dev": "turbo watch dev"` - Watch dev servers only

### **Phase 4: Testing & Validation** (1-2 days)
1. **Basic Functionality**
   - Test `turbo watch` command execution
   - Verify file watching works across packages
   - Test dependency management and build order

2. **Performance Testing**
   - Compare startup time with current approach
   - Test file change detection and build speed
   - Verify memory usage and process count

3. **Integration Testing**
   - Test with actual file changes
   - Verify builds trigger correctly
   - Test error handling and recovery

### **Phase 5: Documentation & Cleanup** (1 day)
1. **Update Memory Bank**
   - Document new watch system in `systemPatterns.md`
   - Update `techContext.md` with new commands
   - Add troubleshooting section

2. **Clean Up Old Code**
   - **Remove unused `concurrently` dependency** from root package.json (leftover from CLI cleanup)
   - Clean up old watch scripts
   - Update package.json dependencies

## Technical Implementation Details

### **Turbo Watch Command Structure**
```bash
# Watch all packages for build and dev changes
turbo watch build:watch dev

# Watch specific package
turbo watch build:watch --filter=@aruizca-resume/core

# Watch with experimental caching
turbo watch build:watch dev --experimental-write-cache
```

### **Package Watch Scripts**
**Core Package**:
```json
{
  "scripts": {
    "build:watch": "tsc && esbuild src/main/index.ts --bundle --platform=node --format=esm --outfile=dist/index.js --external:@langchain/* --external:openai --external:papaparse --external:playwright --external:chromium-bidi --watch"
  }
}
```

**Webapp Package**:
```json
{
  "scripts": {
    "dev": "vite --watch"
  }
}
```

**API Package**:
```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts"
  }
}
```

### **Turbo Configuration**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "build:watch": {
      "cache": false,
      "persistent": true
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

## Benefits of Turborepo Watch Mode

### **Performance Improvements**
- **Single Process**: One file watcher instead of multiple
- **Optimized Watching**: Turborepo's built-in file watching optimization
- **Reduced Memory**: Less overhead from multiple watch processes
- **Faster Startup**: Single command instead of multiple process spawning

### **Development Experience**
- **Simplified Commands**: Single `turbo watch` command
- **Automatic Dependencies**: No manual dependency management
- **Better Error Handling**: Centralized error reporting
- **Consistent Behavior**: Same watch behavior across all packages

### **Maintenance Benefits**
- **Less Custom Code**: No custom file watching logic
- **Official Support**: Uses Turborepo's official watch functionality
- **Future Updates**: Benefits from Turborepo improvements
- **Standard Patterns**: Follows monorepo best practices

## Risks & Considerations

### **Potential Issues**
1. **Learning Curve**: Team needs to learn new `turbo watch` commands
2. **Configuration Complexity**: More complex turbo.json configuration
3. **Debugging**: Different error messages and behavior
4. **Migration**: Need to update existing development workflows

### **Mitigation Strategies**
1. **Documentation**: Comprehensive documentation of new commands
2. **Testing**: Thorough testing before full migration
3. **Gradual Migration**: Phase-by-phase implementation
4. **Fallback Options**: Keep old scripts temporarily for comparison

## Success Criteria

### **Technical Success**
- ✅ Single `turbo watch` command works for all packages
- ✅ File changes trigger appropriate builds automatically
- ✅ Dependencies are built in correct order
- ✅ No multiple watch processes running

### **Performance Success**
- ✅ Faster startup time than current approach
- ✅ Lower memory usage
- ✅ Faster file change detection
- ✅ Efficient build orchestration

### **User Experience Success**
- ✅ Simple, intuitive commands
- ✅ Reliable file watching
- ✅ Clear error messages
- ✅ Consistent behavior across packages

## Next Steps

1. **Review this plan** and provide feedback
2. **Prioritize implementation phases** based on development needs
3. **Schedule implementation** around development cycles
4. **Execute implementation** in phases with testing between each phase

## Dependencies

This task depends on:
- ✅ Turborepo already installed and configured
- ✅ Current watch scripts working correctly
- ✅ Development team available for testing
- ✅ No active development blocking changes

## Timeline Estimate

- **Total Effort**: 5-7 days
- **Risk Level**: Low (using official Turborepo functionality)
- **Priority**: Medium (improves development experience)
- **Dependencies**: None (can be done in parallel with other work)

## System Pattern Documentation

This implementation will establish a new system pattern for file watching:

### **Turborepo Watch Pattern**
- Single `turbo watch` command for all packages
- Automatic dependency management and build orchestration
- Persistent tasks with proper caching configuration
- Standardized watch behavior across the monorepo

### **Watch Command Structure**
- `turbo watch build:watch dev` - Watch all packages
- `turbo watch --filter=package` - Watch specific package
- `turbo watch task1 task2` - Watch specific tasks
- `turbo watch --experimental-write-cache` - Enable experimental caching
