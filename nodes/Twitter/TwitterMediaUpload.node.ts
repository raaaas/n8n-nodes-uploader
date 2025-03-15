import {
IDataObject,
IExecuteFunctions,
INodeExecutionData,
INodeType,
INodeTypeDescription,
NodeOperationError,
IHttpRequestMethods,
} from 'n8n-workflow';
import { createHmac } from 'crypto';
import FormData from 'form-data';
import { TwitterUtils } from './TwitterUtils';

export class Twitter implements INodeType {
description: INodeTypeDescription = {
displayName: 'Twitter Media Upload',
name: 'twitterMediaUpload',
group: ['transform'],
version: 1,
description: 'Upload media to Twitter',
defaults: {
name: 'Twitter Media Upload',
},
inputs: ['main'],
outputs: ['main'],
credentials: [
{
name: 'twitterApi',
required: true,
},
],
properties: [
{
displayName: 'Binary Property',
name: 'binaryPropertyName',
type: 'string',
default: 'data',
required: true,
description: 'Name of the binary property containing the image file',
},
{
displayName: 'Media Type',
name: 'mediaType',
type: 'options',
options: [
{
name: 'Image',
value: 'image/jpeg',
},
{
name: 'PNG',
value: 'image/png',
},
{
name: 'GIF',
value: 'image/gif',
},
],
default: 'image/jpeg',
description: 'The type of media being uploaded',
},
],
};

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
const items = this.getInputData();
const returnData: INodeExecutionData[] = [];

for (let i = 0; i < items.length; i++) {
try {
const credentials = await this.getCredentials('twitterApi');
const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
const mediaType = this.getNodeParameter('mediaType', i) as string;

if (!items[i].binary?.[binaryPropertyName]) {
throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
}

const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
const oauth = {
consumer_key: credentials.consumerKey as string,
consumer_secret: credentials.consumerSecret as string,
token: credentials.accessToken as string,
token_secret: credentials.accessTokenSecret as string,
};

const form = new FormData();
form.append('media', binaryData, {
contentType: mediaType,
filename: items[i].binary![binaryPropertyName].fileName,
});

const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = Buffer.from(Math.random().toString()).toString('base64');

const parameters: IDataObject = {
oauth_consumer_key: oauth.consumer_key,
oauth_token: oauth.token,
oauth_signature_method: 'HMAC-SHA1',
oauth_timestamp: timestamp,
oauth_nonce: nonce,
oauth_version: '1.0',
};

const baseString = TwitterUtils.createSignatureBaseString(
'POST',
'https://upload.twitter.com/1.1/media/upload.json',
parameters,
);

const signingKey = `${encodeURIComponent(oauth.consumer_secret)}&${encodeURIComponent(
oauth.token_secret,
)}`;

const signature = createHmac('sha1', signingKey)
.update(baseString)
.digest('base64');

const authHeader = TwitterUtils.createAuthorizationHeader(parameters, signature);

const options = {
method: 'POST' as IHttpRequestMethods,
url: 'https://upload.twitter.com/1.1/media/upload.json',
headers: {
Authorization: authHeader,
},
body: form,
json: true,
};

const response = await this.helpers.request(options);

returnData.push({
json: {
media_id: response.media_id_string,
...response,
},
});
} catch (error) {
if (this.continueOnFail()) {
returnData.push({ json: { error: error.message } });
continue;
}
throw error;
}
}

return [returnData];
}
}
