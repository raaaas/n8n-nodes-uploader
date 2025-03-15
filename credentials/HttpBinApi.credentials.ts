import {
IAuthenticateGeneric,
ICredentialTestRequest,
ICredentialType,
INodeProperties,
} from 'n8n-workflow';

export class HttpBinApi implements ICredentialType {
name = 'httpbinApi';
displayName = 'HttpBin API';
documentationUrl = 'https://httpbin.org/';
properties: INodeProperties[] = [
{
displayName: 'Token',
name: 'token',
type: 'string',
typeOptions: {
password: true,
},
default: '',
},
];

authenticate: IAuthenticateGeneric = {
type: 'generic',
properties: {
headers: {
Authorization: '={{"Bearer " + $credentials.token}}',
},
},
};

test: ICredentialTestRequest = {
request: {
baseURL: 'https://httpbin.org',
url: '/bearer',
},
};
}
