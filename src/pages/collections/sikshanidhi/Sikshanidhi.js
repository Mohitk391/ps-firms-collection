import UmiyaMataji from "../../../assets/umiya-mataji.png";
import { useState } from "react";
import Pagination from "../../../utilities/Pagination/Pagination";
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { useSikshanidhi } from "../../../contexts/SikshanidhiContext";
import { Timestamp, deleteDoc, doc, addDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useAllFirms } from "../../../contexts/AllFirmsContext";
import { useUser } from "../../../contexts/UserContext";

const ITEMS_PER_PAGE = 10;
const days = {
  "day-1" : new Date("10/03/2024").toLocaleDateString("en-GB"),
  "day-2" : new Date("10/04/2024").toLocaleDateString("en-GB"),
  "day-3" : new Date("10/05/2024").toLocaleDateString("en-GB"),
  "day-4" : new Date("10/06/2024").toLocaleDateString("en-GB"),
  "day-5" : new Date("10/07/2024").toLocaleDateString("en-GB"),
  "day-6" : new Date("10/08/2024").toLocaleDateString("en-GB"),
  "day-7" : new Date("10/09/2024").toLocaleDateString("en-GB"),
  "day-8" : new Date("10/10/2024").toLocaleDateString("en-GB"),
  "day-9" : new Date("10/11/2024").toLocaleDateString("en-GB"),
}

