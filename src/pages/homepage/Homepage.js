import { Link, useNavigate } from "react-router-dom";
import UmiyaMataji from "../../assets/umiya-mataji.png";
import Navbar from "../../components/Navbar/Navbar";
import "./Homepage.css";
import { useDatar } from "../../contexts/DatarContext";
import { useAllFirms } from "../../contexts/AllFirmsContext";
import { usePhaad } from "../../contexts/PhaadContext";
import { useSikshanidhi } from "../../contexts/SikshanidhiContext";
import { useKharcha } from "../../contexts/KharchaContext";
import { useSamiti } from "../../contexts/SamitiContext";

const Homepage = () => {
    const navigate = useNavigate();
    const { datarState : { datar}} = useDatar();
    const { allFirmsState : {allFirms}} = useAllFirms();
    const {phaadState : {phaad}} = usePhaad();
    const { sikshanidhiState : { sikshanidhi}} = useSikshanidhi();
    const {kharchaState : { kharcha }} = useKharcha();
    const { samitiState : {samiti}} = useSamiti();

    return (
        <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container mt-3 flex-fill">
          <div className="container">
            <div className="row">
              <div className="col-md-4 col-xl-3" onClick={()=>navigate("/allFirms")} role="button">
                  <div className="card bg-c-blue text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">All Firms</h4>
                          <p className="m-b-0">Firms Count<span className="f-right">{allFirms.length}</span></p>
                      </div>
                  </div>
              </div>
              <div className="col-md-4 col-xl-3" onClick={()=>navigate("/datar")} role="button">
                  <div className="card bg-c-green text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">Datar</h4>
                          <p className="m-b-0">Datar Collected<span className="f-right">{datar.reduce((acc,curr)=>acc+Number(curr.amount),0)}</span></p>
                      </div>
                  </div>
              </div>
              
              <div className="col-md-4 col-xl-3" onClick={()=>navigate("/phaad")} role="button">
                  <div className="card bg-c-yellow text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">Phaado</h4>
                          <p className="m-b-0">Phaado Collected<span className="f-right">{phaad.reduce((acc,curr)=>acc+Number(curr.current),0)}</span></p>
                      </div>
                  </div>
              </div>
              
              <div className="col-md-4 col-xl-3" onClick={()=>navigate("/sikshanidhi")} role="button">
                  <div className="card bg-c-pink text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">Sikshanidhi</h4>
                          <p className="m-b-0">Sikshanidhi Collected<span className="f-right">{sikshanidhi.reduce((acc,curr)=>acc+Number(curr.current),0)}</span></p>
                      </div>
                  </div>
              </div>
              <div className="col-md-4 col-xl-3 pe-none display-none" onClick={()=>navigate("/samiti")} role="button" >
                  <div className="card bg-c-brown text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">Samiti</h4>
                          <p className="m-b-0">Samiti Count<span className="f-right">{samiti.reduce((acc,curr)=>acc+Number(curr.current),0)}</span></p>
                      </div>
                  </div>
              </div>
              <div className="col-md-4 col-xl-3 pe-none display-none" onClick={()=>navigate("/kharcha")} role="button">
                  <div className="card bg-c-gray text-white">
                      <div className="card-block">
                          <h4 className="m-b-20">Kharcha</h4>
                          <p className="m-b-0">Total Expense<span className="f-right">{kharcha.reduce((acc,curr)=>acc+Number(curr.amount),0)}</span></p>
                      </div>
                  </div>
              </div>
              <div className="col-md-4 col-xl-3" onClick={()=>navigate("/yajman")} role="button">
                  <div className="card bg-c-white">
                      <div className="card-block">
                          <h4 className="m-b-20 text-center">Yajman</h4>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </main>
        <footer className="page-footer shadow-lg border-top">
          <div className="d-flex flex-wrap justify-content-between align-items-center mx-auto py-4">
            <div className="d-flex flex-wrap align-items-center justify-content-start">
              <Link href="/" className="d-flex align-items-center p-0 text-dark gap-0">
                <img alt="logo" className="mx-3" src={UmiyaMataji} width="40"/>
                <span className="h5 mb-0 font-weight-bold">Patidar Yuva Mandal</span>
              </Link> 
            </div>
            <div className="pe-3 d-flex gap-3">
              <button className="btn btn-dark rounded-5">
                <i className="bi bi-facebook"></i>
              </button>
              <button className="btn btn-dark rounded-5">
                <i className="bi bi-twitter"></i>
              </button>
              <button className="btn btn-dark rounded-5">
                <i className="bi bi-instagram"></i>
              </button>
            </div>
          </div>
        </footer>
      </div>
    );
}

export default Homepage