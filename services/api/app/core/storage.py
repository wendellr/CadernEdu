"""Cliente assíncrono para MinIO/S3 (aioboto3)."""
import aioboto3
from botocore.config import Config

from app.core.config import settings

_session = aioboto3.Session()

_ALLOWED_CONTENT_TYPES = {
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/webm",
    "application/pdf",
}


def _client():
    scheme = "https" if settings.minio_secure else "http"
    return _session.client(
        "s3",
        endpoint_url=f"{scheme}://{settings.minio_endpoint}",
        aws_access_key_id=settings.minio_access_key,
        aws_secret_access_key=settings.minio_secret_key,
        config=Config(signature_version="s3v4"),
    )


def validate_content_type(content_type: str) -> bool:
    return content_type in _ALLOWED_CONTENT_TYPES


async def upload_file(key: str, data: bytes, content_type: str) -> None:
    async with _client() as client:
        await client.put_object(
            Bucket=settings.minio_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )


async def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    async with _client() as client:
        return await client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.minio_bucket, "Key": key},
            ExpiresIn=expires_in,
        )


async def delete_file(key: str) -> None:
    async with _client() as client:
        await client.delete_object(Bucket=settings.minio_bucket, Key=key)
