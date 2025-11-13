import React, { useState } from 'react';
import axios from 'axios';


const InputField = React.memo(({ 
  label, 
  type = 'text', 
  name, 
  placeholder, 
  required = false, 
  as = 'input', 
  options = [],
  value,
  error,
  onChange,
  showPasswordToggle = false,
  onTogglePasswordVisibility
}) => {
  const handleInputChange = (e) => {
    onChange(e);
  };

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
        {label} {required && '*'}
      </label>
      <div style={{ position: 'relative' }}>
        {as === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            required={required}
            style={{ 
              padding: '12px', 
              border: `1px solid ${error ? '#dc3545' : '#ddd'}`, 
              borderRadius: '8px',
              width: '100%',
              fontSize: '16px',
              backgroundColor: error ? '#fff5f5' : 'white',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8B5FBF';
              e.target.style.boxShadow = '0 0 0 2px rgba(139, 95, 191, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#dc3545' : '#ddd';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">{placeholder}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : as === 'textarea' ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            rows="4"
            style={{ 
              padding: '12px', 
              border: `1px solid ${error ? '#dc3545' : '#ddd'}`, 
              borderRadius: '8px',
              width: '100%',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'Arial',
              backgroundColor: error ? '#fff5f5' : 'white',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8B5FBF';
              e.target.style.boxShadow = '0 0 0 2px rgba(139, 95, 191, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#dc3545' : '#ddd';
              e.target.style.boxShadow = 'none';
            }}
          />
        ) : (
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            required={required}
            style={{ 
              padding: '12px', 
              border: `1px solid ${error ? '#dc3545' : '#ddd'}`, 
              borderRadius: '8px',
              width: '100%',
              fontSize: '16px',
              backgroundColor: error ? '#fff5f5' : 'white',
              paddingRight: showPasswordToggle ? '45px' : '12px',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8B5FBF';
              e.target.style.boxShadow = '0 0 0 2px rgba(139, 95, 191, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? '#dc3545' : '#ddd';
              e.target.style.boxShadow = 'none';
            }}
          />
        )}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              fontSize: '18px',
              padding: '5px',
              borderRadius: '4px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.color = '#8B5FBF';
              e.target.style.backgroundColor = '#f0e6ff';
            }}
            onMouseOut={(e) => {
              e.target.style.color = '#666';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            {type === 'password' ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && (
        <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    educationLevel: '',
    department: '',
    experienceLevel: '',
    preferredTrack: '',
    skills: '',
    cvText: '',
    careerInterests: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    // Registration-specific validations
    if (!isLogin) {
      if (!formData.name.trim()) {
        newErrors.name = 'Full name is required';
      }
      if (!formData.educationLevel) {
        newErrors.educationLevel = 'Education level is required';
      }
      if (!formData.experienceLevel) {
        newErrors.experienceLevel = 'Experience level is required';
      }
      if (!formData.preferredTrack) {
        newErrors.preferredTrack = 'Preferred track is required';
      }
      
      // Confirm password validation
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/login' : '/register';

      const payload = isLogin
        ? {
            email: formData.email,
            password: formData.password,
          }
        : {
            ...formData,
            skills: formData.skills || '',
            careerInterests: formData.careerInterests || ''
          };

      // Remove confirmPassword from payload before sending to backend
      if (!isLogin) {
        delete payload.confirmPassword;
      }

      const response = await axios.post(`http://localhost:5000/api/auth${endpoint}`, payload);
      
      setMessage(`✅ ${isLogin ? 'Login' : 'Registration'} successful! Redirecting...`);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage(`❌ ${errorMessage}`);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      educationLevel: '',
      department: '',
      experienceLevel: '',
      preferredTrack: '',
      skills: '',
      cvText: '',
      careerInterests: ''
    });
    setErrors({});
    setMessage('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    resetForm();
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
        }}></div>
        
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#333',
          fontSize: '28px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          {isLogin ? '🔐 Welcome Back' : '👤 Join Our Community'}
        </h1>
        
        {message && (
          <div style={{ 
            padding: '12px', 
            margin: '15px 0', 
            borderRadius: '8px',
            backgroundColor: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            textAlign: 'center',
            fontWeight: '500'
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <>
              <InputField
                label="Full Name"
                name="name"
                placeholder="Enter your full name"
                required
                value={formData.name}
                error={errors.name}
                onChange={handleChange}
              />
              
              <InputField
                label="Education Level"
                name="educationLevel"
                placeholder="Select your education level"
                as="select"
                required
                value={formData.educationLevel}
                error={errors.educationLevel}
                onChange={handleChange}
                options={[
                  { value: 'High School', label: 'High School' },
                  { value: 'Undergraduate', label: 'Undergraduate' },
                  { value: 'Graduate', label: 'Graduate' },
                  { value: 'Bootcamp', label: 'Bootcamp' },
                  { value: 'Self-Taught', label: 'Self-Taught' }
                ]}
              />

              <InputField
                label="Department/Field of Study"
                name="department"
                placeholder="e.g., Computer Science, Business Administration"
                value={formData.department}
                error={errors.department}
                onChange={handleChange}
              />

              <InputField
                label="Experience Level"
                name="experienceLevel"
                placeholder="Select your experience level"
                as="select"
                required
                value={formData.experienceLevel}
                error={errors.experienceLevel}
                onChange={handleChange}
                options={[
                  { value: 'Fresher', label: 'Fresher' },
                  { value: 'Junior', label: 'Junior' },
                  { value: 'Mid', label: 'Mid Level' },
                  { value: 'Senior', label: 'Senior' }
                ]}
              />

              <InputField
                label="Preferred Career Track"
                name="preferredTrack"
                placeholder="Select your preferred track"
                as="select"
                required
                value={formData.preferredTrack}
                error={errors.preferredTrack}
                onChange={handleChange}
                options={[
                  { value: 'Web Development', label: 'Web Development' },
                  { value: 'Data Science', label: 'Data Science' },
                  { value: 'Design', label: 'Design' },
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Business', label: 'Business' },
                  { value: 'Other', label: 'Other' }
                ]}
              />

              <InputField
                label="Skills"
                name="skills"
                placeholder="e.g., JavaScript, Communication, Graphic Design (comma separated)"
                value={formData.skills}
                error={errors.skills}
                onChange={handleChange}
              />

              <InputField
                label="Career Interests"
                name="careerInterests"
                placeholder="e.g., Frontend Development, UX Design, Digital Marketing (comma separated)"
                value={formData.careerInterests}
                error={errors.careerInterests}
                onChange={handleChange}
              />

              <InputField
                label="CV/Resume Notes"
                name="cvText"
                placeholder="Paste your CV text, project descriptions, or career notes here..."
                as="textarea"
                value={formData.cvText}
                error={errors.cvText}
                onChange={handleChange}
              />
            </>
          )}

          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="your.email@example.com"
            required
            value={formData.email}
            error={errors.email}
            onChange={handleChange}
          />

          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password (min 6 characters)"
            required
            value={formData.password}
            error={errors.password}
            onChange={handleChange}
            showPasswordToggle={true}
            onTogglePasswordVisibility={togglePasswordVisibility}
          />

          {!isLogin && (
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="Confirm your password"
              required
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={handleChange}
              showPasswordToggle={true}
              onTogglePasswordVisibility={toggleConfirmPasswordVisibility}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              marginTop: '10px',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? (
              <span>⏳ Processing...</span>
            ) : (
              <span>{isLogin ? '🚀 Login' : '🎯 Create Account'}</span>
            )}
          </button>
        </form>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '25px', 
          paddingTop: '20px', 
          borderTop: '1px solid #e9ecef' 
        }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={switchMode}
            type="button"
            style={{
              background: 'none',
              border: '2px solid #667eea',
              color: '#667eea',
              cursor: 'pointer',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              width: '100%',
              maxWidth: '280px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#667eea';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {isLogin ? '👉 Create New Account' : '👉 Login to Existing Account'}
          </button>
        </div>

        {!isLogin && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
          }}>
            <strong>💡 Pro Tip:</strong> Fill in your skills and career interests to get personalized job recommendations!
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;