import { INodeProperties } from 'n8n-workflow';

export const httpVerbFields: INodeProperties[] = [
{
displayName: 'Operation',
name: 'operation',
type: 'options',
noDataExpression: true,
options: [
{
name: 'DELETE',
value: 'delete',
action: 'Delete a HTTP verb',
description: 'Delete a record',
},
{
name: 'GET',
value: 'get',
action: 'Get a HTTP verb',
description: 'Get a record',
},
{
name: 'HEAD',
value: 'head',
action: 'Head a HTTP verb',
description: 'Head a record',
},
{
name: 'POST',
value: 'post',
action: 'Post a HTTP verb',
description: 'Create a record',
},
{
name: 'PUT',
value: 'put',
action: 'Put a HTTP verb',
description: 'Put a record',
},
],
default: 'get',
description: 'The HTTP verb to use',
},
];
