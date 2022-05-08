import {config} from 'dotenv';
import { loggerService } from './logger.js';

export class ConfigService {
  constructor () {
    const result = config();

    if (result.error) {
      loggerService.error('[ConfigService] Can\'t read .env file or he\'s missing');
    } else {
      loggerService.log('[ConfigService] Configuration .env loaded');
      this.config = result.parsed;
    }
  }
  get(key) {
    return this.config[key];
  }
};

const _ = new ConfigService();

export { _ as configService };
