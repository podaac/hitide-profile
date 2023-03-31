stage = "uat"

load_balancer_name    = "hitide-profile-alb"
load_balancer_sg_name = "svc-hitide-profile-uat-lb-sg"

l2ss_base_url             = "https://podaac-tools.jpl.nasa.gov/l2ss-services/l2ss"
earth_data_login_base_url = "https://uat.urs.earthdata.nasa.gov"
harmony_base_url          = "https://harmony.uat.earthdata.nasa.gov"
LIST_OF_AUTHORIZED_CORS_REQUESTER_ORIGINS = "https://test-tools.jpl.nasa.gov, https://hitide.podaac.uat.earthdatacloud.nasa.gov, http://localhost:8901"
