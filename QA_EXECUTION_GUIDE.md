# QA Test Execution Guide

## Overview
This guide provides step-by-step instructions for executing the comprehensive QA test plan for the Viral Giveaway Platform MVP.

**Test Plan:** See [HAP-17 Plan Document](/HAP/issues/HAP-17#document-plan)

## Pre-Execution Checklist

### Environment Verification (2 min)
- [ ] App loads at live URL without errors
- [ ] Browser console has no critical errors
- [ ] Database is initialized and accessible
- [ ] NextAuth session management is working
- [ ] Network requests are completing successfully

### Browser Setup (5 min)
- [ ] Chrome (latest) - open incognito window
- [ ] Firefox (latest) - open private window
- [ ] Safari (latest) - if available on device
- [ ] Mobile browser (iPhone/Android) - if available
- [ ] Tablet browser (iPad) - if available

### Test Data Preparation (5 min)
- [ ] Create test email account (e.g., testqa@example.com)
- [ ] Create additional test emails for referral testing
- [ ] Note: Use unique email format: `test-[timestamp]@example.com`
- [ ] Have a spreadsheet ready to track test results

## Test Execution Priority

### Critical Path (High Priority - 30 min)
1. **User Registration & Email Verification**
   - Create account with valid email
   - Verify email verification link works
   - Confirm user can login

2. **Giveaway Creation & Publishing**
   - Creator creates a draft giveaway
   - Edit and update giveaway details
   - Publish giveaway
   - Verify status changes work

3. **Entry Submission**
   - Enter giveaway from public page
   - Verify email verification flow
   - Confirm entry is recorded

4. **Referral System**
   - Get unique referral link
   - Create second test account using referral
   - Verify bonus entries are awarded
   - Check referral count in dashboard

5. **Winner Selection**
   - Select random winner from dashboard
   - Verify winner is marked correctly
   - Confirm only verified entries eligible

### Feature Coverage (Medium Priority - 60 min)
After critical path passes, execute full test plan sections:
- Section 1: User Authentication (10 min)
- Section 2: Giveaway Management (10 min)
- Section 3: Entry Mechanics (10 min)
- Section 4: Creator Dashboard (10 min)
- Section 5: Public Giveaway Page (10 min)
- Section 6: ESP Integrations (10 min - may be limited)
- Section 7: Embeddable Widget (10 min)

### Cross-Browser Testing (20 min)
- Repeat critical path on each browser
- Note any UI/functionality differences
- Document browser-specific issues

### Performance Testing (10 min)
- Measure page load times
- Test with network throttling (slow 3G)
- Verify app remains responsive

### Security Testing (10 min)
- Attempt unauthorized access to other users' giveaways
- Try SQL injection in form fields
- Test session management (logout/login)
- Verify CORS headers are correct

### Edge Cases (10 min)
- Try submitting duplicate email entries
- Test with very long titles/descriptions
- Submit forms with special characters
- Test timeout behaviors

## Test Execution Template

For each test case, document:
```
**Test:** [Test name from plan]
**Status:** ✅ Pass / ❌ Fail / ⚠️ Partial
**Device:** [Chrome/Firefox/Safari/Mobile]
**Steps Taken:** [What actions were performed]
**Expected:** [What should happen]
**Actual:** [What actually happened]
**Issues Found:** [If any, describe the bug]
**Notes:** [Any observations or concerns]
```

## Critical Issues Definition

**BLOCKER (Stop testing, escalate immediately):**
- App doesn't load or crashes on startup
- Authentication fails completely
- Cannot create/publish giveaways
- Referral system doesn't work
- Database errors in console

**HIGH (Document and continue testing):**
- UI layout broken on specific browser
- Form validation errors unclear
- Email verification not sent
- Winner selection not working
- Security issue found (e.g., XSS, CSRF)

**MEDIUM (Note for future iteration):**
- Minor UI inconsistencies
- Performance could be better
- Accessibility issues (missing labels)
- Typos or grammatical errors

**LOW (Nice to have):**
- Color contrast issues
- Optional feature gaps
- Future enhancement suggestions

## Test Results Documentation

### Summary Section
- Total tests executed
- Pass rate (percentage)
- Critical issues found
- High-priority issues found
- Recommendations

### Detailed Findings
- Organized by feature area
- Screenshots of issues (if possible)
- Reproduction steps for bugs
- Severity levels assigned

### Performance Metrics
- Page load times (target: <3 sec)
- API response times (target: <500ms)
- User interaction responsiveness
- Memory usage observations

## Sign-Off Criteria

Before marking MVP as QA-approved:
- [ ] All critical path tests pass
- [ ] No blocker issues present
- [ ] High-priority issues are documented
- [ ] Cross-browser testing completed
- [ ] Security baseline validated
- [ ] Performance is acceptable
- [ ] Test report is complete and signed

## Estimated Timeline

- Pre-execution checklist: 5-10 min
- Critical path tests: 30 min
- Feature coverage tests: 60 min
- Cross-browser testing: 20 min
- Performance & security: 20 min
- Edge cases: 10 min
- Documentation & report: 30 min
- **Total: 2.5-3.5 hours**

## Escalation Process

If critical issues found:
1. Document the issue with reproduction steps
2. Post comment on [HAP-17](/HAP/issues/HAP-17) with issue details
3. Continue testing non-blocked features
4. Report overall QA status with severity breakdown

## Post-Execution

Once testing complete:
1. Consolidate all test results
2. Create summary report
3. List all found issues by severity
4. Provide launch readiness recommendation
5. Post final report to [HAP-17](/HAP/issues/HAP-17)

---

**Ready to execute. Awaiting live deployment URL.**
