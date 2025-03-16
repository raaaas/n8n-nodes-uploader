import { ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';

export class TwitterApi implements ICredentialType {
    name = 'twitterApi';
    displayName = 'Twitter API';
    documentationUrl = 'https://developer.twitter.com/en/docs/authentication/oauth-1-0a';

    // Add the test property for connection testing
    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://api.twitter.com/1.1',
            url: '/account/verify_credentials.json',
            method: 'GET',
        },
    };

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
