from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    wahoo_client_id: str = ""
    wahoo_client_secret: str = ""
    wahoo_redirect_uri: str = "http://localhost:8000/api/auth/callback"
    secret_key: str = "dev-secret-key-change-in-prod"
    demo_mode: bool = True
    frontend_url: str = "http://localhost:5173"
    wahoo_webhook_secret: str = ""

    # Wahoo API base URLs
    wahoo_auth_url: str = "https://api.wahooligan.com/oauth/authorize"
    wahoo_token_url: str = "https://api.wahooligan.com/oauth/token"
    wahoo_api_base: str = "https://api.wahooligan.com"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    @property
    def is_demo(self) -> bool:
        return self.demo_mode or not self.wahoo_client_id or not self.wahoo_client_secret


@lru_cache()
def get_settings() -> Settings:
    return Settings()
