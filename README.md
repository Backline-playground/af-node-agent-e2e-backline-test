This repository serves for Playwright end-to-end tests for Agenthub UI.


# How to run the Tests on N8s or production:
https://www.notion.so/appsflyerrnd/Agents-Hub-UI-Coverage-26bb7b13af5f80178345f9f2c3069f01


# How to run locally

## 1. Clone repository
https://github.com/appsflyerrnd/af-node-agent-e2e-tests


## 2. Project dependencies

In order to install all the project dependencies, including [af-node-playwright-core](https://gitlab.appsflyer.com/automation_testing/af-node-playwright-core) and [playwright](https://playwright.dev/), just run:

```bash
yarn
```

## 3. Running the tests

To ensure everything is functioning correctly, run the existing Playwright tests by executing:

```bash
export TOKEN="<your personal vault token>"; export ENV_NAME="<either 'prod' or any n8s name>";
export N8S="<true or false depending on the env_name you set>"; npx playwright test
```

# Sanity test per agent, implementation Summary
There is one sanity test file (`generic-agent-lifecycle.spec.ts`) that is reused for all available agents. 
No code duplication for each agent sanity test! 
The test runs the sanity flow for every agent that is added to the 
configurations file (`agent-test-configs.ts`)
The test covers create, edit, run, delete agent.

## Adding a New Agent
To add a new agent, simply add a new object to the `AGENT_TEST_CONFIGS` array:
```typescript
{
  agentDisplayName: 'Your Agent Name',  // Exact name shown in UI
  configureAgentSettings: async (agentsPage, agentName, config) => {
    // Basic settings (required for all agents)
    await agentsPage.setAgentName(agentName);
    await agentsPage.selectApp(config.appID);
    await agentsPage.verifyAppSelected(config.appID);
    await agentsPage.setSchedule(config.initialSchedule);
    await agentsPage.setSlackChannel(config.slackChannel);
    // Add any agent-specific configuration here
    // Example: await agentsPage.configureGeoLocations(config.geoLocation!);
  }
}
```
That's it! The test will automatically be included in the next test run.

### Real Example
Here's the configuration for "Monitor app versions changes" agent:
```typescript
{
    agentDisplayName: 'Monitor app versions changes',
    configureAgentSettings: async (agentsPage: AgentsPage, agentName: string, config: AgentTestConfig) => {
      await agentsPage.setAgentName(agentName);
      await agentsPage.selectApp(config.appID);
      await agentsPage.verifyAppSelected(config.appID);
      await agentsPage.setSchedule(config.initialSchedule);
      await agentsPage.setSlackChannel(config.slackChannel);
  }
}
```
