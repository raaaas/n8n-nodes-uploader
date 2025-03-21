import { ICredentialType, INodeProperties, ICredentialTestRequest } from 'n8n-workflow';
import { OAuth1Helper } from '../nodes/Twitter/TwitterUtils';
import { LoggerProxy } from 'n8n-workflow'; // Import LoggerProxy

export class TwitterApi implements ICredentialType {
    name = 'twitterApi';
    displayName = 'Twitter API';
    documentationUrl = 'https://developer.twitter.com/en/docs/authentication/oauth-1-0a';
//https://api.twitter.com/1.1/account/verify_credentials.json
    test: any = async function (this: any, credentialData: any) {
        console.log('Credential Data:', credentialData);
        const config = {
            consumerKey: credentialData.consumerKey,
            consumerSecret: credentialData.consumerSecret,
            accessToken: credentialData.accessToken,
            accessSecret: credentialData.accessSecret,
        };
        const helper = new OAuth1Helper(config, this);
        try {
            const authHeader = helper.generateAuthHeader({
                url: 'https://api.twitter.com/1.1/statuses/home_timeline.json',
                method: 'GET',
            });
            console.log('Request Headers:', authHeader); // Log the auth header
            return true;
        } catch (error) {
            return false;
        }
    };

    properties: INodeProperties[] = [
        {
            displayName: 'Consumer Key',
            name: 'consumerKey',
            type: 'string',
            default: '',
            required: false,
            description: 'The Consumer Key from your Twitter app',
        },
        {
            displayName: 'Consumer Secret',
            name: 'consumerSecret',
            type: 'string',
            default: '',
            required: false,
             description: 'The Consumer Secret from your Twitter app',
        },
        {
            displayName: 'Access Token',
            name: 'accessToken',
            type: 'string',
            default: '',
            required: false,
             description: 'The Access Token from your Twitter app',
        },
        {
            displayName: 'Access Token Secret',
            name: 'accessSecret',
            type: 'string',
            default: '',
            required: false,
            description: 'The Access Token Secret from your Twitter app',
        },
    ];
}
