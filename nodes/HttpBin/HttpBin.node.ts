import {
IExecuteFunctions,
INodeExecutionData,
INodeType,
INodeTypeDescription,
IHttpRequestMethods,
} from 'n8n-workflow';
import { httpVerbFields } from './HttpVerbDescription';

export class HttpBin implements INodeType {
description: INodeTypeDescription = {
displayName: 'HttpBin',
name: 'httpBin',
icon: 'file:httpbin.svg',
group: ['transform'],
version: 1,
description: 'Interact with HttpBin API',
defaults: {
name: 'HttpBin',
},
inputs: ['main'],
outputs: ['main'],
credentials: [
{
name: 'httpbinApi',
required: true,
},
],
properties: [...httpVerbFields],
};

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
const items = this.getInputData();
const returnData: INodeExecutionData[] = [];
const operation = this.getNodeParameter('operation', 0) as string;

for (let i = 0; i < items.length; i++) {
const options = {
method: operation.toUpperCase() as IHttpRequestMethods,
url: `https://httpbin.org/${operation}`,
};

const response = await this.helpers.request(options);
returnData.push({
json: response,
});
}

return [returnData];
}
}
