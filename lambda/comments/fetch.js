const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  // Get post slug from path parameters
  const postSlug = event.pathParameters?.postSlug;

  if (!postSlug) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Post slug is required' })
    };
  }

  // Query DynamoDB for all comments on this post
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'postSlug = :postSlug',
    ExpressionAttributeValues: {
      ':postSlug': postSlug
    },
    // Only return approved comments
    FilterExpression: 'approved = :approved',
    ExpressionAttributeValues: {
      ':postSlug': postSlug,
      ':approved': true
    },
    ScanIndexForward: false  // Sort by newest first
  };

  try {
    const result = await docClient.send(new QueryCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        comments: result.Items || []
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch comments' })
    };
  }
};
