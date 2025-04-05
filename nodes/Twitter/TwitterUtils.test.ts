require('dotenv').config();
import { OAuth1Helper } from './TwitterUtils';
import { NodeOperationError, INode } from 'n8n-workflow';
import { TwitterMediaUpload } from './TwitterMediaUpload.node';
import fs from 'fs';
import axios from 'axios';

describe('TwitterUtils', () => {

	describe('OAuth1Helper', () => {
		let node: INode;

		beforeEach(() => {
			node = {
				context: {
					getInstance: jest.fn(),
				},
			} as unknown as INode;
		});

		it('should create an OAuth1Helper instance', () => {
			const config = {
				consumerKey: 'consumerKey',
				consumerSecret: 'consumerSecret',
				accessToken: 'accessToken',
				accessSecret: 'accessSecret',
			};
			const helper = new OAuth1Helper(config, node);
			expect(helper).toBeInstanceOf(OAuth1Helper);
		});

		it('should throw an error if consumerKey is missing', () => {
			const config = {
				consumerKey: '',
				consumerSecret: 'consumerSecret',
				accessToken: 'accessToken',
				accessSecret: 'accessSecret',
			};
			expect(() => new OAuth1Helper(config, node)).toThrowError('Missing required OAuth parameter: consumerKey');
		});

		it('should throw an error if consumerSecret is missing', () => {
			const config = {
				consumerKey: 'consumerKey',
				consumerSecret: '',
				accessToken: 'accessToken',
				accessSecret: 'accessSecret',
			};
			expect(() => new OAuth1Helper(config, node)).toThrowError('Missing required OAuth parameter: consumerSecret');
		});

		it('should generate an auth header', () => {
			const config = {
				consumerKey: 'consumerKey',
				consumerSecret: 'consumerSecret',
				accessToken: 'accessToken',
				accessSecret: 'accessSecret',
			};
			const helper = new OAuth1Helper(config, node);
			const header = helper.generateAuthHeader({
				url: 'https://api.twitter.com/1.1/statuses/home_timeline.json',
				method: 'GET',
			});
			expect(header).toContain('OAuth');
			expect(header).toContain('oauth_consumer_key="consumerKey"');
			expect(header).toContain('oauth_token="accessToken"');
		});

		it('should throw an error if accessToken or accessSecret is missing when generating auth header', () => {
			const config = {
				consumerKey: 'consumerKey',
				consumerSecret: 'consumerSecret',
			};
			const helper = new OAuth1Helper(config, node);
			expect(() => helper.generateAuthHeader({
				url: 'https://api.twitter.com/1.1/statuses/home_timeline.json',
				method: 'GET',
			})).toThrowError('Missing required OAuth parameters: accessToken and accessSecret');
		});
		});

	describe('TwitterMediaUpload', () => {
		it('should upload a media file', async () => {
			const twitterMediaUpload = new TwitterMediaUpload();
			// const executeMock = jest.spyOn(twitterMediaUpload, 'execute' as any);
			// executeMock.mockImplementation(() => {
			// 	return Promise.resolve([[{ json: { success: true } }]]);
			// });

			const node: INode = {
				context: {
					getInstance: jest.fn(),
				},
			} as unknown as INode;

			const credentials = {
				consumerKey: process.env.TWITTER_CONSUMER_KEY,
				consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
				accessToken: process.env.TWITTER_ACCESS_TOKEN,
				accessSecret: process.env.TWITTER_ACCESS_SECRET,
				  userId: process.env.TWITTER_USER_ID,
			};
			const imageUrl = 'https://fastly.picsum.photos/id/544/200/300.jpg?hmac=YL3M_fg_84Kqg0EQTvbltmjeGeQetARWPFA5YLn5hS0';
			const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'binary');

			const binaryData = {
				data: buffer.toString('base64'),
				mimeType: 'image/jpeg',
				fileName: 'test.jpg',
			};

			const input = [
				{
					json: {},
					binary: {
						data: binaryData,
					},
				},
			];

			const context = {
				getInputData: jest.fn().mockReturnValue(input),
				getNodeParameter: jest.fn().mockReturnValue('data'),
				getCredentials: jest.fn().mockReturnValue({
				      consumerKey: process.env.TWITTER_CONSUMER_KEY,
				      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
				      accessToken: process.env.TWITTER_ACCESS_TOKEN,
				      accessSecret: process.env.TWITTER_ACCESS_SECRET,
				      userId: process.env.TWITTER_USER_ID,
				    }),
				helpers: {
					getBinaryDataBuffer: jest.fn().mockReturnValue(buffer),
				},
				getNode: jest.fn().mockReturnValue(node),
				continueOnFail: jest.fn().mockReturnValue(false),
			} as any;

			const result = await (twitterMediaUpload.execute as any).apply(context);
			expect(result[0][0].json.success).toEqual(true);
		}, 30000);
	});
});
