import { Link, useNavigate } from "react-router-dom";
import UmiyaMataji from "../../assets/umiya-mataji.png";
import { useUser } from "../../contexts/UserContext";

const Navbar = () => {
    const navigate = useNavigate();
    const {userDispatch} = useUser();
    const logout = () => {
      localStorage.removeItem("token");
      userDispatch({type: "UNSET_USER"});
      navigate("/login");
    }

    return (<nav className="navbar navbar-expand-sm navbar-dark bg-dark">
    <div className="container-fluid">
        <Link className="navbar-brand d-flex" to="/">
          <img src={UmiyaMataji} className="mx-1" alt="logo" width="30"/>
          Patidar Yuva Mandal
        </Link>
        <button className="btn btn-outline-danger" onClick={()=>logout()}>Logout</button>
    </div>
  </nav>)
}

export default Navbar;