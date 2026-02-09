import { type Page, type Locator, expect } from '@playwright/test';
import { Button } from '@appsflyer/af-node-playwright-core';

/**
 * Page Object Model for the Agents page, providing methods to interact with
 * all agent types (Creative Opportunity Spotter, Marketing Performance Pulse, etc.)
 */
export class AgentsPage {
  readonly page: Page;
  public readonly agentNameTextField: Locator;
  public readonly appSelectButton: Button;
  public readonly scheduleSelect: Locator;
  public readonly slackChannelTextField: Locator;
  public readonly creativeTypeSelect: Locator;
  public readonly geoLocationsButton: Button;
  public readonly activateAgentButton: Button;

  constructor(page: Page) {
    this.page = page;

    // Updated selector: placeholder now ends with period
    this.agentNameTextField = page.getByPlaceholder('Enter agent name.');

    this.appSelectButton = new Button(
      page.getByRole('button', { name: 'Select app' }),
      'App Select button'
    );

    // Schedule button - matches various states (default, selected value)
    this.scheduleSelect = page.getByRole('button').filter({
      hasText: /select Monitoring Schedule|Daily at|Weekly on|Monthly on|No schedule/i
    }).first();

    // Updated selector: using placeholder for consistency
    this.slackChannelTextField = page.getByPlaceholder('Enter channel name');

    this.creativeTypeSelect = page.getByRole('button', {
      name: 'Select Creative type'
    });

    this.geoLocationsButton = new Button(
      page.getByRole('button', { name: 'Select geo locations' }),
      'Geo locations select button'
    );

    this.activateAgentButton = new Button(
      page.getByRole('button', {
        name: 'Deploy Agent'
      }),
      'Deploy Agent button'
    );
  }

  /**
   * Navigates to agents page
   */
  async goto() {
    await this.page.goto('/agents-client/overview');
  }

  /**
   * Clicks the "Deploy Agent" button for a specific agent by finding it by name
   * @param agentDisplayName - The display name of the agent (e.g., "Spot creative opportunities", "Weekly performance report")
   */
  async selectAgent(agentDisplayName: string): Promise<void> {
    // Find the agent card by looking for a card that contains both the agent name paragraph
    // and a Deploy Agent button. Agent names are in paragraph elements.
    const agentCard = this.page
      .locator('[class*="MuiPaper-root"]')
      .filter({
        has: this.page.getByRole('paragraph').filter({ hasText: agentDisplayName }),
      })
      .filter({
        has: this.page.getByRole('button', { name: 'Deploy Agent' }),
      });
    
    // Wait for the card to be visible and click the Deploy Agent button
    await agentCard.first().waitFor({ state: 'visible' });
    const deployButton = agentCard.first().getByRole('button', { name: 'Deploy Agent' });
    await deployButton.click();
  }

  /**
   * Sets the agent name
   * @param agentName - The name for the agent
   */
  async setAgentName(agentName: string): Promise<void> {
    await this.agentNameTextField.click();
    await this.agentNameTextField.fill(agentName);
  }

  /**
   * Selects the specified app from the app dropdown
   * @param appId - The app ID to select
   */
  async selectApp(appId: string): Promise<void> {
    await this.appSelectButton.click();
    
    // Wait for the checkbox to be available
    const appCheckbox = this.page.getByRole('checkbox', { name: appId });
    await appCheckbox.waitFor({ state: 'visible' });
    await appCheckbox.click();

    // Click outside the dropdown to close it
    await this.page.click('body');
    
    // Wait for the checkbox to be hidden (dropdown closed)
    await appCheckbox.waitFor({ state: 'hidden' });
  }

  /**
   * Verifies that the app has been selected
   * @param appId - The app ID to verify
   */
  async verifyAppSelected(appId: string): Promise<void> {
    // First try to find "1 selected" text, otherwise look for the app ID in a span element
    const selectedIndicator = this.page
      .locator('text=1 selected')
      .or(this.page.locator(`span:has-text("${appId}")`).first());
    await selectedIndicator.waitFor({ state: 'visible' });
  }

