variable "vpc_id" {
  description = "ID of the VPC to create the security group in"
  type        = string
}

variable "name_prefix" {
  description = "Prefix used for naming resources"
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "CIDR blocks allowed to reach SSH (port 22)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "http_allowed_cidrs" {
  description = "CIDR blocks allowed to reach HTTP (port 80)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}
