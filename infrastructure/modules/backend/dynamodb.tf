# DynamoDB table for blog comments
resource "aws_dynamodb_table" "comments" {
  name           = "${var.project_name}-comments"
  billing_mode   = "PAY_PER_REQUEST"  # No capacity planning needed
  hash_key       = "postSlug"
  range_key      = "commentId"

  attribute {
    name = "postSlug"
    type = "S"  # String
  }

  attribute {
    name = "commentId"
    type = "S"  # String (timestamp + random ID)
  }

  # Enable point-in-time recovery for backups
  point_in_time_recovery {
    enabled = true
  }

  # Server-side encryption
  server_side_encryption {
    enabled = true
  }

  tags = var.tags
}
