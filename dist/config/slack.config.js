"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackConfig = exports.slackClient = void 0;
const web_api_1 = require("@slack/web-api");
const environment_config_1 = require("./environment.config");
exports.slackClient = new web_api_1.WebClient(environment_config_1.config.slack.botToken);
exports.slackConfig = {
    enabled: !!environment_config_1.config.slack.botToken,
    channelSupport: environment_config_1.config.slack.channelSupport,
    signingSecret: environment_config_1.config.slack.signingSecret,
};
//# sourceMappingURL=slack.config.js.map