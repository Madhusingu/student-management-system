const apiUrl = 'http://127.0.0.1:5000/students';
const username = 'admin';
const password = 'password123';

// Function to fetch and display students
async function fetchStudents() {
    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });
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
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(username + ':' + password)
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
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(username + ':' + password)
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
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Basic ' + btoa(username + ':' + password)
            }
        });
        if (!response.ok) throw new Error('Failed to delete student');
        fetchStudents();  // Refresh list
    } catch (error) {
        console.error('Error deleting student:', error);
    }
}

// Load students on page load
fetchStudents();