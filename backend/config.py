import os

class Config:
    JWT_PUBLIC_KEY_PATH = os.environ.get("JWT_PUBLIC_KEY_PATH", "./public_key.pem")
    JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "RS256")
    JWT_ISSUER = os.environ.get("JWT_ISSUER")
    JWT_AUDIENCE = os.environ.get("JWT_AUDIENCE")

config = Config()
