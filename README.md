# n8n-nodes-twitter-uploader

This is an n8n community node for uploading media to Twitter. It allows you to upload images to Twitter and returns the media ID that can be used in other Twitter operations.

## Features

- Upload images to Twitter's media endpoint
- Supports multiple image formats (JPEG, PNG, GIF)
- OAuth 1.0a authentication
- Returns media ID for use in tweets or other Twitter operations

## Installation

Follow these steps to install this node in your n8n instance:

```bash
# Using npm
npm install n8n-nodes-twitter-uploader

# Using pnpm
pnpm install n8n-nodes-twitter-uploader
```

## Configuration

### Twitter API Credentials

To use this node, you need to have Twitter API credentials. Here's how to get them:

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app or select an existing one
3. Navigate to "Keys and Tokens"
4. Generate/Copy the following credentials:
   - Consumer Key (API Key)
   - Consumer Secret (API Secret)
   - Access Token
   - Access Token Secret

### Node Configuration

The node requires the following parameters:

- **Binary Property**: Name of the binary property that contains the image file (default: 'data')
- **Media Type**: Type of media being uploaded (JPEG, PNG, or GIF)

## Usage

1. Add the Twitter Media Upload node to your workflow
2. Configure the Twitter API credentials
3. Connect a node that provides an image file (e.g., HTTP Request, Read Binary File)
4. Set the binary property name that contains your image
5. Select the appropriate media type
6. Execute the workflow

### Example Usage

Here's an example of how to use this node in a workflow:

1. **HTTP Request** node: Download an image
2. **Twitter Media Upload** node: Upload the image to Twitter
3. **Twitter** node: Use the returned media ID to create a tweet with the image

## Response

The node returns an object containing:

```json
{
  "media_id": "1234567890",
  "media_id_string": "1234567890",
  "size": 12345,
  "expires_after_secs": 86400,
  "image": {
    "image_type": "image/jpeg",
    "w": 800,
    "h": 600
  }
}
```

## Error Handling

The node includes comprehensive error handling for common issues:
- Missing binary data
- Invalid media types
- Authentication errors
- Twitter API errors

## Publishing to n8n Community

To publish your node to the n8n community, follow these steps:

1. **Prepare Your Package**
   - Ensure your package name follows the format: `n8n-nodes-*`
   - Update package.json with correct metadata (name, description, author, etc.)
   - Include the `n8n-community-node-package` keyword in package.json

2. **Test Your Node**
   ```bash
   # Build the package
   npm run build
   
   # Run linting
   npm run lint
   ```

3. **Publish to npm**
   ```bash
   # Login to npm
   npm login
   
   # Publish your package
   npm publish
   ```

4. **Submit to n8n Community Hub**
   - Go to [n8n Community Hub](https://hub.n8n.io/)
   - Click on "Submit Node"
   - Fill out the submission form with:
     - Package name
     - Description
     - Documentation link
     - GitHub repository link
   - Submit for review

5. **Maintenance**
   - Monitor issues and feedback from the community
   - Keep the node updated with Twitter API changes
   - Regularly update dependencies

## License

[MIT](LICENSE.md)
