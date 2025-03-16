import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeApiError,
} from 'n8n-workflow';

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
        description: 'Name of the binary property that contains the image from the Image Format Converter',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Validate credentials first
    const credentials = await this.getCredentials('twitterApi');
    if (!credentials) {
      throw new NodeOperationError(this.getNode(), 'No credentials provided');
    }

    // Validate required OAuth fields
    const requiredFields = ['consumerKey', 'consumerSecret', 'accessToken', 'accessTokenSecret'];
    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new NodeOperationError(this.getNode(), `Missing required credential field: ${field}`);
      }
    }

    // Log credential status (without sensitive data)
    console.log('Twitter credentials status:', {
      hasConsumerKey: !!credentials.consumerKey,
      hasConsumerSecret: !!credentials.consumerSecret,
      hasAccessToken: !!credentials.accessToken,
      hasAccessTokenSecret: !!credentials.accessTokenSecret,
    });

    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        // Get the binary property name (e.g., "data" from the previous node)
        const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;

        // Debug log available binary properties
        console.log('Available binary properties:', Object.keys(items[i].binary || {}));
        console.log('Requested binary property:', binaryPropertyName);

        // Check if binary data exists
        if (!items[i].binary?.[binaryPropertyName]) {
          // Log more detailed information about the item structure
          console.log('Full item structure:', JSON.stringify(items[i], null, 2));
          throw new NodeOperationError(
            this.getNode(),
            `No binary data found in property "${binaryPropertyName}". Available properties: ${Object.keys(items[i].binary || {}).join(', ') || 'none'}`
          );
        }

        // Extract binary data and metadata
        const binaryData = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
        const mediaType = items[i].binary![binaryPropertyName].mimeType;
        const fileName = items[i].binary![binaryPropertyName].fileName || 'image.jpg';

        // Validate binary data and media type
        if (!mediaType || !mediaType.startsWith('image/')) {
          throw new NodeOperationError(
            this.getNode(),
            `Invalid media type: ${mediaType}. Only images are supported.`
          );
        }
        if (!Buffer.isBuffer(binaryData) || binaryData.length === 0) {
          throw new NodeOperationError(
            this.getNode(),
            'Invalid binary data: Buffer is empty or not a valid Buffer'
          );
        }

        // Debug log binary data details
        console.log('Binary data details:', {
          fileName,
          mediaType,
          dataSize: binaryData.length,
        });

        // Define request options with correct formData structure for Twitter API
        const options = {
          url: 'https://upload.twitter.com/1.1/media/upload.json',
          method: 'POST',
          formData: {
            media_data: binaryData.toString('base64'), // Twitter API expects base64 encoded data
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          json: true,
          resolveWithFullResponse: true,
        };

        // Debug log request options (excluding binary data)
        console.log('Request options:', {
          ...options,
          formData: { media_data: '[BASE64_DATA]' }, // Omit actual data from logs
        });

        // Send the request using n8n's OAuth1 helper with enhanced error handling
        let response;
        try {
          response = await this.helpers.requestOAuth1.call(this, 'twitterApi', options);
        } catch (error) {
          console.error('OAuth request error:', error);
          if (error.statusCode === 401) {
            throw new NodeApiError(this.getNode(), error, {
              message: 'OAuth credentials not connected or invalid',
              description: 'Please verify your Twitter API credentials are correct and have the necessary permissions.',
            });
          }
          throw error;
        }

        // Log response status and headers
        console.log('Response status:', response.statusCode);
        console.log('Response headers:', response.headers);

        // Check for success
        if (response.statusCode !== 200) {
          console.log('Error response body:', response.body);
          throw new NodeApiError(this.getNode(), response, {
            message: `Twitter API Error: ${response.statusMessage}`,
            description: 'Failed to upload media to Twitter',
          });
        }

        // Add the response to the output
        returnData.push({
          json: {
            success: true,
            media_id: response.body.media_id_string,
            ...response.body,
          },
        });
      } catch (error) {
        // Enhanced error handling with OAuth specific checks
        if (error.name === 'NodeApiError' && error.message.includes('OAuth')) {
          // Don't continue on OAuth errors even if continueOnFail is true
          throw error;
        }

        // Handle other errors gracefully
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              success: false,
              error: error.message,
              details: error.response?.body
            }
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
