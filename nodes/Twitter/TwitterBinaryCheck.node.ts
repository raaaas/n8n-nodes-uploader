import {
IExecuteFunctions,
INodeExecutionData,
INodeType,
INodeTypeDescription,
} from 'n8n-workflow';

export class TwitterBinaryCheck implements INodeType {
description: INodeTypeDescription = {
displayName: 'Twitter Binary Check',
    name: 'twitterBinaryCheck',
icon: 'file:twitter.svg',
group: ['transform'],
version: 1,
description: 'Checks and ensures correct binary data property for Twitter upload',
defaults: {
name: 'Twitter Binary Check',
},
inputs: ['main'],
outputs: ['main'],
properties: [], // No configuration needed for this node
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		const returnData: INodeExecutionData[] = [];

// Process all items, not just the first one
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  console.log(`Processing item ${i + 1}/${items.length}`);

  const binaryKeys = Object.keys(item.binary || {});
  console.log(`Binary properties available for item ${i + 1}:`, binaryKeys);

  if (binaryKeys.length > 0) {
    // Find the first image property
    const imageKey = binaryKeys.find(key =>
      item.binary![key].mimeType?.startsWith('image/')
    );

    if (imageKey) {
      console.log(`Found image property: ${imageKey}`);
      // Normalize to 'data' property as expected by TwitterMediaUpload
      returnData.push({
        json: {
          ...item.json,
          originalProperty: imageKey,
        },
        binary: {
          data: item.binary![imageKey],
        },
      });
      console.log('Binary data normalized to "data" property');
    } else {
      console.log('No image property found in binary data');
      returnData.push(item);
    }
  } else {
    console.log('No binary properties found');
    returnData.push(item);
  }
}

		return [returnData];
	}
}
