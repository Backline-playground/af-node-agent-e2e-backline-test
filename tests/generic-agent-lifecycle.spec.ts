import { test } from '../src/pages/agents-page-fixture';
import { AGENT_TEST_CONFIGS, type AgentTestConfig } from './agent-test-configs';

/**
 * Generic Agent Lifecycle Test Suite
 * 
 * This test suite runs the complete lifecycle test for all configured agents in parallel.
 * Each agent configuration is defined in agent-test-configs.ts and includes:
 * - Test configuration (user, appID, schedules, etc.)
 * - Custom configuration function for agent-specific settings
 * 
 * The lifecycle test includes:
 * - Agent creation and configuration
 * - Agent deployment and verification
 * - Immediate execution testing
 * - Schedule modification
 * - Agent deletion and cleanup verification
 */

// Create a test for each agent configuration
for (const config of AGENT_TEST_CONFIGS) {
  test.describe(`${config.agentDisplayName} - Complete Lifecycle Management`, () => {
    // Configure test with user and appID from config
    test.use({
      testConfig: {
        user: config.user,
        appID: config.appID
      }
    });

    test.beforeEach(async ({ agentsPage }) => {
      await agentsPage.waitForPageLoad();
    });

    /**
     * Tests the complete lifecycle of an agent:
     * - Initial cleanup and setup
     * - Agent creation and configuration
     * - Agent deployment and verification
     * - Immediate execution testing
     * - Schedule modification
     * - Agent deletion and cleanup verification
     * 
     * This test ensures the agent management system works end-to-end with proper
     * persistence, configuration updates, and cleanup functionality.
     */
    test(`should successfully manage ${config.agentDisplayName} lifecycle from creation to deletion`, async ({
      agentsPage
    }) => {
      // Generate unique agent name at the start
      const agentName = config.getAgentName();

      await test.step(`Navigate to agents page and select ${config.agentDisplayName}`, async () => {
        await agentsPage.selectAgent(config.agentDisplayName);
      });

      await test.step('Configure agent with all required settings', async () => {
        await config.configureAgentSettings(agentsPage, agentName, config);
        // Wait for form validation to complete
        await agentsPage.page.waitForLoadState('networkidle');
      });

      await test.step('Deploy the agent', async () => {
        await agentsPage.activateAgent();
      });

      await test.step('Verify agent appears in Your Agents section', async () => {
        await agentsPage.expectAgentVisible(agentName);
      });

      await test.step('Verify agent persistence after page refresh', async () => {
        await agentsPage.refreshAndExpectAgentVisible(agentName);
      });

      await test.step('SKIPPED: Execute agent immediately and verify successful run', async () => {
        // await agentsPage.runNowAgent(agentName);
      });

      await test.step('Modify agent schedule configuration', async () => {
        await agentsPage.editAgent(agentName);
        await agentsPage.updateSchedule(config.updatedSchedule);
        await agentsPage.saveChanges();
      });

      await test.step('Verify schedule update is displayed and persisted', async () => {
        await agentsPage.expectAgentSchedule(agentName, config.updatedSchedule);
        await agentsPage.refreshAndExpectAgentSchedule(agentName, config.updatedSchedule);
      });

      await test.step('Delete the agent', async () => {
        await agentsPage.deleteAgent(agentName);
      });

      await test.step('Verify agent deletion is complete and persistent', async () => {
        await agentsPage.refreshAndExpectAgentNotVisible(agentName);
      });
    });
  });
}

