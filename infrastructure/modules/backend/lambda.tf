# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = var.tags
}

# Attach basic Lambda execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.project_name}-lambda-dynamodb"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.comments.arn
      }
    ]
  })
}

# Data source for Lambda deployment package
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../../../lambda/comments"
  output_path = "${path.module}/../../../lambda/comments.zip"
}

# Lambda function for submitting comments
resource "aws_lambda_function" "submit_comment" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-submit-comment"
  role            = aws_iam_role.lambda_role.arn
  handler         = "submit.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.comments.name
    }
  }

  tags = var.tags
}

# Lambda function for fetching comments
resource "aws_lambda_function" "fetch_comments" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-fetch-comments"
  role            = aws_iam_role.lambda_role.arn
  handler         = "fetch.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime         = "nodejs20.x"
  timeout         = 10

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.comments.name
    }
  }

  tags = var.tags
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "submit_comment" {
  name              = "/aws/lambda/${aws_lambda_function.submit_comment.function_name}"
  retention_in_days = 7

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "fetch_comments" {
  name              = "/aws/lambda/${aws_lambda_function.fetch_comments.function_name}"
  retention_in_days = 7

  tags = var.tags
}
