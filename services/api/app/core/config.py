from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Banco
    database_url: str = "postgresql+asyncpg://cadernedu:dev@localhost:5432/cadernedu_dev"

    # Redis / filas
    redis_url: str = "redis://localhost:6379"

    # Auth
    secret_key: str = "dev-secret-change-in-production-min-32-chars"
    keycloak_url: str = "http://localhost:8080"
    keycloak_realm: str = "cadernedu"
    keycloak_client_id: str = "cadernedu-api"

    # Storage (MinIO / S3)
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "cadernedu"
    minio_secret_key: str = "dev_secret_change_me"
    minio_bucket: str = "cadernedu-dev"
    minio_secure: bool = False  # True em produção (HTTPS)

    # App
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/v1"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


settings = Settings()
