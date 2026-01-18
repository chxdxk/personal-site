variable "domain_name" {
  description = "Domain name for the website"
  type        = string
}

variable "bucket_name" {
  description = "Name of the S3 bucket"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate (will be created by this module)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
