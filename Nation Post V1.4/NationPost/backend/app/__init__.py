from flask import Flask
from flask_cors import CORS

# Import Blueprints
from app.routes.login import login_bp
from app.routes.signup import signup_bp
from app.routes.upload import upload_bp
from app.routes.user_profile import user_profile_bp
from app.routes.verify_news import verify_news_bp
from app.routes.blockchain import blockchain_bp
from app.routes.dashboard import dashboard_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Register Blueprints
    app.register_blueprint(login_bp)
    app.register_blueprint(signup_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(user_profile_bp)
    app.register_blueprint(verify_news_bp)
    app.register_blueprint(blockchain_bp)
    app.register_blueprint(dashboard_bp)

    @app.route("/")
    def home():
        return {"message": "Backend is running successfully"}

    return app
