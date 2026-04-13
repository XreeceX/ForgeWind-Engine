output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "api_gateway_url" {
  description = "URL for the API Gateway service"
  value       = "http://${module.ecs.alb_dns_name}:4000"
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "db_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.db_endpoint
  sensitive   = true
}

output "db_port" {
  description = "RDS PostgreSQL port"
  value       = module.rds.db_port
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = aws_subnet.public[*].id
}
