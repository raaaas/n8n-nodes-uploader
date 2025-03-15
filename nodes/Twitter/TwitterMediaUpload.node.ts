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
import { TwitterUtils } from './TwitterUtils';

export class TwitterMediaUpload implements INodeType {
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const credentials = await this.getCredentials('twitterApi');
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

        if (!items[i].binary?.[binaryPropertyName]) {
          throw new NodeOperationError(this.getNode(), 'No binary data exists on item!');
        }

        // Use the MIME type from the binary data
        const mediaType = items[i].binary![binaryPropertyName].mimeType;

        if (!mediaType || !mediaType.startsWith('image/')) {
          throw new NodeOperationError(
            this.getNode(),
            `Invalid media type: ${mediaType}. Only images are supported.`
          );
        }

        const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

        // Verify binary data is valid
        if (!Buffer.isBuffer(binaryData) || binaryData.length === 0) {
          throw new NodeOperationError(this.getNode(), 'Invalid binary data: Buffer is empty or not a valid Buffer');
        }

        const oauth = {
          consumer_key: credentials.consumerKey as string,
          consumer_secret: credentials.consumerSecret as string,
          token: credentials.accessToken as string,
          token_secret: credentials.accessTokenSecret as string,
        };

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

        // Create a proper boundary for multipart form data
        const boundary = `------------------------${Date.now()}`;

        // Create the form data manually
        const formDataStart = `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="${
          items[i].binary![binaryPropertyName].fileName || 'image.jpg'
        }"\r\nContent-Type: ${mediaType}\r\n\r\n`;
        const formDataEnd = `\r\n--${boundary}--\r\n`;

        // Combine the parts into a single buffer
        const formDataBuffer = Buffer.concat([
          Buffer.from(formDataStart, 'utf-8'),
          binaryData,
          Buffer.from(formDataEnd, 'utf-8'),
        ]);

        const options = {
          method: 'POST' as IHttpRequestMethods,
          url: 'https://upload.twitter.com/1.1/media/upload.json',
          headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': formDataBuffer.length.toString(),
            Authorization: authHeader,
          },
          body: formDataBuffer,
          resolveWithFullResponse: true,
        };

        try {
          // Use the binary-capable request method
          const response = await this.helpers.httpRequest(options);
          const responseData = JSON.parse(response.body.toString());

          returnData.push({
            json: {
              media_id: responseData.media_id_string,
              ...responseData,
            },
          });
        } catch (error) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: error.message,
                details: error.response?.body ? JSON.parse(error.response.body.toString()) : undefined,
                statusCode: error.response?.statusCode
              }
            });
            continue;
          }
          throw error;
        }
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
