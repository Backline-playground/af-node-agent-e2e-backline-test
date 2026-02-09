import { generateRandString } from '../src/test-helpers';
import type { AgentsPage } from '../src/pages/agents.page';

/**
 * Base configuration interface for all agent tests
 */
export interface AgentTestConfig {
  agentDisplayName: string;
  configureAgentSettings: (agentsPage: AgentsPage, agentName: string, config: AgentTestConfig) => Promise<void>;
  // Optional fields that can override defaults
  getAgentName?: () => string;
  user?: string;
  appID?: string;
  slackChannel?: string;
  initialSchedule?: string;
  updatedSchedule?: string;
  // Optional fields for specific agent types
  creativeType?: string;
  geoLocation?: string;
}

/**
 * Default configuration values for all agents
 * These can be overridden in individual agent configs
 */
const DEFAULT_CONFIG = {
  user: 'qualityguild.advertiser',
  appID: 'android.non.organic.regular',
  slackChannel: 'rnd-arch-data-availability-poc',
  initialSchedule: 'Daily at 6:00 PM',
  updatedSchedule: 'Daily at 12:00 PM'
} as const;

/**
 * Default function to generate agent name from display name
 * Removes spaces and special characters, appends random string
 */
const createDefaultGetAgentName = (agentDisplayName: string) => {
  return () => {
    const prefix = agentDisplayName.replace(/\s+/g, '');
    return `${prefix}_${generateRandString(8)}`;
  };
};

/**
 * Agent test configurations
 * Only required fields: agentDisplayName, configureAgentSettings
 * All other fields use defaults unless explicitly overridden
 */
const AGENT_CONFIGS: AgentTestConfig[] = [
  {
    agentDisplayName: 'Monitor app versions changes',
    configureAgentSettings: async (agentsPage: AgentsPage, agentName: string, config: AgentTestConfig) => {
      await agentsPage.setAgentName(agentName);
      await agentsPage.selectApp(config.appID);
      await agentsPage.verifyAppSelected(config.appID);
      await agentsPage.setSchedule(config.initialSchedule);
      await agentsPage.setSlackChannel(config.slackChannel);
    }
  },
  {
    agentDisplayName: 'Deep research analysis',
    // This agent only has 2 scheduling options: No schedule (default), Weekly on Monday
    // Skip setting initial schedule - agent defaults to 'No schedule'
    // Update step will change to 'Weekly on Monday'
    updatedSchedule: 'Weekly on Monday',
    configureAgentSettings: async (agentsPage: AgentsPage, agentName: string, config: AgentTestConfig) => {
      await agentsPage.setAgentName(agentName);
      await agentsPage.selectApp(config.appID);
      await agentsPage.verifyAppSelected(config.appID);
      // Skip setSchedule - agent defaults to 'No schedule'
      await agentsPage.setSlackChannel(config.slackChannel);
    }
  },
//   {
//     agentDisplayName: 'Spot creative opportunities',
//     // Override defaults for this agent
//     initialSchedule: 'Daily at 12:00 PM',
//     updatedSchedule: 'Daily at 6:00 PM',
//     creativeType: 'video',
//     geoLocation: 'CA',
//     configureAgentSettings: async (agentsPage: AgentsPage, agentName: string, config: AgentTestConfig) => {
//       await agentsPage.setAgentName(agentName);
//       await agentsPage.selectApp(config.appID);
//       await agentsPage.verifyAppSelected(config.appID);
//       await agentsPage.setSchedule(config.initialSchedule);
//       await agentsPage.setSlackChannel(config.slackChannel);
//       await agentsPage.setCreativeType(config.creativeType!);
//       await agentsPage.configureGeoLocations(config.geoLocation!);
//     }
//   }
];

/**
 * Export agent configs with defaults applied
 * This merges DEFAULT_CONFIG with each agent config, allowing individual agents to override defaults
 * If getAgentName is not provided, generates one from agentDisplayName
 */
export const AGENT_TEST_CONFIGS: AgentTestConfig[] = AGENT_CONFIGS.map(config => ({
  ...DEFAULT_CONFIG,
  ...config,
  getAgentName: config.getAgentName || createDefaultGetAgentName(config.agentDisplayName)
}));

