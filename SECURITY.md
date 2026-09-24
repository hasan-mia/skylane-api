# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Skylane seriously. If you believe you have found a
security vulnerability, please report it to us responsibly.

### Reporting Process

1. **Do NOT open a public GitHub issue.**
2. Email your report to: **security@skylane.dev**
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
4. You will receive a response within 48 hours.
5. We will verify and investigate the issue.
6. We will release a patch and announce it publicly.

### What to Expect

- We will acknowledge receipt of your report within 48 hours.
- We will provide a more detailed response within 72 hours.
- We will keep you informed of the progress towards a fix.
- We will not disclose any details to third parties without your consent.

### Out of Scope

The following are NOT considered security vulnerabilities:

- Issues in third-party libraries (report directly to the upstream project)
- Vulnerabilities in the Duffel API
- Vulnerabilities in Stripe's systems
- Issues that require physical access to the server
- Issues that require social engineering

### Security Measures in Skylane

- Secrets are loaded via environment variables (never hardcoded)
- Passwords are hashed with Argon2
- JWT tokens are short-lived with refresh token rotation
- Dynamic RBAC prevents privilege escalation
- Helmet provides security headers
- CORS is restricted to allowlisted origins
- Rate limiting is enforced on all routes
- SQL injection is prevented via Prisma parameterization
- Webhook payloads are verified via HMAC signatures
- Container images use non-root users
- No sensitive data is logged
- Error responses in production return generic messages

## Security Best Practices for Deployers

1. Set strong secrets (min 32 characters for JWT)
2. Use HTTPS in production (behind a reverse proxy)
3. Keep dependencies updated
4. Review and rotate secrets periodically
5. Monitor logs for suspicious activity
6. Enable audit logging
7. Use a WAF (Web Application Firewall)
8. Implement network segmentation

## Dependency Security

- Run `npm audit` regularly
- Enable Dependabot for automatic security updates
- CodeQL scanning runs in CI

## License

This security policy is licensed under the MIT License.
