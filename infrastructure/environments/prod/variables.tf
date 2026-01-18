variable "domain_name" {
  description = "My domain name"
  type        = string
  default     = "chadhildwein.com"
}

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "personal-site"
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project     = "PersonalSite"
    Environment = "Production"
    ManagedBy   = "OpenTofu"
  }
}
