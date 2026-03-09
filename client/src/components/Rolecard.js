import { useNavigate } from "react-router-dom";
import "./Rolecard.css";

const RoleCard = ({ icon, title, description, role }) => {
  const navigate = useNavigate();

  return (
    <div
      className="role-card"
      onClick={() => navigate(`/auth/${role}`)}
      role="button"
      tabIndex="0"
      onKeyDown={(e) => e.key === "Enter" && navigate(`/auth/${role}`)}
    >
      <div className="role-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="access-link">ACCESS PORTAL →</span>
    </div>
  );
};

export default RoleCard;
