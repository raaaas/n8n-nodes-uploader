import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TwitterApi implements ICredentialType {
	name = 'twitterApi';
	displayName = 'Twitter API';
	documentationUrl = 'https://developer.twitter.com/en/docs/authentication/oauth-1-0a';
	properties: INodeProperties[] = [
		{
			displayName: 'Consumer Key',
			name: 'consumerKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Consumer Secret',
			name: 'consumerSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
		{
			displayName: 'Access Token Secret',
			name: 'accessTokenSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];
}
