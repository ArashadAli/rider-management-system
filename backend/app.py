from flask import Flask
from routes.user.route import user_bp
app = Flask(__name__)

app.register_blueprint(user_bp, url_prefix="/users")

@app.route('/')
def hello():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)