# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Launcher Plus seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please Do Not

- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please Do

1. Email security details to: [your-email@example.com] (or create a private security advisory on GitHub)
2. Include the following information:
   - Type of vulnerability
   - Full paths of source file(s) related to the vulnerability
   - Location of the affected source code (tag/branch/commit or direct URL)
   - Step-by-step instructions to reproduce the issue
   - Proof-of-concept or exploit code (if possible)
   - Impact of the vulnerability

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on our progress
- Credit in the security advisory (unless you prefer to remain anonymous)

## Security Best Practices for Users

### Configuration Safety

1. **Review Shortcuts from Untrusted Sources**
   - Always inspect imported shortcut configurations
   - Verify program paths and arguments before execution
   - Be cautious with shortcuts from public repositories

2. **Path Validation**
   - Use absolute paths for programs when possible
   - Avoid using user-provided input in paths
   - Be careful with environment variables in paths

3. **Admin Elevation**
   - Only use `runAsAdmin` when absolutely necessary
   - Understand the security implications of running as administrator
   - Review what the shortcut will execute before enabling admin mode

4. **Environment Variables**
   - Sanitize environment variables in shortcuts
   - Avoid exposing sensitive information in env vars
   - Be cautious with inherited environment variables

### Workspace Security

1. **Workspace Settings**
   - Review workspace-level shortcuts before opening untrusted projects
   - Use user-level settings for personal shortcuts
   - Be aware that workspace settings can override user settings

2. **Shared Configurations**
   - Sanitize sensitive information before sharing configurations
   - Remove personal paths and credentials
   - Use placeholders for user-specific values

### Command Execution

1. **Shell Commands**
   - Understand what each shortcut executes
   - Avoid shortcuts that execute arbitrary shell commands
   - Review sequence execution carefully

2. **File Access**
   - Be cautious with shortcuts that access sensitive files
   - Verify file paths before execution
   - Use read-only access when possible

## Known Security Considerations

### Current Limitations

1. **Admin Elevation (Windows)**
   - Currently shows a warning but doesn't prevent execution
   - Users must run VS Code as administrator for admin shortcuts
   - Future versions will implement proper UAC prompts

2. **Command Injection**
   - User-provided arguments are passed directly to child processes
   - Validate and sanitize all user input
   - Avoid using untrusted input in shortcuts

3. **Path Traversal**
   - File paths are not strictly validated
   - Users can specify any accessible path
   - Be cautious with relative paths

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced through:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- GitHub Releases

## Acknowledgments

We appreciate the security research community's efforts in responsibly disclosing vulnerabilities. Contributors who report valid security issues will be acknowledged in our security advisories (unless they prefer anonymity).

## Contact

For security-related questions or concerns, please contact:

- GitHub: [@PutraAdiJaya](https://github.com/PutraAdiJaya)
- Email: [your-email@example.com]

---

Last updated: 2025-01-18
