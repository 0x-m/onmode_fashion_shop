from storages.backends.s3boto3 import S3Boto3Storage
from decouple import config
class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    bucket_name = 'testbuck1'
    default_acl = 'public-read-write'
    custom_domain = '%s.s3.ir-thr-at1.arvanstorage.com' % bucket_name