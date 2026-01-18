output "website_bucket_name" {
  description = "Name of the S3 bucket hosting the website"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.frontend.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.frontend.cloudfront_domain_name
}

output "website_url" {
  description = "URL of the website"
  value       = "https://${var.domain_name}"
}

output "route53_name_servers" {
  description = "Name servers for your domain (update these at your registrar)"
  value       = module.dns.name_servers
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = module.dns.zone_id
}
