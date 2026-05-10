## About The Challenge

This challenge is designed to evaluate real-world DevOps capabilities, including your ability to design, build, automate, and deploy a production-ready system.


## Design Decisions


ECS Over EC2

ECS Fargate was chosen over self-managed EC2 instances. With Fargate, there are no EC2 instances to patch, no SSH keys to manage, and no AMI updates to coordinate. AWS manages the underlying compute infrastructure. The tradeoff is a slightly higher per-vCPU/hour cost compared to reserved EC2 instances, but for this workload the operational simplicity far outweighs the cost difference.


Multi-Stage Docker Build

Although the assessment requires a minimum of three stages (build, test, and deploy), this implementation uses four stages to further improve structure, separation of concerns, and efficiency. The additional stage enhances clarity in the build process without violating the requirement, since the mandatory stages are still present.

Subnets for ECS Tasks

ECS tasks run in private subnets and are never directly reachable from the internet. All inbound traffic must pass through the Application Load Balancer. The ECS security group only accepts connections from the ALB security group  not from `0.0.0.0/0`. Outbound internet access for ECS tasks (needed to pull from ECR and write to CloudWatch) is routed through NAT Gateways in the public subnets.


Modular Terraform Structure

Infrastructure is split into five focused modules: networking, ecr, alb, ecs, and monitoring. Each module has its own `variables.tf` and `outputs.tf`, making it independently testable, reusable across projects, and easy to understand in isolation. The root `main.tf` wires modules together by passing outputs as inputs. This follows the Terraform module composition pattern recommended by HashiCorp.


Image Tagging Strategy

Docker images are tagged with both `{build-number} and `latest`. The versioned tag provides full traceability, you can identify exactly which code is running in production by looking at the image tag. The `latest` tag provides a convenient reference for manual testing. ECR lifecycle policy retains the last 10 images and expires older ones to control storage costs.


Jenkins as Primary CI/CD Tool

Jenkins was chosen as the primary CI/CD tool per the challenge preference. It provides full declarative pipeline control, a rich plugin ecosystem, supports both cloud hosted and on-premise agents, and is widely used in enterprise environments. 



## Limitations & Improvements

# Current Limitations


* Data in transit is not encrypted -  Browsers may show "Not Secure" warnings 
* Single AWS region - A regional outage would take the application offline 
* No WAF - Application is exposed to common web attacks (SQLi, XSS, DDoS) without AWS WAF 


# Improvements

* Add HTTPS - Request an ACM certificate for your domain, add an HTTPS listener on port 443 to the ALB, and redirect HTTP to HTTPS.
* Multi region deployment - Deploy to a second region and use Route 53 latency-based or failover routing to direct users to the nearest healthy region.
* Add AWS WAF - Attach a WAF Web ACL to the ALB with the AWS Managed Rules Common Rule Set to block OWASP Top 10 attacks.




devops-challenge/
│
├── app/                            # Application source code
│   ├── index.html                  # Main HTML — full-page academic event portal
│   ├── style.css                   # All styles (white academic theme)
│   ├── script.js                   # JavaScript — form logic, validation, async fetch
│   ├── departments.json            # Data source for department/hostel dropdowns
│   └── Dockerfile                  # Multi-stage Docker build
│
├── terraform/
│   ├── main.tf                     # Root module — wires all child modules together
│   ├── variables.tf                # All input variable definitions with defaults
│   ├── outputs.tf                  # Key outputs: app URL, ECR URL, cluster name
│   │
│   ├── modules/
│   │   ├── networking/             # VPC, subnets, IGW, NAT gateways, route tables
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   ├── ecr/                    # ECR repo, scanning, encryption, lifecycle policy
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── outputs.tf
│   │   └── monitoring/             # Dashboard, alarms, SNS topic, metric filters
│   │       ├── main.tf
│   │       ├── variables.tf
│   │       └── outputs.tf
│
├── jenkins/
│   └── Jenkinsfile                 # 4-stage declarative Jenkins pipeline
│
│
├── monitoring/
│   └── cloudwatch-dashboard.json  # Dashboard widget reference (created by Terraform)
│
├── .gitignore
└── README.md                       # This file
