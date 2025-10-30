import { WebClient } from '@slack/web-api';
import { config } from './environment.config';

export const slackClient = new WebClient(config.slack.botToken);

export const slackConfig = {
  enabled: !!config.slack.botToken,
  channelSupport: config.slack.channelSupport,
  signingSecret: config.slack.signingSecret,
};