const Sikshanidhi = () => {
  const { dayId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDetails, setCurrentDetails] = useState({});
  const [newDetails, setNewDetails] = useState({});
  const {sikshanidhiState : {sikshanidhi}} = useSikshanidhi();  
  const {allFirmsState : {allFirms}} = useAllFirms();
  const navigate = useNavigate();
  const {useState: {user}} = useUser();
  let recievers = user === "bhanpuri" ? ["Rajesh Nakrani", "Piyush Rudani", "Harshad Chhabhaiya", "Shubham Bhagat"] : ["Vijay Chhabhaiya"];

  useEffect(()=>{
    setResults((dayId==="all" ? sikshanidhi : sikshanidhi.filter(firm=>firm.date === days[dayId])).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) || item.place.toLowerCase().includes(searchTerm.toLowerCase().trim())
  ));
  },[dayId, sikshanidhi, searchTerm]);
  
  const handleModalClose = () => {
    setCurrentDetails({});  
    setNewDetails({});  
    setSearchTerm('');
  };

  const saveNewFirm = async (firmDetails) => {
    let firm = allFirms.find(firm => firm.name === firmDetails.name);
    if(firm){
      await addDoc(collection(db,"sikshanidhi"),{...firmDetails, name: firm.name, place:firm.place, date: Timestamp.fromDate(new Date())});
    
      await updateDoc(doc(db, "allFirms", firm.id), {
        sikshanidhiPrevious : firmDetails.previous,
        sikshanidhiCurrent : firmDetails.current,
        sikshanidhiPayer : firmDetails.payer,
        sikshanidhiMobile : firmDetails.mobile,
        sikshanidhiReciever : firmDetails.reciever
      })
    }
    else{
      console.log("No firm found in all firms");
      await addDoc(collection(db,"sikshanidhi"),{...firmDetails, date: Timestamp.fromDate(new Date())});
    
      await addDoc(collection(db, "allFirms"), {
        name: firmDetails.name,
        place: firmDetails.place,
        sikshanidhiPrevious : firmDetails.previous,
        sikshanidhiCurrent : firmDetails.current,
        sikshanidhiPayer : firmDetails.payer,
        sikshanidhiMobile : firmDetails.mobile,
        sikshanidhiReciever : firmDetails.reciever,
        phaadPrevious : 0,
        phaadCurrent : 0,
        phaadPayer : "",
        phaadMobile : "",
        phaadReciever : "",
        aarti : 0,
        aartiDate: "",
        prasadi : 0,
        coupon : 0,
        aartiName : "",
        datarPayer: "",
        datarMobile: "",
        datarReciever : ""
      })
    }
    document.getElementById('newFirmClose').click();
  }

  const saveUpdatedFirm = async () => {
    let updatingSikshanidhiBody = {};
    let updatingAllBody = {};
    if(currentDetails.previous > 0){ 
      updatingSikshanidhiBody = {...updatingSikshanidhiBody, previous: currentDetails.previous}
      updatingAllBody = {...updatingAllBody, sikshanidhiPrevious: currentDetails}
    }
    if(currentDetails.current > 0){
       updatingSikshanidhiBody = {...updatingSikshanidhiBody, current: currentDetails.current}
       updatingAllBody = {...updatingAllBody, sikshanidhiCurrent: currentDetails.current}
    }
    if(currentDetails.payer){
       updatingSikshanidhiBody = {...updatingSikshanidhiBody, payer: currentDetails.payer}
       updatingAllBody = {...updatingAllBody, sikshanidhiPayer: currentDetails.payer}
    }
    if(currentDetails.mobile ){
       updatingSikshanidhiBody = {...updatingSikshanidhiBody, mobile: currentDetails.mobile}
       updatingAllBody = {...updatingAllBody, sikshanidhiMobile: currentDetails.mobile}
    }
    if(currentDetails.reciever){
       updatingSikshanidhiBody = {...updatingSikshanidhiBody, reciever: currentDetails.reciever}
       updatingAllBody = {...updatingAllBody, sikshanidhiReciever: currentDetails.reciever}
    }

    await updateDoc(doc(db, "sikshanidhi", currentDetails.id), updatingSikshanidhiBody);
    await updateDoc(doc(db, "allFirms", currentDetails.id), updatingAllBody);

    document.getElementById('newFirmClose').click();
  }

  const deleteFirm = async (firm) => {
     
    await deleteDoc(doc(db, "sikshanidhi", firm.id));
    const updateFirm = allFirms?.find(curr => curr.name === firm.name);
    await updateDoc(doc(db, "allFirms", updateFirm?.id), {
      sikshanidhiCurrent : 0,
      sikshanidhiReciever: "",
      sikshanidhiPrevious: 0,
      sikshanidhiPayer : "",
      sikshanidhiMobile : ""
    })
    document.getElementById('newFirmClose').click(); 
  }
  
  useEffect(() => {
    const modalElement = document.getElementById('updateDetails');
    const newFirmModalElement = document.getElementById('addNew');
    modalElement.addEventListener('hidden.bs.modal', handleModalClose);
    newFirmModalElement.addEventListener('hidden.bs.modal', handleModalClose);
    return () => {
      modalElement.removeEventListener('hidden.bs.modal', handleModalClose);
      newFirmModalElement.removeEventListener('hidden.bs.modal', handleModalClose);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [sikshanidhi]);

  const totalPages = Math.ceil(results?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = results?.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const downloadTable = () => {
    const doc = new jsPDF();
    doc.text(`Sikshanidhi ${dayId}`, 15, 12);
    autoTable(doc, { html: '#fullDataTable' });
    doc.save('collections.pdf')
}

  return (
    <div className="App d-flex flex-column min-vh-100">
     <Navbar />
      <main className="container mt-3 flex-fill">
          <div className="d-flex justify-content-between mb-2">
            <div className="header">
              <span className="h2">Sikshanidhi</span>
              <span className=" px-3 fs-6">
                <Link to="/sikshanidhi">Sikshanidhi</Link> / <Link to={`/sikshanidhi/${dayId}`}>{dayId}</Link>
              </span>
            </div>
            <input className="py-0 px-3 border rounded-4 border-opacity-50" type="text" placeholder="Search" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
           { results?.length > 0 ? <button onClick={downloadTable} className="btn btn-outline-dark" title="Download Records PDF"><i className="bi bi-file-earmark-arrow-down-fill"></i></button> : <button className="invisible pe-none"></button>}
          </div>
          {results?.length > 0 ? (
            <table className="table table-bordered table-hover" id="collectionTable">
              <thead>
                <tr>
                  <th className="col-1 text-center border-3">Date</th>
                  <th className="col-5 border-3">Firm Name</th>
                  <th className="col-1 text-center border-3">Place</th>
                  <th className="text-center border-3">Prev (2023)</th>
                  <th className="text-center border-3">Curr (2024)</th>
                  <th className="text-center border-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((firm) => {
                  return (
                    <tr  key={firm.id}>
                      <td className="text-center border-3">{firm.date}</td>
                      <td role="button" className="fw-bold border-3" data-bs-toggle="modal" data-bs-target="#updateDetails" onClick={()=> setCurrentDetails(firm)}>{firm.name}</td>
                      <td className="text-center border-3">{firm.place}</td>
                      <td className="border-3 text-center border-3">
                        {firm.previous >0 ? firm.previous : "-"}
                      </td>
                      <td className="text-center border-3">{firm.current >0 ? firm.current : "-"}</td>
                     <td className="text-center border-3 d-flex gap-3 justify-content-center">
                      <i className="bi bi-trash3-fill" title="Delete Firm" onClick={()=>deleteFirm(firm)}></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center">
              <p>No records found</p>
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={()=>navigate("/allFirms")}
              >
                Add New Firm
              </button>
            </div>
          )}

          {results?.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
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
      <div className="modal fade" id="updateDetails" tabIndex="-1" aria-labelledby="updateDetailsLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="updateDetailsLabel">Firm Details</h5>
              <button type="button" className="btn-close" id="newFirmClose"  data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 row">
                <label htmlFor="name" className="col-sm-2 col-form-label">Firm Name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="name" value={currentDetails?.name} onChange={e=>setCurrentDetails({...currentDetails, name: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                  <label htmlFor="place" className="col-sm-2 col-form-label">Place</label>
                  <div className="col-sm-10">
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="inlineRadioOptions" id="Bhanpuri" checked={currentDetails?.place === "Bhanpuri"} onChange={e=>setCurrentDetails({...currentDetails, place: "Bhanpuri"})}/>
                      <label className="form-check-label" htmlFor="Bhanpuri">Bhanpuri</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="inlineRadioOptions" id="Fafadih" checked={currentDetails?.place === "Fafadih"} onChange={e=>setCurrentDetails({...currentDetails, place: "Fafadih"})}/>
                      <label className="form-check-label" htmlFor="Fafadih">Fafadih</label>
                    </div>
                  </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="previous" className="col-sm-2 col-form-label">Previous (2023)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="previous" value={currentDetails?.previous} onChange={e=>setCurrentDetails({...currentDetails, previous: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="current" className="col-sm-2 col-form-label">Current (2024)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="current" value={currentDetails?.current} onChange={e=>setCurrentDetails({...currentDetails, current: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerName" className="col-sm-2 col-form-label">Haste (Payer)</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerName" value={currentDetails?.payer} onChange={e=>setCurrentDetails({...currentDetails, payer: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerNumber" className="col-sm-2 col-form-label">Mobile Number</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerNumber" value={currentDetails?.mobile} onChange={e=>setCurrentDetails({...currentDetails, mobile:  e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="receiver" className="col-sm-2 col-form-label">Haste (Receiver)</label>
                <div className="col-sm-8">
                               <select class="form-select" id="sikshanidhiReceiver" aria-label="Haste (Reciever)" onChange={e=>setNewDetails({...newDetails, reciever: e.target.value})}>
                                  <option ></option>
                                  {
                                    recievers.map(person => {
                                      return <option value={person} selected={newDetails?.reciever === person}>{person}</option>
                                    })
                                  }
                                </select>
                            </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={()=>saveUpdatedFirm(currentDetails)}>Save changes</button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="addNew" tabIndex="-1" aria-labelledby="addNewLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addNewLabel">Firm Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" id="newFirmClose" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 row">
                <label htmlFor="firmName" className="col-sm-2 col-form-label">Firm Name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="firmName" placeholder="Firm Name"  value={newDetails?.name} onChange={e=>setNewDetails({...newDetails, name: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                  <label htmlFor="place" className="col-sm-2 col-form-label">Place</label>
                  <div className="col-sm-10">
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="inlineRadioOptions" id="Bhanpuri" value="option1" onChange={e=>setNewDetails({...newDetails, place: "Bhanpuri"})}/>
                      <label className="form-check-label" htmlFor="Bhanpuri">Bhanpuri</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="inlineRadioOptions" id="Fafadih" value="option2" onChange={e=>setNewDetails({...newDetails, place: "Fafadih"})}/>
                      <label className="form-check-label" htmlFor="Fafadih">Fafadih</label>
                    </div>
                  </div>
                </div>
              <div className="mb-3 row">
                <label htmlFor="inputPassword" className="col-sm-2 col-form-label">Previous (2023)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="inputPassword" onChange={e=>setNewDetails({...newDetails, previous: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="inputPassword" className="col-sm-2 col-form-label">Current (2024)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="inputPassword" onChange={e=>setNewDetails({...newDetails, current: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerName" className="col-sm-2 col-form-label">Haste (Payer)</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerName" value={newDetails?.payer} onChange={e=>setNewDetails({...newDetails, payer: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerNumber" className="col-sm-2 col-form-label">Mobile Number</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerNumber" value={newDetails?.mobile} onChange={e=>setNewDetails({...newDetails, mobile:  e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="receiver" className="col-sm-2 col-form-label">Haste (Receiver)</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="receiver" value={newDetails?.reciever} onChange={e=>setNewDetails({...newDetails, reciever: e.target.value})}/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={()=>saveNewFirm(newDetails)}>Add Firm</button>
            </div>
          </div>
        </div>
      </div>
      <table className="table table-bordered" id="fullDataTable" style={{display: 'none'}}>
        <thead>
          <tr>
            <th className="col-6 border-3">Firm Name</th>
            <th className="text-center border-3">Prev (2023)</th>
            <th className="text-center border-3">Curr (2024)</th>
          </tr>
        </thead>
        <tbody>
          {results.map((firm) => {
            return (
              <tr role="button" key={firm.id}>
                <td className="border-3">{firm.name}</td>
                <td className="border-3 text-center border-3">
                  {firm.previous >0 ? firm.previous : "-"}
                </td>
                <td className="text-center border-3">{firm.current >0 ? firm.current : "-"}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td className="text-center border-3"></td>
            <td className="fw-bold border-3 text-center">Total</td>
            <td className="text-center border-3">{currentItems.reduce((acc,curr)=>acc+curr.current,0)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default Sikshanidhi;
