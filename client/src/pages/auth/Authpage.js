import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../utils/api";
import "./Authpage.css";

const ROLES = ["landlord", "tenant", "agent"];

const AuthPage = () => {
 const { role: routeRole } = useParams();
 const [searchParams] = useSearchParams();
 const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'register');
  const [role, setRole] = useState(routeRole || "landlord");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    accessCode: "",
    companyName: "",
    propertyCount: "",
    licenseNumber: "",
    agencyName: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/[^0-9\s+\-()]/g, '');
      setFormData({ ...formData, phone: cleaned });
    } else if (name === 'accessCode') {
      setFormData({ ...formData, accessCode: value.toUpperCase() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!isLogin && !formData.name) {
      setError("Please enter your full name");
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (!isLogin) {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (!formData.phone || phoneDigits.length < 7) {
        setError("Please enter a valid phone number (minimum 7 digits)");
        setIsLoading(false);
        return;
      }

      if (role === "tenant") {
        if (!formData.accessCode || formData.accessCode.trim() === "") {
          setError("Property Access Code is required for tenants");
          setIsLoading(false);
          return;
        }
      }

      // if (role === "agent") {
      //   if (!formData.licenseNumber || formData.licenseNumber.trim() === "") {
      //     setError("Real Estate License Number is required for Property Manager");
      //     setIsLoading(false);
      //     return;
      //   }
      // }
    }

    try {
      if (isLogin) {
        const result = await api.login(formData.email, formData.password);

        if (result.status === 'error') {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userRole', result.data.user.role);
        localStorage.setItem('userEmail', result.data.user.email);
        localStorage.setItem('isEmailVerified', String(result.data.user.isEmailVerified));
        navigate(`/dashboard/${result.data.user.role}`);
      } else {
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: role
        };

        if (role === "landlord") {
          userData.companyName = formData.companyName || '';
          userData.propertyCount = formData.propertyCount || '';
        } else if (role === "tenant") {
          userData.accessCode = formData.accessCode;
        } else if (role === "agent") {
          userData.licenseNumber = formData.licenseNumber;
          userData.agencyName = formData.agencyName || '';
        }

        const result = await api.register(userData);

        if (result.status === 'error') {
          setError(result.message);
          setIsLoading(false);
          return;
        }

        localStorage.setItem('token', result.data.token);
        localStorage.setItem('userRole', result.data.user.role);
        localStorage.setItem('userEmail', result.data.user.email);
        localStorage.setItem('isEmailVerified', String(result.data.user.isEmailVerified));
        navigate(`/dashboard/${result.data.user.role}`);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError("Unable to connect to server. Please make sure the backend is running.");
      setIsLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (isLogin) return null;

    const phoneField = (
      <input
        key="phone"
        name="phone"
        type="tel"
        placeholder="Phone Number (e.g., +1 555-123-4567)"
        value={formData.phone}
        onChange={handleChange}
        required
      />
    );

    if (role === "landlord") {
      return (
        <>
          {phoneField}
          <input
            name="companyName"
            placeholder="Company Name (optional)"
            value={formData.companyName}
            onChange={handleChange}
          />
          <select
            name="propertyCount"
            value={formData.propertyCount}
            onChange={handleChange}
          >
            <option value="">Number of Properties (optional)</option>
            <option value="1-5">1–5 Properties</option>
            <option value="6-20">6–20 Properties</option>
            <option value="21+">21+ Properties</option>
          </select>
        </>
      );
    }

    if (role === "tenant") {
      return (
        <>
          {phoneField}
          <div className="access-code-field">
            <input
              name="accessCode"
              placeholder="Property Access Code *"
              value={formData.accessCode}
              onChange={handleChange}
              maxLength="20"
              style={{ textTransform: 'uppercase' }}
            />
            <small className="field-help">
              Get this code from your landlord or property manager
            </small>
          </div>
        </>
      );
    }

    if (role === "agent") {
      return (
        <>
          {phoneField}
          <input
            name="licenseNumber"
            placeholder="Real Estate License Number"
            value={formData.licenseNumber}
            onChange={handleChange}
          />
          <input
            name="agencyName"
            placeholder="Agency/Brokerage Name (optional)"
            value={formData.agencyName}
            onChange={handleChange}
          />
        </>
      );
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-blob blue"></div>
      <div className="auth-blob purple"></div>

      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>
              Rent<span>Master</span> Pro
            </h1>
            <p>
              {isLogin
                ? "Welcome back! Please login to your portal."
                : "Join the next generation of rental management."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="role-toggle">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={role === r ? "active" : ""}
                    onClick={() => setRole(r)}
                  >
                    {r === 'agent' ? 'property manager' : r}
                  </button>
                ))}
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {!isLogin && (
              <input
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            )}

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {renderRoleFields()}

            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading
                ? (isLogin ? "Signing In..." : "Creating Account...")
                : (isLogin ? "Sign In" : "Create Account")
              }
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <span onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                accessCode: "",
                companyName: "",
                propertyCount: "",
                licenseNumber: "",
                agencyName: ""
              });
            }}>
              {isLogin ? "Register Now" : "Sign In"}
            </span>
          </p>
        </div>

        <div className="auth-footer">
          Secured by RentMaster AI Framework
        </div>
      </div>
    </div>
  );
};

export default AuthPage;