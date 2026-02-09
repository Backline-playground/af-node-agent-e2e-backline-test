import { test, expect } from '../src/pages/agents-page-fixture';

/**
 * Email Validation Test Suite
 * 
 * Tests the email notification feature for agents:
 * - Enabling email notifications
 * - Adding valid and invalid email addresses
 * - Verifying validation errors and corrections
 */

test.describe('Email Notification Validation', () => {
  test.use({
    testConfig: {
      user: 'qualityguild.advertiser',
      appID: 'android.non.organic.regular'
    }
  });

  test.beforeEach(async ({ agentsPage }) => {
    await agentsPage.waitForPageLoad();
  });

  test('should validate emails: add valid, reject invalid, correct and save', async ({
    agentsPage
  }) => {
    const validEmail1 = 'test.user@appsflyer.com';
    const invalidEmail = 'not-a-valid-email';
    const validEmail2 = 'valid.corrected@appsflyer.com';

    await test.step('Navigate to Deep research analysis agent', async () => {
      await agentsPage.selectAgent('Deep research analysis');
    });

    await test.step('Fill in required agent fields', async () => {
      await agentsPage.setAgentName(`EmailValidationTest_${Date.now()}`);
      await agentsPage.selectApp('android.non.organic.regular');
      await agentsPage.verifyAppSelected('android.non.organic.regular');
    });

    await test.step('Enable email notifications and open manage emails', async () => {
      await agentsPage.openManageEmails();
    });

    await test.step('Verify default email is present and disabled', async () => {
      const dialog = agentsPage.page.getByRole('dialog');
      const defaultEmailInput = dialog.locator('input[disabled]');
      await expect(defaultEmailInput).toBeVisible();
    });

    await test.step('Add first valid email address', async () => {
      await agentsPage.addEmail(validEmail1);
      
      // Blur to trigger validation
      await agentsPage.page.keyboard.press('Tab');
      await agentsPage.page.waitForTimeout(500);
      
      // Verify no validation error for valid email
      const hasError = await agentsPage.hasEmailValidationError();
      expect(hasError).toBe(false);
      
      // Verify we now have 2 email inputs (default + valid)
      const inputCount = await agentsPage.getEmailInputCount();
      expect(inputCount).toBe(2);
    });

    await test.step('Add invalid email address', async () => {
      await agentsPage.addEmail(invalidEmail);
      
      // Blur to trigger validation
      await agentsPage.page.keyboard.press('Tab');
      await agentsPage.page.waitForTimeout(500);
    });

    await test.step('Verify validation error is shown for invalid email', async () => {
      const hasError = await agentsPage.hasEmailValidationError();
      expect(hasError).toBe(true);
      
      // Verify the error message text
      const dialog = agentsPage.page.getByRole('dialog');
      const errorText = dialog.locator('text=Please enter a valid email address');
      await expect(errorText).toBeVisible();
    });

    await test.step('Correct invalid email to valid email', async () => {
      // Clear the invalid email and replace with valid one
      await agentsPage.fillEmailInput(validEmail2);
      
      // Blur to trigger validation
      await agentsPage.page.keyboard.press('Tab');
      await agentsPage.page.waitForTimeout(500);
      
      // Verify error is gone
      const dialog = agentsPage.page.getByRole('dialog');
      const errorText = dialog.locator('text=Please enter a valid email address');
      await expect(errorText).not.toBeVisible();
    });

    await test.step('Save all emails', async () => {
      await agentsPage.saveEmails();
    });

    await test.step('Verify all emails were saved by reopening dialog', async () => {
      await agentsPage.openManageEmails();
      // Should have 3 emails: default + validEmail1 + validEmail2
      const inputCount = await agentsPage.getEmailInputCount();
      expect(inputCount).toBe(3);
    });

    await test.step('Add more emails to reach the limit of 5', async () => {
      // Currently have 3 emails (default + validEmail1 + validEmail2)
      // Add email 4
      await agentsPage.addEmail('email4@appsflyer.com');
      await agentsPage.page.keyboard.press('Tab');
      await agentsPage.page.waitForTimeout(500);
      
      // Add email 5 (this should be the last one allowed)
      await agentsPage.addEmail('email5@appsflyer.com');
      await agentsPage.page.keyboard.press('Tab');
      await agentsPage.page.waitForTimeout(500);
      
      // Verify we now have 5 emails (the maximum allowed)
      const inputCount = await agentsPage.getEmailInputCount();
      expect(inputCount).toBe(5);
    });

    await test.step('Verify cannot add 6th email - button should be disabled', async () => {
      const dialog = agentsPage.page.getByRole('dialog');
      const addEmailButton = dialog.getByRole('button', { name: /add email/i });
      
      // The "Add email" button should be disabled when limit of 5 is reached
      await expect(addEmailButton).toBeDisabled();
      
      // Verify still have 5 emails (limit)
      const inputCount = await agentsPage.getEmailInputCount();
      expect(inputCount).toBe(5);
    });

    await test.step('Save all 5 emails', async () => {
      await agentsPage.saveEmails();
    });

    await test.step('Verify all 5 emails persisted after save', async () => {
      await agentsPage.openManageEmails();
      const inputCount = await agentsPage.getEmailInputCount();
      expect(inputCount).toBe(5);
      await agentsPage.cancelEmailDialog();
    });
  });
});
