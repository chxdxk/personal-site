# Infrastructure Configuration

This directory contains OpenTofu configuration for deploying your personal website to AWS.

## Architecture

```
User → Route53 → CloudFront → S3 Bucket
                    ↓
                ACM Certificate
```

### Resources Created

- **S3 Bucket**: Hosts your static website files
- **CloudFront Distribution**: CDN for fast global delivery
- **Route53 Hosted Zone**: DNS management
- **ACM Certificate**: Free SSL/TLS certificate for HTTPS
- **CloudFront OAC**: Secure access from CloudFront to S3

## Prerequisites

### 1. Install OpenTofu

**macOS:**
```bash
brew install opentofu
```

**Linux:**
```bash
# Download from https://opentofu.org/docs/intro/install/
```

**Verify installation:**
```bash
tofu version
```

### 2. AWS Account Setup

1. **Create AWS Account**: https://aws.amazon.com/
2. **Create IAM User** for OpenTofu with these permissions:
   - AmazonS3FullAccess
   - CloudFrontFullAccess
   - AmazonRoute53FullAccess
   - AWSCertificateManagerFullAccess
   
3. **Generate Access Keys**:
   - Go to IAM → Users → Your User → Security Credentials
   - Create Access Key → CLI
   - Save the Access Key ID and Secret Access Key

4. **Configure AWS CLI**:
```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from https://aws.amazon.com/cli/

# Configure credentials
aws configure
```

Enter:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `us-east-1`
- Default output format: `json`

### 3. Purchase Domain (Optional)

You can buy a domain from:
- Route53 ($12-14/year for .com)
- Namecheap, Porkbun ($8-10/year)
- Any registrar

## Configuration

### 1. Update Your Domain

Edit `environments/prod/variables.tf`:
```hcl
variable "domain_name" {
  default = "yourdomain.com"  # Change this!
}
```

### 2. Initialize OpenTofu

```bash
cd environments/prod
tofu init
```

### 3. Review the Plan

```bash
tofu plan
```

This shows what resources will be created without actually creating them.

### 4. Apply Configuration

```bash
tofu apply
```

Type `yes` when prompted. This will:
- Create S3 bucket
- Create CloudFront distribution (~10-15 minutes)
- Create Route53 hosted zone
- Request ACM certificate
- Set up DNS validation

### 5. Update Domain Name Servers

After apply completes, OpenTofu will output name servers:

```
route53_name_servers = [
  "ns-1234.awsdns-12.org",
  "ns-567.awsdns-89.com",
  ...
]
```

**Update these at your domain registrar:**
- If using Route53: Already done!
- If using another registrar: Update NS records to match above

DNS propagation takes 24-48 hours but often works within 1-2 hours.

### 6. Verify Certificate

Wait for ACM certificate validation (5-30 minutes after DNS update):
```bash
aws acm describe-certificate \
  --certificate-arn <your-cert-arn> \
  --region us-east-1
```

Look for `Status: "ISSUED"`

## Deploying Your Site

After infrastructure is ready:

```bash
# Build your Astro site
cd ../../frontend
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

Get bucket name and distribution ID:
```bash
cd ../infrastructure/environments/prod
tofu output
```

## Cost Estimate

With low traffic (<10k visitors/month):
- Route53 Hosted Zone: $0.50/month
- S3 Storage: ~$0.02/month
- CloudFront: $1-2/month
- ACM Certificate: FREE
- **Total: ~$2-4/month**

Plus domain registration: $8-14/year

## Useful Commands

```bash
# View current state
tofu show

# View outputs
tofu output

# Destroy all resources (careful!)
tofu destroy

# Format configuration files
tofu fmt -recursive

# Validate configuration
tofu validate
```

## Troubleshooting

### Certificate Validation Stuck
- Check DNS records are correct at your registrar
- Wait up to 48 hours for DNS propagation
- Verify with: `dig yourdomain.com NS`

### Access Denied Errors
- Check IAM user permissions
- Verify AWS credentials: `aws sts get-caller-identity`

### CloudFront Not Serving Content
- Check S3 bucket policy allows CloudFront OAC
- Verify files are in bucket: `aws s3 ls s3://your-bucket-name/`
- Create CloudFront invalidation

## Next Steps

1. Set up GitHub Actions for automated deployments
2. Add backend infrastructure (Lambda, API Gateway, DynamoDB)
3. Implement monitoring with CloudWatch
4. Add WAF rules for security

## State Management

Currently using local state. For production, uncomment the backend configuration in `main.tf` and:

1. Create S3 bucket for state:
```bash
aws s3 mb s3://your-terraform-state-bucket --region us-east-1
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled
```

2. Create DynamoDB table for locking:
```bash
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

3. Migrate existing state:
```bash
tofu init -migrate-state
```
