terraform {
  required_version = ">= 1.6"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state storage (uncomment after creating the S3 bucket)
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "personal-site/prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"
  # }
}

# Default provider (us-east-1)
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = var.tags
  }
}

# Additional provider for us-east-1 (required for CloudFront ACM certificates)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
  
  default_tags {
    tags = var.tags
  }
}

# Local values
locals {
  bucket_name = "chadhildwein-${var.environment}-website"
}

# Frontend Module (S3 + CloudFront + ACM)
module "frontend" {
  source = "../../modules/frontend"
  
  domain_name   = var.domain_name
  bucket_name   = local.bucket_name
  project_name  = var.project_name
  tags          = var.tags
  
  # The ACM certificate is created within the module
  acm_certificate_arn = module.frontend.acm_certificate_arn
  
  providers = {
    aws.us-east-1 = aws.us-east-1
  }
}

# DNS Module (Route53)
module "dns" {
  source = "../../modules/dns"

  domain_name            = var.domain_name
  cloudfront_domain_name = module.frontend.cloudfront_domain_name
  acm_certificate_arn    = module.frontend.acm_certificate_arn
  acm_validation_options = module.frontend.acm_certificate_validation_records
  tags                   = var.tags

  providers = {
    aws.us-east-1 = aws.us-east-1
  }
}

# Backend Module (Lambda, API Gateway, DynamoDB)
module "backend" {
  source = "../../modules/backend"

  project_name = var.project_name
  domain_name  = var.domain_name
  tags         = var.tags
}
