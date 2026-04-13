variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "db_instance_class" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type      = string
  sensitive = true
}

variable "subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

# ── Subnet Group ──────────────────────────────────────────────

resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

# ── RDS Instance ──────────────────────────────────────────────

resource "aws_db_instance" "postgres" {
  identifier     = "${var.project_name}-${var.environment}"
  engine         = "postgres"
  engine_version = "16.2"
  instance_class = var.db_instance_class

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]

  multi_az            = var.environment == "production" ? true : false
  publicly_accessible = false
  skip_final_snapshot = var.environment != "production"

  backup_retention_period = var.environment == "production" ? 7 : 1
  deletion_protection     = var.environment == "production"

  tags = {
    Name        = "${var.project_name}-postgres"
    Environment = var.environment
  }
}

# ── Outputs ───────────────────────────────────────────────────

output "db_endpoint" {
  description = "RDS instance endpoint (host)"
  value       = aws_db_instance.postgres.address
}

output "db_port" {
  description = "RDS instance port"
  value       = aws_db_instance.postgres.port
}

output "db_identifier" {
  description = "RDS instance identifier"
  value       = aws_db_instance.postgres.identifier
}
