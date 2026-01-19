# HTTP API Gateway (simpler than REST API)
resource "aws_apigatewayv2_api" "comments_api" {
  name          = "${var.project_name}-comments-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://${var.domain_name}", "https://www.${var.domain_name}"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }

  tags = var.tags
}

# Integration for submit comment Lambda
resource "aws_apigatewayv2_integration" "submit_comment" {
  api_id           = aws_apigatewayv2_api.comments_api.id
  integration_type = "AWS_PROXY"

  integration_uri    = aws_lambda_function.submit_comment.invoke_arn
  integration_method = "POST"
}

# Integration for fetch comments Lambda
resource "aws_apigatewayv2_integration" "fetch_comments" {
  api_id           = aws_apigatewayv2_api.comments_api.id
  integration_type = "AWS_PROXY"

  integration_uri    = aws_lambda_function.fetch_comments.invoke_arn
  integration_method = "POST"
}

# Route for submitting comments
resource "aws_apigatewayv2_route" "submit_comment" {
  api_id    = aws_apigatewayv2_api.comments_api.id
  route_key = "POST /comments"

  target = "integrations/${aws_apigatewayv2_integration.submit_comment.id}"
}

# Route for fetching comments
resource "aws_apigatewayv2_route" "fetch_comments" {
  api_id    = aws_apigatewayv2_api.comments_api.id
  route_key = "GET /comments/{postSlug}"

  target = "integrations/${aws_apigatewayv2_integration.fetch_comments.id}"
}

# Stage (deployment environment)
resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.comments_api.id
  name        = "prod"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = var.tags
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}-comments"
  retention_in_days = 7

  tags = var.tags
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "submit_comment" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.submit_comment.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.comments_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "fetch_comments" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.fetch_comments.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.comments_api.execution_arn}/*/*"
}
