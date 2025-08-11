# CLI Script Cleanup Plan

## Overview
Remove old CLI scripts and related code that are no longer needed since the web UI and API endpoints are now fully functional.

## Current State Analysis

### **CLI Scripts to Remove**
1. **`packages/core/src/main/resume/service/resume-generation-script.ts`**
   - CLI entry point for resume generation
   - Handles command line arguments (`process.argv`)
   - File system operations for output
   - Console logging for user feedback

2. **`packages/core/src/main/cover-letter/service/cover-letter-generation-script.ts`**
   - CLI entry point for cover letter generation
   - Command line argument parsing
   - File output handling
   - Console-based user interaction

### **Build System Updates Required**
1. **Core Package Build Scripts**
   - Remove esbuild commands for `resume.js` and `cover-letter.js`
   - Update `build:watch` script to remove CLI script watching
   - Simplify build process to focus on library code only

2. **Root Package Scripts**
   - Remove `resume` and `resume:fresh` scripts
   - Remove `cover-letter` and `cover-letter:fresh` scripts
   - Clean up package.json dependencies

### **Documentation Updates Required**
1. **README.md**
   - Remove CLI-based description
   - Update to reflect web-first approach
   - Remove CLI usage examples
   - Update package descriptions

2. **Memory Bank Files**
   - Update `projectbrief.md` to remove CLI references
   - Update `techContext.md` to reflect web-first architecture
   - Update `systemPatterns.md` to remove CLI patterns

## Target Architecture

### **What We're Keeping**
- **Core Business Logic**: All domain services, infrastructure, and business rules
- **API Endpoints**: REST API for resume and cover letter generation
- **Web UI**: React-based frontend for user interaction
- **Exporters**: HTML and PDF generation capabilities
- **Parsers**: LinkedIn export parsing functionality

### **What We're Removing**
- **CLI Scripts**: Command-line interface scripts
- **CLI Build Artifacts**: `resume.js` and `cover-letter.js` files
- **CLI Dependencies**: Build tools specific to CLI scripts
- **CLI Documentation**: Usage examples and CLI-focused content

## Implementation Plan

### **Phase 1: Script Removal** (1-2 days)
1. **Delete CLI Script Files**
   - Remove `resume-generation-script.ts`
   - Remove `cover-letter-generation-script.ts`
   - Verify no other files import these scripts

2. **Update Build System**
   - Remove CLI script esbuild commands from core package.json
   - Update `build:watch` script to remove CLI watching
   - Test build process works without CLI scripts

### **Phase 2: Package Scripts Cleanup** (1 day)
1. **Root Package.json**
   - Remove `resume`, `resume:fresh` scripts
   - Remove `cover-letter`, `cover-letter:fresh` scripts
   - Verify no other scripts depend on these

2. **Dependencies Review**
   - Check if any packages are CLI-specific
   - Remove unused CLI-related dependencies
   - Update package-lock files

### **Phase 3: Documentation Updates** (2-3 days)
1. **README.md Overhaul**
   - Update project description to web-first
   - Remove CLI usage examples
   - Add web UI usage instructions
   - Update package descriptions

2. **Memory Bank Updates**
   - Update `projectbrief.md` to reflect current architecture
   - Update `techContext.md` to remove CLI references
   - Update `systemPatterns.md` to focus on web patterns

### **Phase 4: Testing & Validation** (1-2 days)
1. **Build Verification**
   - Ensure all packages build successfully
   - Verify web UI and API work correctly
   - Test development workflow (`pnpm dev`)

2. **Cleanup Verification**
   - Confirm no CLI artifacts remain
   - Verify documentation is accurate
   - Check for any broken references

## Benefits of Cleanup

### **Codebase Health**
- **Reduced Complexity**: Fewer build targets and scripts
- **Cleaner Architecture**: Focus on web-first approach
- **Easier Maintenance**: No CLI-specific code to maintain

### **Development Experience**
- **Simplified Builds**: Faster, more focused build process
- **Clearer Documentation**: No confusion about CLI vs web usage
- **Better Onboarding**: New developers focus on web UI

### **Future Development**
- **Cleaner Dependencies**: No unused CLI packages
- **Easier Testing**: Focus on web and API testing
- **Better CI/CD**: Simpler build and deployment process

## Risks & Considerations

### **Potential Issues**
1. **Hidden Dependencies**: Other code might import CLI scripts
2. **Build Breakage**: Removing build commands might break CI/CD
3. **Documentation Gaps**: Users might expect CLI functionality

### **Mitigation Strategies**
1. **Thorough Search**: Use grep/search to find all references
2. **Incremental Removal**: Remove one script at a time and test
3. **Comprehensive Testing**: Verify all functionality works after cleanup

## Success Criteria

### **Technical Success**
- ✅ All CLI scripts removed
- ✅ Build system simplified and working
- ✅ No CLI artifacts in output directories
- ✅ All tests passing

### **Documentation Success**
- ✅ README.md reflects web-first approach
- ✅ No CLI references in documentation
- ✅ Clear web UI usage instructions
- ✅ Memory bank files updated

### **User Experience Success**
- ✅ Web UI and API work correctly
- ✅ Development workflow simplified
- ✅ No confusion about available interfaces

## Next Steps

1. **Review this plan** and provide feedback
2. **Prioritize cleanup phases** based on current development needs
3. **Schedule cleanup work** around other development tasks
4. **Execute cleanup** in phases with testing between each phase

## Dependencies

This cleanup task depends on:
- ✅ Web UI fully functional (Milestone 4 complete)
- ✅ API endpoints working correctly
- ✅ No active CLI usage by users
- ✅ Development team ready for architecture simplification

## Timeline Estimate

- **Total Effort**: 5-8 days
- **Risk Level**: Low (removing unused code)
- **Priority**: Medium (cleanup task, not blocking new features)
- **Dependencies**: None (can be done in parallel with other work)
