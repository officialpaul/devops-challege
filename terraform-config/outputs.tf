output "instance_public_ip" {
  description = "Public IP address of the EC2 web instance"
  value       = module.ec2.instance_public_ip
}

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_id" {
  description = "ID of the public subnet"
  value       = module.vpc.public_subnet_id
}

output "web_sg_id" {
  description = "ID of the web security group"
  value       = module.security_group.web_sg_id
}
