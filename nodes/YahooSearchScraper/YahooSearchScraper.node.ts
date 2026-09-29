import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import type { OptionField } from './GenericFunctions';
import { applyOptions, requireList, runActorAndGetItems } from './GenericFunctions';

// ScrapeUnblocker's public "Yahoo Search Scraper" Actor: https://apify.com/scrapeunblocker/yahoo-search-scraper
const ACTOR_ID = '5Ttikn1PCddZQIQfr';
const INTEGRATION_APP_ID = 'scrapeunblocker-yahoo-search-scraper';

// Node option name -> Actor input key.
const OPTION_FIELDS: Record<string, OptionField> = {
	proxyCountry: {
		key: 'proxy_country',
	},
	language: {
		key: 'language',
	},
	includeAds: {
		key: 'include_ads',
	},
	concurrency: {
		key: 'concurrency',
	},
};

function buildActorInput(
	this: IExecuteFunctions,
	resource: string,
	operation: string,
	options: IDataObject,
	itemIndex: number,
): IDataObject {
	const input: IDataObject = {};

	switch (`${resource}:${operation}`) {
		case 'result:search': {
			input.keywords = requireList.call(this, 'keywords', 'Search Queries', itemIndex, true);
			input.pages_to_check = this.getNodeParameter('pagesToCheck', itemIndex);
			break;
		}
		default:
			throw new NodeOperationError(
				this.getNode(),
				`The operation "${operation}" is not supported for resource "${resource}"`,
				{ itemIndex },
			);
	}

	applyOptions(input, options, OPTION_FIELDS);
	return input;
}

export class YahooSearchScraper implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Yahoo Search Scraper',
		name: 'yahooSearchScraper',
		icon: {
			light: 'file:yahooSearchScraper.png',
			dark: 'file:yahooSearchScraper.dark.png',
		},
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search Yahoo and get organic results and ads with the ScrapeUnblocker Actor on Apify',
		defaults: {
			name: 'Yahoo Search Scraper',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'apifyApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Result',
						value: 'result',
					},
				],
				default: 'result',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['result'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search Yahoo for one or more queries',
						action: 'Search results',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Search Queries',
				name: 'keywords',
				type: 'string',
				required: true,
				typeOptions: {
					rows: 3,
				},
				default: '',
				placeholder: 'espresso machine',
				description:
					'One or more Yahoo search queries, one per line. Each query is searched separately.',
				displayOptions: {
					show: {
						resource: ['result'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Result Pages',
				name: 'pagesToCheck',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 10,
				},
				default: 1,
				description:
					'How many result pages to fetch per query (1-10). Each page returns about 7 organic results plus the ads Yahoo shows on it.',
				displayOptions: {
					show: {
						resource: ['result'],
						operation: ['search'],
					},
				},
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Ads',
						name: 'includeAds',
						type: 'boolean',
						default: true,
						description:
							'Whether to also return the paid results shown above and below the organic list',
					},
					{
						displayName: 'Language',
						name: 'language',
						type: 'string',
						default: '',
						placeholder: 'en',
						description:
							"Only return results in this language, as an ISO-639-1 code (e.g. en or de). Leave empty for the regional site's default.",
					},
					{
						displayName: 'Parallel Queries',
						name: 'concurrency',
						type: 'number',
						typeOptions: {
							minValue: 1,
							maxValue: 5,
						},
						default: 3,
						description: 'How many queries to search at the same time (1-5)',
					},
					{
						displayName: 'Search From Country',
						name: 'proxyCountry',
						type: 'options',
						options: [
							{
								name: 'Australia (AU)',
								value: 'AU',
							},
							{
								name: 'Austria (AT)',
								value: 'AT',
							},
							{
								name: 'Belgium (BE)',
								value: 'BE',
							},
							{
								name: 'Brazil (BR)',
								value: 'BR',
							},
							{
								name: 'Canada (CA)',
								value: 'CA',
							},
							{
								name: 'Czechia (CZ)',
								value: 'CZ',
							},
							{
								name: 'Denmark (DK)',
								value: 'DK',
							},
							{
								name: 'Estonia (EE)',
								value: 'EE',
							},
							{
								name: 'Finland (FI)',
								value: 'FI',
							},
							{
								name: 'France (FR)',
								value: 'FR',
							},
							{
								name: 'Germany (DE)',
								value: 'DE',
							},
							{
								name: 'India (IN)',
								value: 'IN',
							},
							{
								name: 'Ireland (IE)',
								value: 'IE',
							},
							{
								name: 'Italy (IT)',
								value: 'IT',
							},
							{
								name: 'Japan (JP)',
								value: 'JP',
							},
							{
								name: 'Latvia (LV)',
								value: 'LV',
							},
							{
								name: 'Lithuania (LT)',
								value: 'LT',
							},
							{
								name: 'Mexico (MX)',
								value: 'MX',
							},
							{
								name: 'Netherlands (NL)',
								value: 'NL',
							},
							{
								name: 'Norway (NO)',
								value: 'NO',
							},
							{
								name: 'Poland (PL)',
								value: 'PL',
							},
							{
								name: 'Portugal (PT)',
								value: 'PT',
							},
							{
								name: 'Romania (RO)',
								value: 'RO',
							},
							{
								name: 'Singapore (SG)',
								value: 'SG',
							},
							{
								name: 'South Korea (KR)',
								value: 'KR',
							},
							{
								name: 'Spain (ES)',
								value: 'ES',
							},
							{
								name: 'Sweden (SE)',
								value: 'SE',
							},
							{
								name: 'Switzerland (CH)',
								value: 'CH',
							},
							{
								name: 'United Kingdom (GB)',
								value: 'GB',
							},
							{
								name: 'United States (US)',
								value: 'US',
							},
						],
						default: 'US',
						description:
							'The country the search runs from. It sets the result market and the ads shown.',
					},
					{
						displayName: 'Timeout (Seconds)',
						name: 'timeout',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description:
							'Maximum run time of the Apify Actor run. 0 keeps the Actor default. A run that times out fails the node.',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const options = this.getNodeParameter('options', i, {}) as IDataObject;
				const { timeout, ...actorOptions } = options;

				const input = buildActorInput.call(this, resource, operation, actorOptions, i);
				const { items: results } = await runActorAndGetItems.call(this, {
					actorId: ACTOR_ID,
					integrationAppId: INTEGRATION_APP_ID,
					input,
					itemIndex: i,
					timeoutSecs: (timeout as number) || undefined,
				});

				for (const result of results) {
					returnData.push({ json: result, pairedItem: { item: i } });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: i },
					});
					continue;
				}
				// Both constructors return an error of their own class unchanged.
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
