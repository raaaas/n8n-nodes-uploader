import crypto from 'crypto';
import { NodeOperationError, INode } from 'n8n-workflow';
const OAuth1 = require('oauth-1.0a');

interface GenerateOAuthHeaderParams {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessSecret: string;
  method: string;
  url: string;
  params?: { [key: string]: string };
}

export class OAuth1Helper {
  private readonly consumerKey: string;
  private readonly consumerSecret: string;
  private accessToken?: string;
  private accessSecret?: string;
  private readonly node: INode;

  constructor(config: OAuth1Config, node: INode) {
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.accessToken = config.accessToken;
    this.accessSecret = config.accessSecret;
    this.node = node;

    this.validateParameters();
  }

  public generateAuthHeader(requestData: RequestData): string {
    if (!this.accessToken || !this.accessSecret) {
      throw new NodeOperationError(this.node, 'Missing required OAuth parameters: accessToken and accessSecret');
    }

    const oauth = new OAuth1({
      consumer: {
        key: this.consumerKey,
        secret: this.consumerSecret,
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string: string, key: string) {
        return crypto
          .createHmac('sha1', key)
          .update(base_string)
          .digest('base64');
      },
    });

    const token = {
      key: this.accessToken,
      secret: this.accessSecret,
    };

    const authHeader = oauth.authorize(requestData, token);

    return oauth.toHeader(authHeader).Authorization;
  }

  private validateParameters(): void {
    const required = [
      { field: 'consumerKey', value: this.consumerKey },
      { field: 'consumerSecret', value: this.consumerSecret },
    ];

    for (const { field, value } of required) {
      if (!value) {
        throw new NodeOperationError(this.node, `Missing required OAuth parameter: ${field}`);
      }
    }
  }
}

interface OAuth1Config {
  consumerKey: string;
  consumerSecret: string;
  accessToken?: string;
  accessSecret?: string;
  signatureMethod?: 'HMAC-SHA1' | 'RSA-SHA1';
  nonceLength?: number;
  version?: string;
}

interface RequestData {
  url: string;
  method: string;
  params?: Record<string, string>;
}

export { };
