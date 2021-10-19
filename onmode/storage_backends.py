from storages.backends.s3boto3 import S3Boto3Storage

class MediaStorage(S3Boto3Storage):
    location = 'media'
    file_overwrite = False
    bucket_name = 'testbuck1'
    custom_domain = '%s.s3.ir-thr-at1.arvanstorage.com' % bucket_name