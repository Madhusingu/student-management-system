// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    if (username && password) {
        showApp();
        fetchStudents();
    }
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Test login by fetching students (requires auth)
    try {
        const response = await fetch('/students', {
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });
        if (response.ok) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            showApp();
            fetchStudents();
        } else {
            document.getElementById('loginError').textContent = 'Invalid credentials. Please try again.';
            document.getElementById('loginError').style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('loginError').textContent = 'Login failed. Check console for details.';
        document.getElementById('loginError').style.display = 'block';
    }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    hideApp();
});

// Helper functions
function showApp() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('app').style.display = 'block';
}

function hideApp() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
}

function getAuthHeaders() {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    return {
        'Authorization': 'Basic ' + btoa(username + ':' + password)
    };
}

// Fetch and display students
async function fetchStudents() {
    try {
        const response = await fetch('/students', { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch students');
        const students = await response.json();
        const list = document.getElementById('studentsList');
        list.innerHTML = '';
        students.forEach(student => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${student.name}</strong> (Age: ${student.age}, Grade: ${student.grade})
                <button onclick="updateStudent(${student.id})">Update</button>
                <button onclick="deleteStudent(${student.id})">Delete</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

// Add student
document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const grade = document.getElementById('grade').value;
    
    try {
        const response = await fetch('/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ name, age: parseInt(age), grade })
        });
        if (!response.ok) throw new Error('Failed to add student');
        fetchStudents();  // Refresh list
        document.getElementById('addForm').reset();
    } catch (error) {
        console.error('Error adding student:', error);
    }
});

// Update student (simple prompt for demo)
async function updateStudent(id) {
    const newName = prompt('New Name:');
    const newAge = prompt('New Age:');
    const newGrade = prompt('New Grade:');
    if (!newName || !newAge || !newGrade) return;
    
    try {
        const response = await fetch(`/students/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ name: newName, age: parseInt(newAge), grade: newGrade })
        });
        if (!response.ok) throw new Error('Failed to update student');
        fetchStudents();  // Refresh list
    } catch (error) {
        console.error('Error updating student:', error);
    }
}

// Delete student
async function deleteStudent(id) {
    if (!confirm('Are you sure?')) return;
    try {
        const response = await fetch(`/students/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete student');
        fetchStudents();  // Refresh list
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}