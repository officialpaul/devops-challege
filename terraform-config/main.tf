terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./modules/vpc"

  vpc_cidr          = var.vpc_cidr
  subnet_cidr       = var.subnet_cidr
  availability_zone = var.availability_zone
  name_prefix       = var.name_prefix
}

module "security_group" {
  source = "./modules/security_group"

  vpc_id      = module.vpc.vpc_id
  name_prefix = var.name_prefix
}

module "ec2" {
  source = "./modules/ec2"

  ami                    = var.ami
  instance_type          = var.instance_type
  subnet_id              = module.vpc.public_subnet_id
  vpc_security_group_ids = [module.security_group.web_sg_id]
  name_prefix            = var.name_prefix
}


module "ecr" {
  source = "./modules/ecr"

  name_prefix       = var.name_prefix
  subnet_id         = module.vpc.public_subnet_id
  security_group_id = module.security_group.web_sg_id
}
