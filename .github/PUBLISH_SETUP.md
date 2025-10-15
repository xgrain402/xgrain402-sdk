# Publishing Setup

This document explains how to set up automated publishing for the `@payai/x402-solana` package.

## GitHub Secrets Required

You need to add the following secrets to your GitHub repository:

### 1. NPM_TOKEN
1. Go to [npmjs.com](https://npmjs.com) and log in
2. Navigate to your account settings → Access Tokens
3. Create a new "Automation" token with "Publish" permissions
4. Copy the token
5. In your GitHub repository, go to Settings → Secrets and variables → Actions
6. Add a new repository secret named `NPM_TOKEN` with the token value

### 2. GITHUB_TOKEN
This is automatically provided by GitHub Actions, no setup needed.

## How the Workflow Works

The workflow consists of two jobs:

### Test Job (runs on all PRs and pushes)
- Runs on every push and pull request
- Sets up Node.js 18 and pnpm
- Installs dependencies
- Runs type checking, linting, and tests
- Builds the package

### Publish Job (runs only when merged to main)
- Only runs when code is pushed to the main branch
- Depends on the test job passing
- Checks if the current version already exists on npm
- If it exists, automatically bumps the patch version
- Publishes the package to npm
- Creates a GitHub release

## Version Management

The workflow handles versioning automatically:
- If the current version in `package.json` doesn't exist on npm, it publishes as-is
- If the version already exists, it bumps the patch version and publishes
- Version bumps are committed back to the repository

## Manual Version Control (Alternative)

If you prefer to control versions manually:
1. Update the version in `package.json` in your PR
2. The workflow will publish that exact version
3. Remove the automatic version bumping steps from the workflow if desired

## Testing the Workflow

1. Create a test branch
2. Make some changes
3. Open a PR to main - this will run the test job
4. Merge the PR - this will run both test and publish jobs

## Troubleshooting

### Common Issues:
1. **NPM_TOKEN not working**: Make sure it's an "Automation" token with publish permissions
2. **Version conflicts**: The workflow should handle this automatically by bumping versions
3. **Build failures**: Check that all tests pass locally before merging

### Logs:
- Check the Actions tab in your GitHub repository for detailed logs
- Each step in the workflow provides detailed output for debugging
