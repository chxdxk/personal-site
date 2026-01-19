const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  // Parse request body
  const body = JSON.parse(event.body);
  const { postSlug, author, email, comment } = body;

  // Validation logic
  // Check all required fields are present
  if (!postSlug || !author || !email || !comment) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'All fields are required' })
    };
  }

  // Validate author name length
  if (author.trim().length < 2 || author.trim().length > 50) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Author name must be between 2 and 50 characters' })
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Invalid email address' })
    };
  }

  // Validate comment length
  if (comment.trim().length < 10 || comment.trim().length > 1000) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Comment must be between 10 and 1000 characters' })
    };
  }

  // Basic spam detection - check for excessive links
  const linkCount = (comment.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Comments cannot contain more than 2 links' })
    };
  }

  // Generate unique comment ID
  const commentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Store comment in DynamoDB
  const params = {
    TableName: process.env.TABLE_NAME,
    Item: {
      postSlug,
      commentId,
      author,
      email,
      comment,
      timestamp: new Date().toISOString(),
      approved: true  // Auto-approve all comments
    }
  };

  try {
    await docClient.send(new PutCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Comment submitted successfully',
        commentId
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
      body: JSON.stringify({ error: 'Failed to submit comment' })
    };
  }
};
