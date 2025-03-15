import { IDataObject } from 'n8n-workflow';

export class TwitterUtils {
  static createSignatureBaseString(method: string, url: string, parameters: IDataObject): string {
    const params = Object.keys(parameters)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key] as string)}`)
      .join('&');

    return `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(params)}`;
  }

  static createAuthorizationHeader(parameters: IDataObject, signature: string): string {
    const params = Object.keys(parameters)
      .map(key => `${key}="${encodeURIComponent(parameters[key] as string)}"`)
      .join(',');

    return `OAuth ${params},oauth_signature="${encodeURIComponent(signature)}"`;
  }
}
