import {
IExecuteFunctions,
INodeExecutionData,
INodeType,
INodeTypeDescription,
} from 'n8n-workflow';

export class ExampleNode implements INodeType {
description: INodeTypeDescription = {
displayName: 'Example Node',
name: 'exampleNode',
icon: 'file:example.svg',
group: ['transform'],
version: 1,
subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
description: 'Basic Example Node',
defaults: {
name: 'Example Node',
},
inputs: ['main'],
outputs: ['main'],
properties: [
{
displayName: 'Resource',
name: 'resource',
type: 'options',
noDataExpression: true,
options: [
{
name: 'User',
value: 'user',
},
],
default: 'user',
},
{
displayName: 'Operation',
name: 'operation',
type: 'options',
noDataExpression: true,
displayOptions: {
show: {
resource: ['user'],
},
},
options: [
{
name: 'Create',
value: 'create',
action: 'Create a user',
},
{
name: 'Delete',
value: 'delete',
action: 'Delete a user',
},
{
name: 'Get',
value: 'get',
action: 'Get a user',
},
{
name: 'Update',
value: 'update',
action: 'Update a user',
},
],
default: 'create',
},
],
};

async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
const items = this.getInputData();
const returnData: INodeExecutionData[] = [];
const resource = this.getNodeParameter('resource', 0) as string;
const operation = this.getNodeParameter('operation', 0) as string;

for (let i = 0; i < items.length; i++) {
returnData.push({
json: {
resource,
operation,
item: items[i].json,
},
});
}

return [returnData];
}
}
