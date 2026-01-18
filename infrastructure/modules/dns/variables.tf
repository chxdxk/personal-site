variable "domain_name" {
  description = "Domain name for the website"
  type        = string
}

variable "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  type        = string
}

variable "cloudfront_zone_id" {
  description = "Zone ID of the CloudFront distribution (always Z2FDTNDATAQYW2)"
  type        = string
  default     = "Z2FDTNDATAQYW2"  # This is AWS's CloudFront zone ID
}

variable "acm_certificate_arn" {
  description = "ARN of the ACM certificate"
  type        = string
}

variable "acm_validation_options" {
  description = "ACM certificate validation options"
  type        = any
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
