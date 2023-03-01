terraform {
  backend "s3" {
    bucket  = "podaac-services-sit-terraform" # will be overridden from command line during build
    key     = "services/hitide-profile/terraform.tfstate"
    region  = "us-west-2"
    profile = "ngap-service-sit" # will be overridden from command line during build
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }
}

provider "aws" {
  region                  = "us-west-2"
  shared_credentials_file = var.credentials
  profile                 = var.profile

  ignore_tags {
    key_prefixes = ["gsfc-ngap"]
  }
}

locals {
  ec2_resources_name = "service-${var.app_name}-${var.stage}"

  default_tags = length(var.default_tags) == 0 ? {
    team : "TVA",
    application : local.ec2_resources_name,
    Environment = var.stage
    Version     = var.app_version
  } : var.default_tags

  certificate_name = var.stage == "ops" ? "internal-hitide-alb.profile.podaac.earthdatacloud.nasa.gov" : "internal-hitide-alb.profile.podaac.${var.stage}.earthdatacloud.nasa.gov"


  full_docker_tag = "${data.aws_caller_identity.current.account_id}.dkr.ecr.us-west-2.amazonaws.com/${var.docker_tag}"
}


data "aws_caller_identity" "current" {}
