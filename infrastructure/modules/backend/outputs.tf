output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.prod.invoke_url
}

output "dynamodb_table_name" {
  description = "Name of the DynamoDB comments table"
  value       = aws_dynamodb_table.comments.name
}

output "dynamodb_table_arn" {
  description = "ARN of the DynamoDB comments table"
  value       = aws_dynamodb_table.comments.arn
}

output "submit_lambda_name" {
  description = "Name of the submit comment Lambda function"
  value       = aws_lambda_function.submit_comment.function_name
}

output "fetch_lambda_name" {
  description = "Name of the fetch comments Lambda function"
  value       = aws_lambda_function.fetch_comments.function_name
}
