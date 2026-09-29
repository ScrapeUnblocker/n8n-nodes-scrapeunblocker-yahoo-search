import { YahooSearchScraper } from './nodes/YahooSearchScraper/YahooSearchScraper.node';
import { ApifyApi } from './credentials/ApifyApi.credentials';

export const nodeTypes = [YahooSearchScraper];

export const credentialTypes = [ApifyApi];
