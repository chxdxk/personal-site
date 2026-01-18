# Personal Portfolio Website

A modern, serverless personal portfolio and blog built with Astro and deployed on AWS.

## 🚀 Project Overview

This is a full-stack cloud project featuring:
- **Frontend**: Astro static site with blog support
- **Infrastructure**: AWS serverless architecture (S3, CloudFront, Route53)
- **IaC**: OpenTofu for infrastructure management
- **CI/CD**: GitHub Actions for automated deployments

## 📁 Project Structure

```
personal-site/
├── frontend/                 # Astro application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Routes (index, about, skills, resume, blog)
│   │   └── content/         # Markdown blog posts
│   └── package.json
├── infrastructure/          # OpenTofu configuration
│   ├── modules/
│   │   ├── frontend/        # S3, CloudFront, ACM
│   │   └── dns/             # Route53
│   └── environments/
│       └── prod/            # Production environment
└── .github/
    └── workflows/           # GitHub Actions CI/CD
```

## 🛠️ Tech Stack

### Frontend
- **Astro** - Fast, content-focused framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling

### Infrastructure (AWS)
- **S3** - Static website hosting
- **CloudFront** - Global CDN
- **Route53** - DNS management
- **ACM** - Free SSL certificates
- **OpenTofu** - Infrastructure as code

### Deployment
- **GitHub Actions** - Automated CI/CD pipeline

## 🏗️ Getting Started

### Prerequisites
- Node.js 20+
- AWS Account
- OpenTofu installed
- Domain name (optional for testing)

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd personal-site
```

2. **Install dependencies**
```bash
cd frontend
npm install
```

3. **Run development server**
```bash
npm run dev
```

Visit http://localhost:4321

### Deploying to AWS

See [infrastructure/README.md](infrastructure/README.md) for detailed deployment instructions.

**Quick Start:**
1. Create AWS account and configure credentials
2. Update domain name in `infrastructure/environments/prod/variables.tf`
3. Initialize and apply OpenTofu:
```bash
cd infrastructure/environments/prod
tofu init
tofu apply
```

## 📝 Writing Blog Posts

1. Create a new markdown file in `frontend/src/content/blog/`:
```bash
cd frontend/src/content/blog
touch my-new-post.md
```

2. Add frontmatter:
```markdown
---
title: 'My Post Title'
description: 'Brief description'
pubDate: 2026-01-18
author: 'Your Name'
tags: ['tag1', 'tag2']
---

Your content here...
```

3. Commit and push (auto-deploys via GitHub Actions)

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Infrastructure
```bash
tofu init            # Initialize OpenTofu
tofu plan            # Preview changes
tofu apply           # Apply changes
tofu destroy         # Destroy resources
```

## 💰 Cost Estimate

With low traffic (<10k visitors/month):
- Route53: $0.50/month
- S3: ~$0.02/month
- CloudFront: $1-2/month
- **Total: ~$2-4/month**

## 🚀 CI/CD Pipeline

GitHub Actions automatically:
1. Builds Astro site on push to `main`
2. Syncs files to S3
3. Invalidates CloudFront cache
4. Deploys in ~2-3 minutes

### Setup GitHub Secrets

Add these to your repository secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET_NAME`
- `CLOUDFRONT_DISTRIBUTION_ID`

## 📚 Learning Resources

- [Astro Documentation](https://docs.astro.build)
- [OpenTofu Documentation](https://opentofu.org/docs/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

## 🗺️ Roadmap

- [x] Static website with Astro
- [x] Blog with markdown support
- [x] AWS infrastructure with OpenTofu
- [x] CI/CD with GitHub Actions
- [ ] Contact form (Lambda + SES)
- [ ] Blog comments (Lambda + DynamoDB)
- [ ] Analytics (CloudWatch RUM)
- [ ] Backend API for dynamic features

## 📄 License

MIT License - feel free to use this as a template for your own site!

## 🤝 Contributing

This is a personal project, but feel free to fork it and make it your own!