  /**
   * Sets the monitoring schedule
   * @param schedule - The schedule option (e.g., 'Daily at 12:00 PM', 'No schedule')
   */
  async setSchedule(schedule: string): Promise<void> {
    // Wait for schedule button to be visible and clickable
    await this.scheduleSelect.waitFor({ state: 'visible' });
    await this.scheduleSelect.click();
    
    // Wait for dropdown to appear
    await this.page.waitForLoadState('domcontentloaded');
    
    // Find schedule option - try menuitem, option, or button roles
    const scheduleOption = this.page.getByRole('menuitem', { name: schedule }).or(
      this.page.getByRole('option', { name: schedule })
    ).or(
      this.page.getByRole('button', { name: schedule, exact: true })
    ).first();
    await scheduleOption.waitFor({ state: 'visible' });
    await scheduleOption.click();
    
    // Wait for selection to be applied
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Enables Slack integration by checking the Slack checkbox
   */
  async enableSlack(): Promise<void> {
    // Find the Slack card containing "Slack" text
    const slackCard = this.page.locator('.MuiCardContent-root').filter({
      hasText: 'Slack'
    });
    
    // Find the checkbox input to check its state
    const slackCheckboxInput = slackCard.getByTestId('checkbox');
    
    // Find the clickable checkbox wrapper (MuiCheckbox-root span)
    const slackCheckboxWrapper = slackCard.locator('.MuiCheckbox-root');
    
    // Check if already checked
    const isChecked = await slackCheckboxInput.isChecked();
    if (!isChecked) {
      // Click the wrapper span, not the hidden input
      await slackCheckboxWrapper.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Sets the slack channel
   * @param channelName - The slack channel name
   */
  async setSlackChannel(channelName: string): Promise<void> {
    // First enable Slack by checking the checkbox
    await this.enableSlack();
    
    // Wait for slack input to be enabled after checkbox is checked
    await this.slackChannelTextField.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.slackChannelTextField).toBeEnabled({ timeout: 10000 });
    
    await this.slackChannelTextField.click();
    await this.slackChannelTextField.fill(channelName);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Enables Email integration by checking the Email checkbox
   */
  async enableEmail(): Promise<void> {
    // Find the Email card containing "Email" text
    const emailCard = this.page.locator('.MuiCard-root').filter({
      hasText: 'Email'
    });
    
    // Find the checkbox input to check its state
    const emailCheckboxInput = emailCard.getByTestId('checkbox');
    
    // Find the clickable checkbox wrapper (MuiCheckbox-root span)
    const emailCheckboxWrapper = emailCard.locator('.MuiCheckbox-root');
    
    // Check if already checked
    const isChecked = await emailCheckboxInput.isChecked();
    if (!isChecked) {
      // Click the wrapper span, not the hidden input
      await emailCheckboxWrapper.click();
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Clicks the "Manage emails" link to open email management dialog
   */
  async openManageEmails(): Promise<void> {
    await this.enableEmail();
    
    // Find the Email card and click "Manage emails" link
    const emailCard = this.page.locator('.MuiCard-root').filter({
      hasText: 'Email'
    });
    // The link is a span with text "Manage emails"
    const manageEmailsLink = emailCard.locator('text=Manage emails');
    await manageEmailsLink.waitFor({ state: 'visible' });
    await manageEmailsLink.click();
    
    // Wait for dialog to open
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the "+ Add email" button in the manage emails dialog
   * This creates a new email input field
   */
  async clickAddEmailButton(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const addEmailButton = dialog.getByRole('button', { name: /add email/i });
    await addEmailButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Adds an email address in the manage emails dialog
   * @param email - The email address to add
   */
  async addEmail(email: string): Promise<void> {
    // Click "+ Add email" button to create new input field
    await this.clickAddEmailButton();
    
    // Find the new email input (not the disabled default one)
    // The new input should be enabled and empty
    const dialog = this.page.getByRole('dialog');
    const emailInputs = dialog.locator('input[type="text"]').filter({
      has: this.page.locator(':not([disabled])')
    });
    
    // Get the last enabled input (the newly added one)
    const newEmailInput = dialog.locator('input[type="text"]:not([disabled])').last();
    await newEmailInput.waitFor({ state: 'visible' });
    await newEmailInput.fill(email);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fills the last enabled email input with a new value (without clicking Add email)
   * @param email - The email address to fill
   */
  async fillEmailInput(email: string): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const newEmailInput = dialog.locator('input[type="text"]:not([disabled])').last();
    await newEmailInput.waitFor({ state: 'visible' });
    await newEmailInput.clear();
    await newEmailInput.fill(email);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Deletes the last added email (non-default) from the manage emails dialog
   */
  async deleteLastEmail(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    // Find delete button - it's a trash icon button next to the email input
    const deleteButton = dialog.locator('button').filter({
      has: this.page.locator('svg')
    }).last();
    
    // Or look for delete button by aria-label or icon
    const trashButton = dialog.getByRole('button', { name: /delete/i })
      .or(dialog.locator('[aria-label*="delete" i]'))
      .or(dialog.locator('button:has(svg[data-testid*="delete" i])'))
      .or(dialog.locator('.MuiIconButton-root').last());
    
    if (await trashButton.first().isVisible()) {
      await trashButton.first().click();
    } else {
      // Fallback: find the delete icon button near the last input
      const lastEmailRow = dialog.locator('.MuiBox-root').filter({
        has: dialog.locator('input[type="text"]:not([disabled])')
      }).last();
      const deleteBtn = lastEmailRow.locator('button, svg').last();
      await deleteBtn.click();
    }
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clears the email input field
   */
  async clearEmailInput(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const emailInput = dialog.locator('input[type="text"]:not([disabled])').last();
    await emailInput.clear();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Checks if an email validation error is displayed
   * @returns true if validation error is visible
   */
  async hasEmailValidationError(): Promise<boolean> {
    const dialog = this.page.getByRole('dialog');
    
    // Check multiple patterns for validation errors
    const errorPatterns = [
      dialog.locator('.MuiFormHelperText-root.Mui-error'),
      dialog.locator('[class*="error"]'),
      dialog.locator('[aria-invalid="true"]'),
      dialog.locator('.Mui-error'),
      dialog.locator('input.Mui-error'),
      dialog.locator('[class*="Error"]'),
      dialog.locator('text=/invalid|error|valid email/i'),
      dialog.locator('.MuiOutlinedInput-root.Mui-error'),
      dialog.locator('input[aria-invalid="true"]')
    ];
    
    for (const pattern of errorPatterns) {
      try {
        const count = await pattern.count();
        if (count > 0) {
          const isVisible = await pattern.first().isVisible();
          if (isVisible) {
            return true;
          }
        }
      } catch {
        // Continue to next pattern
      }
    }
    return false;
  }

  /**
   * Gets the count of email inputs in the dialog (including default)
   * @returns Number of email inputs
   */
  async getEmailInputCount(): Promise<number> {
    const dialog = this.page.getByRole('dialog');
    const emailInputs = dialog.locator('input[type="text"]');
    return await emailInputs.count();
  }

  /**
   * Saves the email changes and closes the dialog
   */
  async saveEmails(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const saveButton = dialog.getByRole('button', { name: 'Save' });
    await saveButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 10000 });
  }

  /**
   * Cancels and closes the manage emails dialog
   */
  async cancelEmailDialog(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const cancelButton = dialog.getByRole('button', { name: 'Cancel' });
    await cancelButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Closes the manage emails dialog using the X button
   */
  async closeManageEmailsDialog(): Promise<void> {
    const dialog = this.page.getByRole('dialog');
    const closeButton = dialog.getByTestId('dialog-close-button');
    await closeButton.click();
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }

  /**
   * Selects the creative type
   * @param creativeType - The creative type (e.g., 'Video')
   */
  async setCreativeType(creativeType: string): Promise<void> {
    await this.creativeTypeSelect.click();
    
    // Wait for the dropdown to be visible and click the option by ID
    const creativeOption = this.page.locator(`[data-qa-value="${creativeType}"]`);
    await creativeOption.waitFor({ state: 'visible' });
    await creativeOption.click();
    
    // Click outside the dropdown to close it
    await this.page.click('body');
    
    // Wait for the page to stabilize after selection
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Opens geo locations selection and selects the specified geo location
   * @param geoCode - The geo location code (e.g., 'CA' for Canada, 'US' for United States)
   */
  async configureGeoLocations(geoCode: string = 'CA'): Promise<void> {
    const geoDropdown = this.page.getByRole('button', { name: 'Select geo locations' });
    await geoDropdown.click();

    // Wait for dropdown options to be visible
    const geoOption = this.page.locator(`[id="${geoCode}"]`);
    await geoOption.waitFor({ state: 'visible' });
    await geoOption.click();

    // Click outside to close the dropdown
    await this.page.click('body');
    
    // Wait for dropdown to close
    await geoOption.waitFor({ state: 'hidden' });
  }

  /**
   * Clicks the final deploy/activate agent button and waits for creation to complete
   * Works for both activateAgent (Creative Opportunity Spotter) and deployAgent (Marketing Performance Pulse)
   */
  async activateAgent(): Promise<void> {
    // Both buttons have the same name "Deploy Agent"
    await this.activateAgentButton.click();

    // Wait for redirect to agents overview page (with increased timeout for backend processing)
    await this.page.waitForURL('**/agents-client/overview', { timeout: 90000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Waits for the page to load completely
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifies that a specific agent appears in the "Your Agents" section by its name
   * @param agentName - The unique name of the agent to verify
   */
  async expectAgentVisible(agentName: string): Promise<void> {
    await this.waitForPageLoad();
    // Look for the agent name in a paragraph element within an agent card
    const agentNameLocator = this.page
      .locator('[class*="MuiPaper-root"]')
      .getByRole('paragraph')
      .filter({ hasText: new RegExp(`^${agentName}$`) });
    await expect(agentNameLocator.first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Refreshes the page and verifies the agent still appears
   * @param agentName - The unique name of the agent to verify
   */
  async refreshAndExpectAgentVisible(agentName: string): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    await this.expectAgentVisible(agentName);
  }

  /**
   * Clicks the three dots menu button for the agent and then Edit
   * @param agentName - The unique name of the agent to edit
   */
  async editAgent(agentName: string): Promise<void> {
    // Find the agent card by agent name (paragraph containing the exact name)
    const agentCard = this.page
      .locator('[class*="MuiPaper-root"]')
      .filter({
        has: this.page.getByRole('paragraph').filter({ hasText: new RegExp(`^${agentName}$`) }),
      });
    
    // Click the menu button (three dots) - it's the last button with an SVG in the card
    const menuButton = agentCard.locator('button').filter({ has: this.page.locator('svg') }).last();
    await menuButton.click();
    
    // Wait for menu to be visible and click Edit (second menu item)
    const editButton = this.page.getByRole('menuitem').filter({ hasText: /edit/i }).first();
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Updates the schedule in the edit form
   * @param newSchedule - The new schedule to set (e.g., 'Daily at 6:00 PM')
   */
  async updateSchedule(newSchedule: string): Promise<void> {
    // In edit mode, the schedule button shows the current schedule value
    // Find the schedule button by looking for common schedule patterns
    const scheduleButton = this.page.getByRole('button').filter({ 
      hasText: /select Monitoring Schedule|Daily at|Weekly on|Monthly on|No schedule/i 
    }).first();
    await scheduleButton.click();

    // Wait for dropdown to appear and select the new schedule option
    await this.page.waitForLoadState('domcontentloaded');
    
    // Find and click the schedule option - use menuitem or option role if available
    const scheduleOption = this.page.getByRole('menuitem', { name: newSchedule }).or(
      this.page.getByRole('option', { name: newSchedule })
    ).or(
      this.page.getByRole('button', { name: newSchedule, exact: true })
    ).first();
    await scheduleOption.waitFor({ state: 'visible' });
    await scheduleOption.click();
    
    // Wait for the selection to be applied
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clicks the Save settings or Update Agent or Deploy Agent button
   */
  async saveChanges(): Promise<void> {
    const saveButton = this.page.getByRole('button', { name: 'Save settings' })
      .or(this.page.getByRole('button', { name: 'Update Agent' }))
      .or(this.page.getByRole('button', { name: 'Deploy Agent' }))
      .or(this.page.locator('[type="submit"]'));
    await saveButton.click();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for redirect back to overview page
    await this.page.waitForURL('**/agents-client/overview');
  }

  /**
   * Verifies the agent shows the expected schedule within the agent's row
   * @param agentName - The unique name of the agent
   * @param expectedSchedule - The expected schedule text
   */
  async expectAgentSchedule(agentName: string, expectedSchedule: string): Promise<void> {
    await this.waitForPageLoad();
    // Find the agent card containing the agent name and verify schedule text is present
    const agentCard = this.page
      .locator('[class*="MuiPaper-root"]')
      .filter({
        has: this.page.getByRole('paragraph').filter({ hasText: new RegExp(`^${agentName}$`) }),
      });
    const scheduleLocator = agentCard.locator(`text=${expectedSchedule}`);
    await expect(scheduleLocator.first()).toBeVisible({ timeout: 10000 });
  }

  /**
   * Refreshes the page and verifies the agent schedule is still displayed
   * @param agentName - The unique name of the agent
   * @param expectedSchedule - The expected schedule text
   */
  async refreshAndExpectAgentSchedule(agentName: string, expectedSchedule: string): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    await this.expectAgentSchedule(agentName, expectedSchedule);
  }

  /**
   * Clicks the three dots menu and then "Run Now" option
   * Verifies that the run-agent request returns 200 status code
   * @param agentName - The unique name of the agent to run
   */
  async runNowAgent(agentName: string): Promise<void> {
    // Start listening for the run-agent request before clicking
    const runAgentPromise = this.page.waitForResponse(response => 
      response.url().includes('/agents-client/agent-marketplace/agents/run-agent/') && 
      response.request().method() === 'POST'
    );

    // Find the agent card by agent name
    const agentCard = this.page
      .locator('[class*="MuiPaper-root"]')
      .filter({
        has: this.page.getByRole('paragraph').filter({ hasText: new RegExp(`^${agentName}$`) }),
      });
    
    // Click the menu button (three dots)
    const menuButton = agentCard.locator('button').filter({ has: this.page.locator('svg') }).last();
    await menuButton.click();
    
    // Click "Run Now" from the dropdown menu
    const runNowButton = this.page.getByRole('menuitem').filter({ hasText: /run now/i }).first();
    await runNowButton.waitFor({ state: 'visible' });
    await runNowButton.click();

    // Wait for the run-agent request and verify it returns 200
    const response = await runAgentPromise;
    if (response.status() !== 200) {
      throw new Error(`Agent execution failed: Expected 200 but received ${response.status()}`);
    }
  }

  /**
   * Clicks the three dots menu and then Delete
   * @param agentName - The unique name of the agent to delete
   */
  async deleteAgent(agentName: string): Promise<void> {
    // Find the agent card by agent name
    const agentCard = this.page
      .locator('[class*="MuiPaper-root"]')
      .filter({
        has: this.page.getByRole('paragraph').filter({ hasText: new RegExp(`^${agentName}$`) }),
      });
    
    // Click the menu button (three dots)
    const menuButton = agentCard.locator('button').filter({ has: this.page.locator('svg') }).last();
    await menuButton.click();

    // Click Delete from the dropdown menu
    const deleteButton = this.page.getByRole('menuitem').filter({ hasText: /delete/i }).first();
    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();

    // Confirm the deletion in the popup dialog - look for confirm/delete button in dialog
    const confirmDeleteButton = this.page.getByRole('dialog').getByRole('button').filter({ hasText: /delete|confirm/i });
    await confirmDeleteButton.waitFor({ state: 'visible' });
    await confirmDeleteButton.click();
    
    await this.page.waitForLoadState('networkidle');
    await this.expectAgentNotVisible(agentName);
  }

  /**
   * Verifies the agent no longer appears by checking for the specific agent name
   * @param agentName - The unique name of the agent that should not be visible
   */
  async expectAgentNotVisible(agentName: string): Promise<void> {
    await this.waitForPageLoad();
    // Look for the agent name within agent cards - should not exist
    const agentNameLocator = this.page
      .locator('[class*="MuiPaper-root"]')
      .getByRole('paragraph')
      .filter({ hasText: new RegExp(`^${agentName}$`) });
    await expect(agentNameLocator).toHaveCount(0, { timeout: 30000 });
  }

  /**
   * Refreshes and verifies agent is still not visible
   * @param agentName - The unique name of the agent that should not be visible
   */
  async refreshAndExpectAgentNotVisible(agentName: string): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
    await this.expectAgentNotVisible(agentName);
  }
}

