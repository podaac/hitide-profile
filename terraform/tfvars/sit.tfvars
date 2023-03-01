stage = "sit"
vpc_id = "vpc-04d8fc64e8ce5cca8"
private_subnets = ["subnet-0d15606f25bd4047b","subnet-0adee3417fedb7f05"]

load_balancer_name    = "hitide-profile-alb"
load_balancer_sg_name = "svc-hitide-profile-sit-lb-sg"

l2ss_base_url             = "https://podaac-tools.jpl.nasa.gov/l2ss-services/l2ss"
earth_data_login_base_url = "https://uat.urs.earthdata.nasa.gov"
harmony_base_url          = "https://harmony.uat.earthdata.nasa.gov"
LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS = "https://hitide.podaac.sit.earthdatacloud.nasa.gov, http://localhost:8901"
