stage = "ops"
vpc_id = "vpc-0ddbb631fbaf122a8"
private_subnets = ["subnet-0317affbe0ae6d440", "subnet-0c7ced80b933cab42" ]

load_balancer_name    = "hitide-profile-alb"
load_balancer_sg_name = "svc-hitide-profile-ops-lb-sg"

l2ss_base_url             = "https://podaac-tools.jpl.nasa.gov/l2ss-services/l2ss"
earth_data_login_base_url = "https://urs.earthdata.nasa.gov"
harmony_base_url          = "https://harmony.earthdata.nasa.gov"
LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS = "https://podaac-tools.jpl.nasa.gov, https://hitide.podaac.earthdatacloud.nasa.gov, http://localhost:8901"
