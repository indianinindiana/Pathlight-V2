# Configuration Files - Version Control Guide

This directory contains YAML configuration files that control the business logic for debt payoff calculations and recommendations.

## Files

- **calculation_parameters.yaml** - Calculation rules, thresholds, and simulation parameters
- **recommendation_rules.yaml** - Strategy selection logic and confidence scoring rules

## Version Control Strategy

### Current Approach (Recommended for Development)

The configuration files are currently tracked in the main Git repository alongside the code. This is the simplest approach for development and ensures configuration changes are versioned with code changes.

**To version these files:**

1. **Make changes** to the YAML files
2. **Commit with descriptive messages:**
   ```bash
   git add backend/config/
   git commit -m "config: Update APR warning threshold to 35%"
   ```
3. **Tag important versions:**
   ```bash
   git tag -a config-v1.1 -m "Updated recommendation rules for high-stress users"
   git push origin config-v1.1
   ```

### Alternative: Separate Configuration Repository (Production)

For production environments, you may want to store configurations in a separate repository:

**Benefits:**
- Independent versioning of config vs code
- Different access controls
- Easier rollback of config changes
- Multiple environments (dev, staging, prod)

**Setup:**

1. **Create a separate Git repository:**
   ```bash
   mkdir debt-pathfinder-config
   cd debt-pathfinder-config
   git init
   ```

2. **Move config files:**
   ```bash
   cp backend/config/*.yaml debt-pathfinder-config/
   git add .
   git commit -m "Initial configuration"
   ```

3. **Update .gitignore in main repo:**
   ```
   backend/config/*.yaml
   ```

4. **Use Git submodule or symlink:**
   ```bash
   # Option A: Git submodule
   git submodule add <config-repo-url> backend/config
   
   # Option B: Symlink (simpler for local dev)
   ln -s /path/to/debt-pathfinder-config backend/config
   ```

## Version Format

Each YAML file includes version metadata at the top:

```yaml
version: "1.0"
last_updated: "2025-11-25"
```

**Version Numbering:**
- **Major version** (1.x): Breaking changes to structure or logic
- **Minor version** (x.1): New features or significant rule changes
- **Patch** (implied): Small tweaks and bug fixes

## Change Log Best Practices

When updating configuration files, document changes:

### In Git Commit Messages:
```bash
git commit -m "config: Increase small debt threshold from $2000 to $2500

- Updated recommendation_rules.yaml
- Affects snowball strategy recommendations
- Reason: User feedback indicated $2000 was too low"
```

### In YAML File Comments:
```yaml
# Version 1.1 - 2025-11-25
# Changes:
# - Increased small_debt_balance from 2000 to 2500
# - Added new confidence scoring factor for delinquency
debt_analysis:
  small_debt_balance: 2500  # Changed from 2000
```

## Rollback Procedure

### If using main repository:
```bash
# View history
git log -- backend/config/

# Rollback to specific commit
git checkout <commit-hash> -- backend/config/
git commit -m "config: Rollback to previous version"
```

### If using separate repository:
```bash
cd backend/config
git log
git checkout <commit-hash>
cd ../..
git add backend/config
git commit -m "config: Rollback configuration to stable version"
```

## Hot Reload (Coming in Sprint S3)

A configuration reload endpoint will be added:
```
POST /api/v1/config/reload
```

This will allow updating configuration without restarting the server.

## Testing Configuration Changes

Before deploying configuration changes:

1. **Test locally** with the new configuration
2. **Run scenario simulations** to verify behavior
3. **Check recommendation logic** with test cases
4. **Deploy to staging** environment first
5. **Monitor** for unexpected behavior
6. **Rollback** if issues are detected

## Configuration Validation

The [`config_loader.py`](../app/shared/config_loader.py) includes:
- YAML syntax validation
- Fallback to default values if files are missing
- Logging of configuration load errors

## Security Notes

- Configuration files may contain sensitive business logic
- Consider access controls for production config repository
- Never commit API keys or secrets to config files (use environment variables)
- Review changes carefully before deployment

## Example Workflow

```bash
# 1. Create a feature branch
git checkout -b config/update-apr-thresholds

# 2. Edit configuration
vim backend/config/calculation_parameters.yaml

# 3. Test locally
cd backend
uvicorn main:app --reload

# 4. Commit changes
git add backend/config/calculation_parameters.yaml
git commit -m "config: Update APR warning thresholds

- Increased high_apr_warning_threshold from 30% to 35%
- Increased very_high_apr_threshold from 50% to 60%
- Reason: Market research shows these are more appropriate thresholds"

# 5. Push and create PR
git push origin config/update-apr-thresholds

# 6. After review and merge, tag the release
git tag -a config-v1.1 -m "Updated APR thresholds"
git push origin config-v1.1
```

## Questions?

For questions about configuration management, see:
- [DEVELOPMENT_PLAN.md](../../DEVELOPMENT_PLAN.md) - Section 1.4 Configuration Management
- [SPRINT_S2_SUMMARY.md](../../SPRINT_S2_SUMMARY.md) - Configuration System details