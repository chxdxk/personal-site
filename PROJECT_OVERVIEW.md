# Personal Portfolio Site - Complete Technical Overview

**Project URL**: https://chadhildwein.com
**Repository**: https://github.com/chxdxk/personal-site
**Built with**: Astro, AWS, OpenTofu, GitHub Actions

---

## Table of Contents

1. [Project Summary](#project-summary)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Technology Stack Explained](#technology-stack-explained)
4. [How Everything Works Together](#how-everything-works-together)
5. [Key Concepts & Learning Outcomes](#key-concepts--learning-outcomes)
6. [Problems We Solved](#problems-we-solved)
7. [Cost Analysis](#cost-analysis)
8. [Future Enhancements](#future-enhancements)
9. [Learning Resources](#learning-resources)

---

## Project Summary

This is a production-grade, serverless personal portfolio website with a blog. It demonstrates modern cloud architecture, infrastructure as code, and CI/CD best practices.

### What We Built

- **Static website** with Astro (blog, portfolio pages)
- **Global CDN** with CloudFront (fast delivery worldwide)
- **Custom domain** with SSL/TLS encryption
- **Infrastructure as Code** with OpenTofu
- **Automated deployments** with GitHub Actions
- **Cost-optimized** serverless architecture (~$2-4/month)

### Tech Stack

**Frontend**: Astro, TypeScript, Tailwind CSS
**Infrastructure**: S3, CloudFront, Route53, ACM
**IaC**: OpenTofu (Terraform fork)
**CI/CD**: GitHub Actions
**Cost**: ~$2-4/month + $14/year domain

---

## Architecture Deep Dive

### Request Flow

When someone visits https://chadhildwein.com/about:

1. **DNS Lookup (Route53)**
   - Browser asks: "What's the IP for chadhildwein.com?"
   - Route53: "It's CloudFront distribution dmmy5avovhsap.cloudfront.net"
   - Returns nearest edge location IP

2. **TLS Handshake (ACM)**
   - Browser connects to CloudFront
   - CloudFront presents SSL certificate
   - Encrypted connection established

3. **URL Rewrite (CloudFront Function)**
   - Request: `/about`
   - Function rewrites to: `/about/index.html`

4. **Cache Check (CloudFront)**
   - If cached: Return immediately (<50ms)
   - If not: Fetch from S3

5. **Origin Request (S3 via OAC)**
   - CloudFront authenticates with OAC
   - S3 returns file
   - CloudFront caches for 1 hour

6. **Response**
   - Content compressed
   - Delivered to user

**Total Time**: 20-300ms depending on cache status

---

## Technology Stack Explained

### 1. Astro (Static Site Generator)

**What it does**: Transforms your code into optimized static HTML

**Build process**:
```bash
npm run build
```
Creates `dist/` folder with:
- Pre-rendered HTML pages
- Optimized CSS/JS
- Blog posts from markdown

**Why Astro?**
- Ships minimal JavaScript
- Perfect for content sites
- Built-in markdown support
- Fast page loads

### 2. Amazon S3 (Storage)

**What it is**: Object storage service

**Our bucket**: `chadhildwein-prod-website`

**Security**:
- Private bucket (no public access)
- Only CloudFront can read (via OAC)
- Bucket policy enforces this

**Why S3?**
- $0.023/GB/month (cheap!)
- 99.999999999% durability
- Infinite scalability
- Static website hosting built-in

### 3. CloudFront (CDN)

**What it is**: Content Delivery Network with 400+ edge locations

**Our distribution**: `ELD5ZESORFKSC`

**How it works**:
- Caches content at edge locations worldwide
- User in Tokyo gets content from Tokyo edge
- User in London gets content from London edge
- 10x faster than serving from single location

**CloudFront Function**:
```javascript
// Rewrites /about to /about/index.html
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    if (!uri.includes('.') && !uri.endsWith('/')) {
        request.uri = uri + '/index.html';
    }
    return request;
}
```

**Cache settings**:
- Default TTL: 1 hour
- Max TTL: 24 hours
- Invalidation on new deploys

### 4. Route53 (DNS)

**What it is**: Domain Name System service

**Our hosted zone**: `Z03114223DQ2VPQTFID33`

**Records we use**:
- **NS records**: Point to Route53 nameservers
- **A records (Alias)**: Point domain to CloudFront
- **CNAME records**: ACM certificate validation

**Why Route53?**
- 100% uptime SLA
- Integrated with AWS services
- Free queries for alias records

### 5. ACM (SSL Certificates)

**What it provides**: Free SSL/TLS certificates

**Our certificate**: Covers `chadhildwein.com` and `www.chadhildwein.com`

**Validation**: DNS-based (automatic with Route53)

**Renewal**: Automatic every 60 days

**Why important**: HTTPS is now mandatory for:
- Security
- SEO ranking
- Browser trust indicators

### 6. OpenTofu (Infrastructure as Code)

**What it is**: Tool to define infrastructure as code

**Our structure**:
```
infrastructure/
├── modules/
│   ├── frontend/  # S3, CloudFront, ACM
│   └── dns/       # Route53
└── environments/
    └── prod/      # Production config
```

**Key commands**:
```bash
tofu init     # Initialize
tofu plan     # Preview changes
tofu apply    # Create/update resources
tofu output   # View outputs
```

**Why IaC?**
- Version controlled infrastructure
- Reproducible (can rebuild from code)
- Self-documenting
- Easy to collaborate

### 7. GitHub Actions (CI/CD)

**What it does**: Automates build and deployment

**Workflow**:
1. Push to `main` branch
2. GitHub Actions triggers
3. Installs dependencies
4. Builds Astro site
5. Uploads to S3
6. Invalidates CloudFront cache
7. Site updated in 2-3 minutes

**No manual deployment needed!**

---

## How Everything Works Together

### Deployment Flow

```
Write blog post (markdown)
    ↓
git commit & push
    ↓
GitHub Actions triggered
    ↓
Build static site
    ↓
Upload to S3
    ↓
Invalidate CloudFront
    ↓
Users see new content
```

### User Request Flow

```
User types chadhildwein.com
    ↓
DNS lookup (Route53)
    ↓
Connect to CloudFront edge
    ↓
TLS handshake (ACM cert)
    ↓
CloudFront Function rewrites URL
    ↓
Check cache
    ↓
Fetch from S3 if needed (via OAC)
    ↓
Deliver to user
```

---

## Key Concepts & Learning Outcomes

### 1. Serverless Architecture

**Traditional**: Manage servers, scale manually, pay 24/7
**Serverless**: AWS manages everything, auto-scales, pay per use

You built serverless infrastructure with:
- No servers to manage
- Automatic scaling
- Pay only for what you use
- Global distribution

### 2. Infrastructure as Code (IaC)

**Manual**: Click through AWS console, hard to reproduce
**IaC**: Define in code, version control, reproducible

Benefits you achieved:
- All infrastructure in Git
- Can rebuild from code
- Changes are documented
- Easy to collaborate

### 3. CI/CD Pipeline

**Manual deployment**: Error-prone, slow, tedious
**Automated**: Consistent, fast, reliable

Your pipeline:
```bash
git push → Build → Test → Deploy
```

Every push to `main` = automatic deployment

### 4. CDN & Edge Computing

**Without CDN**: Slow for users far from server
**With CDN**: Fast worldwide (cached at edge)

Your CloudFront Function runs at the edge:
- Sub-millisecond execution
- Runs in Tokyo for Tokyo users
- Runs in London for London users

### 5. Security (Defense in Depth)

Multiple security layers:
1. S3 bucket is private
2. Bucket policy restricts access
3. OAC authenticates CloudFront
4. TLS encrypts all traffic
5. IAM least privilege

Attacker must bypass ALL layers.

### 6. DNS & Nameservers

**DNS**: Translates domain names to IPs

**Nameserver issue we fixed**:
- Domain had nameservers A
- Hosted zone had nameservers B
- DNS records in zone B
- ACM checked nameservers A → couldn't find records
- Solution: Update domain to use nameservers B

### 7. SSL/TLS Certificates

**Purpose**: Encrypt traffic between browser and server

**Validation**: Prove domain ownership via DNS

**Lifecycle**: Issue → Validate → Use → Auto-renew

You learned:
- How certificates work
- DNS validation process
- Why CloudFront requires us-east-1

### 8. Caching Strategy

**Multi-layer cache**:
1. Browser cache (fastest)
2. CloudFront edge (fast)
3. S3 origin (slower, only on miss)

**Invalidation**: Clear cache when deploying

---

## Problems We Solved

### Problem 1: Certificate Stuck Validating

**Symptom**: ACM certificate pending for 90+ minutes

**Root cause**: Nameserver mismatch
- Domain registration: nameservers A
- Route53 hosted zone: nameservers B
- Validation records in zone B
- ACM checking nameservers A

**Solution**: Update domain nameservers to match hosted zone

**Learning**: Always verify nameservers match after creating hosted zone

### Problem 2: S3 Bucket Already Exists

**Symptom**: `BucketAlreadyExists` error

**Root cause**: S3 bucket names are globally unique

**Solution**: Changed bucket name to include domain: `chadhildwein-prod-website`

**Learning**: Use unique prefixes (domain names work well)

### Problem 3: 404 on Subpages

**Symptom**: `/about` returns 404, but `/` works

**Root cause**:
- Astro builds `about/index.html`
- CloudFront looks for `about` object
- Object doesn't exist

**Solution**: CloudFront Function to rewrite URLs
- `/about` → `/about/index.html`
- `/skills` → `/skills/index.html`

**Learning**: Static site generators need URL rewriting for clean URLs

---

## Cost Analysis

### Monthly Costs (Low Traffic)

| Service | Cost |
|---------|------|
| Route53 Hosted Zone | $0.50 |
| Route53 Queries | $0.40 |
| S3 Storage (1GB) | $0.02 |
| S3 Requests | $0.01 |
| CloudFront | $0.85 |
| ACM Certificate | FREE |
| CloudWatch | $0.50 |
| **Total** | **~$2.28/month** |

### Annual Cost

**AWS**: $27.36/year
**Domain**: $14/year
**Total**: ~$41/year

### Scaling Costs

**100k visitors/month**: ~$15/month
**1M visitors/month**: ~$130/month

Still cheaper than managed hosting!

---

## Future Enhancements

### Phase 2: Backend Features

**1. Contact Form**
- API Gateway + Lambda + SES
- Store submissions in DynamoDB
- Email notifications

**2. Blog Comments**
- Lambda functions for CRUD operations
- DynamoDB for storage
- Moderation workflow

**3. Analytics**
- Custom pageview tracking
- CloudWatch RUM
- Dashboard with charts

### Phase 3: Advanced Features

**1. Search**
- Pagefind (static search)
- Or Algolia (cloud search)

**2. Image Optimization**
- Lambda@Edge for resizing
- WebP conversion
- Quality adjustment

**3. A/B Testing**
- CloudFront Functions for routing
- Analytics to track variants

**4. Internationalization**
- Multiple languages
- Geographic routing

---

## Learning Resources

### AWS

**Getting Started**:
- AWS Free Tier: https://aws.amazon.com/free/
- AWS Well-Architected: https://aws.amazon.com/architecture/well-architected/

**Documentation**:
- S3: https://docs.aws.amazon.com/s3/
- CloudFront: https://docs.aws.amazon.com/cloudfront/
- Route53: https://docs.aws.amazon.com/route53/

### Infrastructure as Code

**OpenTofu**:
- Docs: https://opentofu.org/docs/
- Tutorial: https://opentofu.org/docs/intro/

**Terraform** (similar):
- Learn: https://learn.hashicorp.com/terraform
- AWS Provider: https://registry.terraform.io/providers/hashicorp/aws/

### Frontend

**Astro**:
- Docs: https://docs.astro.build/
- Tutorial: https://docs.astro.build/en/tutorial/

**TypeScript**:
- Handbook: https://www.typescriptlang.org/docs/

### CI/CD

**GitHub Actions**:
- Docs: https://docs.github.com/en/actions
- Quickstart: https://docs.github.com/en/actions/quickstart

### Certifications

**AWS Certified Cloud Practitioner**:
- Entry-level certification
- Covers AWS basics

**AWS Certified Developer - Associate**:
- Serverless, Lambda, DynamoDB
- Directly relevant to this project

---

## What You Accomplished

### Infrastructure Deployed

✅ S3 bucket for static hosting
✅ CloudFront distribution (400+ edge locations)
✅ Route53 DNS with custom domain
✅ ACM SSL certificate (free, auto-renewing)
✅ CloudFront Function for URL rewriting
✅ Complete infrastructure as code
✅ Automated CI/CD pipeline

### Skills Gained

✅ AWS cloud services (S3, CloudFront, Route53, ACM)
✅ Infrastructure as Code (OpenTofu/Terraform)
✅ CI/CD pipelines (GitHub Actions)
✅ DNS & domain management
✅ SSL/TLS certificates
✅ CDN concepts & edge computing
✅ Serverless architecture
✅ Static site generation (Astro)
✅ Problem-solving & debugging

### Real-World Experience

This isn't a tutorial project - it's production infrastructure:
- Used by real users
- Costs real money (minimal!)
- Requires real maintenance
- Scales to real traffic

**Put this on your resume.**
**Talk about it in interviews.**
**You built something real.**

---

## Next Steps

1. **Customize content**
   - Update About page
   - Add real projects
   - Write blog posts

2. **Add features**
   - Contact form
   - Comments
   - Analytics

3. **Keep learning**
   - AWS certifications
   - Build more projects
   - Explore new services

4. **Share knowledge**
   - Blog about your learning
   - Help others on forums
   - Contribute to open source

---

## Conclusion

You built a production-ready website using modern cloud architecture. The same patterns used by Netflix, Airbnb, and major tech companies.

This is marketable experience. The concepts you learned (IaC, serverless, CDN, CI/CD) are in high demand.

Keep building. Keep learning. You're on the right path.

**Well done! 🚀**

---

**Built by Chad Hildwein**
**January 2026**
