# Contributing to RentMate

Thank you for considering contributing to RentMate! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Use welcoming and inclusive language
- Be collaborative
- Focus on what is best for the community
- Show empathy towards other community members

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](../../issues)
2. If not, create a new issue using the bug report template
3. Provide detailed information about the bug
4. Include screenshots if applicable

### Suggesting Features

1. Check if the feature has already been suggested in [Issues](../../issues)
2. If not, create a new issue using the feature request template
3. Describe the feature and its benefits clearly
4. Consider implementation details

### Development Process

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/rentmate.git
   cd rentmate
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

3. **Set up development environment**
   ```bash
   npm install
   npm start
   ```

4. **Make your changes**
   - Write clean, maintainable code
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation if needed

5. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run format:check
   npm run build
   ```

6. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature" 
   # or
   git commit -m "fix: resolve issue with..."
   ```

7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **Create a Pull Request**
   - Use the pull request template
   - Link related issues
   - Provide clear description of changes
   - Wait for review and address feedback

## Commit Convention

We use conventional commit messages. Format: `type(scope): description`

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add password reset functionality
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
```

## Code Style

### JavaScript/React
- Use functional components with hooks
- Follow ESLint and Prettier configurations
- Write meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

### CSS
- Use consistent naming conventions
- Organize styles logically
- Use CSS modules or styled-components when appropriate

### Testing
- Write unit tests for new components
- Test user interactions and edge cases
- Maintain code coverage above 70%
- Use descriptive test names

## Pull Request Guidelines

### Before Creating PR
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### PR Description
- Clearly describe the changes
- Link related issues
- Include screenshots for UI changes
- List breaking changes if any
- Add testing instructions

### Review Process
1. Automated CI checks must pass
2. At least one code review required
3. Address reviewer feedback
4. Maintainer will merge when approved

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Firebase CLI (for deployment)

### Environment Variables
Create `.env.local`:
```
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001
```

### Available Commands
```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
npm run lint       # Run linting
npm run format     # Format code
npm run deploy     # Deploy to Firebase
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── services/      # API and external services
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── utils/         # Utility functions
└── __tests__/     # Test files
```

## Getting Help

- Join our discussions in [GitHub Discussions](../../discussions)
- Check existing [Issues](../../issues) and [Pull Requests](../../pulls)
- Read the [CI/CD documentation](./CI_CD_SETUP.md)
- Contact maintainers through GitHub

## Recognition

Contributors will be recognized in:
- README contributors section
- Release notes
- GitHub contributors graph

Thank you for contributing to RentMate! 🚀
