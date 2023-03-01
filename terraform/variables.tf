variable "app_name" {
  default = "hitide-profile"
}

variable "stage" {
  default = "sit"
}

variable "app_version" {
  default = ""
}

variable "vpc_id" {}

variable "private_subnets" {
  type = list(string)
}

variable "default_tags" {
  type    = map(string)
  default = {}
}

variable "credentials" {
  default = "~/.aws/credentials"
}

variable "profile" {
  default = "ngap-service-sit"
}

variable "docker_tag" {
  default = "podaac/hitide-profile:latest"
}

variable "task_cpu" {
  type        = number
  description = "(Optional) CPU value for the Fargate task"
  default     = 1024
}

variable "task_memory" {
  type        = number
  description = "(Optional) Memory value for the Fargate task"
  default     = 8192
}

variable "logs_retention_days" {
  type        = number
  description = "(Optional) Retention days for logs of the Fargate task log group "
  default     = 30
}

variable "region" {
  default = "us-west-2"
}


variable "load_balancer_name" {
  default = "hitide-profile-alb"
}

variable "load_balancer_sg_name" {
  default = "svc-hitide-profile-sit-lb-sg"
}

############################################
###                                      ###
###    Hitide profile config variables   ###
###                                      ###
############################################

variable "earth_data_login_base_url" {
  default = "https://urs.earthdata.nasa.gov"
}
variable "l2ss_base_url" {
  default = "https://podaac-tools.jpl.nasa.gov/l2ss-services/l2ss"
}

variable "harmony_base_url" {
  default = "https://harmony.earthdata.nasa.gov"
}

variable "EARTH_DATA_LOGIN_CLIENT_ID" {}
variable "EARTH_DATA_LOGIN_PASSWORD" {}

variable "LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS" {
  default = ""
}