## 🛠️ Requirements:
- Build Login and Signup pages using React.js.
- Use Tailwind CSS or custom CSS for styling.
- The backend API base URL is: https://100.102.217.22:3000
- Submit user credentials to the appropriate API endpoints:

  - POST /api/auth/signup
  - POST /api/auth/login

- On successful login, store the received token in localStorage (for 24 hours).

## ✅ Functional Behavior:

# Signup Page

- Collect: username, email, password, gender, dob, location
- Send POST /api/auth/signup request with JSON body
- On success, show success animation or redirect

# Login Page

- Collect: email, password
- Send POST /api/auth/login request with JSON body
- On success:
  - Save token to localStorage
  - Save expiry time (24h) to localStorage
  - Redirect to homepage

## 🎨 UI Design:
- A glowing box centered on the screen
- Theme color: Vibrant Green
- Green gradients and glowing effects on hover
- Smooth transitions on input focus and button hover
- Use subtle box shadows, blur, and pulse animation

## 🖼️ UI Layout Example:
+----------------------------------------+
|              [LOGO HERE]               |
|    Welcome to Emotion-Based Player     |
|  [Username   ][_______________]        |
|  [Email      ][_______________]        |
|  [Password   ][_______________]        |
|  [Gender     ][___] [DOB][__________]  |
|  [Location   ][_______________]        |
|                                        |
|        [✨ Sign Up Button ✨]         |
+----------------------------------------+

## 🌐 Example API Usage: js Copy Edit

'''js
axios.post('https://100.102.217.22:3000/api/auth/login', {
  email: 'user@example.com',
  password: 'securePassword'
})
.then(res => {
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('expiry', Date.now() + 86400000); // 24h
})
.catch(err => console.error(err));
'''
