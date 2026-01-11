from flask import Flask, request, jsonify, render_template
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
from database import db, Student
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
from flask_cors import CORS
CORS(app)  # Enable CORS for all routes
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///students.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

auth = HTTPBasicAuth()

users = {
    os.getenv('ADMIN_USER', 'admin'): generate_password_hash(os.getenv('ADMIN_PASS', 'password123'))
}

@auth.verify_password
def verify_password(username, password):
    if username in users and check_password_hash(users.get(username), password):
        return username

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    return app.send_static_file('favicon.ico')

@app.route('/health')
def health():
    return jsonify({"status": "OK"}), 200

# CREATE: Add a new student
@app.route('/students', methods=['POST'])
@auth.login_required
def create_student():
    data = request.get_json()
    if not data or not all(k in data for k in ('name', 'age', 'grade')):
        return jsonify({"error": "Missing required fields: name, age, grade"}), 400
    try:
        age = int(data['age'])
        if age <= 0:
            raise ValueError
    except ValueError:
        return jsonify({"error": "Age must be a positive integer"}), 400
    
    new_student = Student(name=data['name'], age=age, grade=data['grade'])
    db.session.add(new_student)
    db.session.commit()
    return jsonify(new_student.to_dict()), 201

# READ: Get all students or a specific one by ID
@app.route('/students', methods=['GET'])
@auth.login_required
def get_students():
    student_id = request.args.get('id')
    if student_id:
        try:
            student = db.session.get(Student, int(student_id))
            if not student:
                return jsonify({"error": "Student not found"}), 404
            return jsonify(student.to_dict()), 200
        except ValueError:
            return jsonify({"error": "Invalid ID"}), 400
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students]), 200

# UPDATE: Update a student by ID
@app.route('/students/<int:student_id>', methods=['PUT'])
@auth.login_required
def update_student(student_id):
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    if 'name' in data:
        student.name = data['name']
    if 'age' in data:
        try:
            age = int(data['age'])
            if age <= 0:
                raise ValueError
            student.age = age
        except ValueError:
            return jsonify({"error": "Age must be a positive integer"}), 400
    if 'grade' in data:
        student.grade = data['grade']
    
    db.session.commit()
    return jsonify(student.to_dict()), 200

# DELETE: Delete a student by ID
@app.route('/students/<int:student_id>', methods=['DELETE'])
@auth.login_required
def delete_student(student_id):
    student = db.session.get(Student, student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404
    db.session.delete(student)
    db.session.commit()
    return jsonify({"message": "Student deleted"}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)