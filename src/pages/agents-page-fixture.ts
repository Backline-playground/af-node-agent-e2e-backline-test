import { test as base } from '@playwright/test';
import { AgentsPage } from './agents.page';
import { loginWithCookie } from '@appsflyer/af-node-playwright-core';

type TestConfig = {
  user: string;
  appID: string;
};

type AgentsFixtures = {
  agentsPage: AgentsPage;
  testConfig: TestConfig;
};

export const test = base.extend<AgentsFixtures>({
  testConfig: [{ user: '', appID: '' }, { option: true }],

  agentsPage: async ({ page, testConfig }, use) => {
    await loginWithCookie(page, testConfig.user);
    const agentsPage = new AgentsPage(page);
    await agentsPage.goto();
    await use(agentsPage);
  }
});

export { expect } from '@playwright/test';

