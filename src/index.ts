import type { INodeType, ICredentialType } from 'n8n-workflow';
import { TwitterMediaUpload } from '../nodes/Twitter/TwitterMediaUpload.node';
import { TwitterBinaryCheck } from '../nodes/Twitter/TwitterBinaryCheck.node';
import { TwitterApi } from '../credentials/TwitterApi.credentials';

const nodeTypes: INodeType[] = [
	new TwitterMediaUpload(),
	new TwitterBinaryCheck(),
];

const credentialTypes: ICredentialType[] = [
	new TwitterApi(),
];

export { nodeTypes, credentialTypes };
