import { INodeType } from 'n8n-workflow';

// Import your node classes
import { TwitterBinaryCheck } from '../nodes/Twitter/TwitterBinaryCheck.node';
import { TwitterMediaUpload } from '../nodes/Twitter/TwitterMediaUpload.node';

// Export the nodes using the correct namespace format required by n8n
export const nodeTypes: INodeType[] = [
  new TwitterBinaryCheck(),
  new TwitterMediaUpload(),
];
