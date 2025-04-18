import UmiyaMataji from "../../../assets/umiya-mataji.png";
import { useState } from "react";
import Pagination from "../../../utilities/Pagination/Pagination";
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Link, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import { useDatar } from "../../../contexts/DatarContext";
import { Timestamp, addDoc, collection, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase-config";
import { useAllFirms } from "../../../contexts/AllFirmsContext";
import { useUser } from "../../../contexts/UserContext";

const ITEMS_PER_PAGE = 10;
const daysIndex = {
  "03/10/2024" : 1,
  "04/10/2024" : 2,
  "05/10/2024" : 3,
  "06/10/2024" : 4,
  "07/10/2024" : 5,
  "08/10/2024" : 6,
  "09/10/2024" : 7,
  "10/10/2024" : 8,
  "11/10/2024" : 9
}
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

const Datar = () => {
  const { dayId } = useParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDetails, setCurrentDetails] = useState({});
  const [newDetails, setNewDetails] = useState({});
  const {datarState : {datar}} = useDatar();  
  const {allFirmsState : {allFirms}} = useAllFirms();
  const today = new Date().toLocaleDateString("en-GB");
  let elements = [];
  const {userState : {user}} = useUser();
  let recievers = user === "bhanpuri" ? ["Rajesh Nakrani", "Piyush Rudani", "Harshad Chhabhaiya", "Shubham Bhagat"] : ["Vijay Chhabhaiya"];

  useEffect(()=>{
    setResults((dayId==="all" ? datar : datar.filter(firm=>firm.date === days[dayId])).filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) || item.place.toLowerCase().includes(searchTerm.toLowerCase().trim())
  ));
  },[dayId, datar, searchTerm]);

  for(let i=daysIndex[today];i<=9;i++){
    elements.push(
      <option value={days[`day-${i}`]}>{days[`day-${i}`]}</option>
    )
  }
  
  const handleModalClose = () => {
    setCurrentDetails({});  
    setNewDetails({});  
    setSearchTerm('');
  };

  const saveNewFirm = async () => {
    const docRef = await addDoc(collection(db,"datar"),{...newDetails, date: Timestamp.fromDate(new Date())});

    if(newDetails.aarti >0){
      await addDoc(collection(db, "yajman"), {
        name: newDetails.name,
        place: newDetails.place,
        aartiDate: newDetails.aartiDate,
        aartiName : newDetails.aartiName
      })
    }

    if(allFirms.find(firm => firm.name === newDetails.name) && (newDetails.data === "prasadi"  || newDetails.data === "coupon")){
        await updateDoc(doc(db, "allFirms", newDetails.name), {
          [newDetails.data] : newDetails.amount,
          datarPayer : newDetails.payer,
          datarMobile : newDetails.mobile,
          datarReciever : newDetails.reciever
        });
    }
    else if(allFirms.find(firm => firm.name === newDetails.name) && (newDetails.data === "aarti")){
      await updateDoc(doc(db, "allFirms", newDetails.name), {
        aartiDate: newDetails.aartiDate,
        aartiName : newDetails.aartiName,
        aarti : newDetails.amount,
        datarPayer : newDetails.payer,
        datarMobile : newDetails.mobile,
        datarReciever : newDetails.reciever
      });
    }
    console.log("Document written with document id: ", docRef);
    document.getElementById('newFirmClose').click();
  }

  const saveUpdatedFirm = async () => {
    let updatingDatarBody = {};
    if(currentDetails.data){ 
      updatingDatarBody = {...updatingDatarBody, data: currentDetails.data}
    }
    if(currentDetails.amount > 0){
       updatingDatarBody = {...updatingDatarBody, amount: currentDetails.amount}
    }
    if(currentDetails.payer){
       updatingDatarBody = {...updatingDatarBody, payer: currentDetails.payer}
    }
    if(currentDetails.mobile ){
       updatingDatarBody = {...updatingDatarBody, mobile: currentDetails.mobile}
    }
    if(currentDetails.reciever){
       updatingDatarBody = {...updatingDatarBody, reciever: currentDetails.reciever}
    }

    await updateDoc(doc(db, "datar", currentDetails.id), updatingDatarBody);

    document.getElementById('newFirmClose').click();
  }

  const deleteFirm = async (id) => {
    await deleteDoc(doc(db, "datar", id));
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
  }, [datar]);

  const totalPages = Math.ceil(results?.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = results?.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const downloadTable = () => {
    const doc = new jsPDF();
    doc.text(`datar ${dayId}`, 15, 12);
    autoTable(doc, { html: '#fullDataTable' });
    doc.save('collections.pdf')
}

  return (
    <div className="App d-flex flex-column min-vh-100">
     <Navbar />
      <main className="container mt-3 flex-fill">
          <div className="d-flex justify-content-between mb-2">
            <div className="header">
              <span className="h2">Datar</span>
              <span className=" px-3 fs-6">
                <Link to="/datar">Datar</Link> / <Link to={`/datar/${dayId}`}>{dayId}</Link>
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
                  <th className="text-center border-3">Data</th>
                  <th className="text-center border-3">Amount</th>
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
                        {firm.data}
                      </td>
                      <td className="text-center border-3">{firm.amount >0 ? firm.amount : "-"}</td>
                     <td className="text-center border-3 d-flex gap-3 justify-content-center">
                      <i className="bi bi-trash3-fill" title="Delete Firm" onClick={()=>deleteFirm(firm.id)}></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            null
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
                  <input type="text" className="form-control" id="name" value={currentDetails?.name} onChange={e=>setCurrentDetails({...currentDetails, name: e.target.value})} required/>
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
                <label htmlFor="previous" className="col-sm-2 col-form-label">Data</label>
                <div className="col-sm-10">
                  <select className="form-select" aria-label="Default select example" onChange={e=>setCurrentDetails({...currentDetails, data: e.target.value})}>
                    <option></option>
                    <option value="prasadi" selected={currentDetails?.data === "prasadi"}>Prasadi</option>
                    <option value="aarti"selected={currentDetails?.data === "aarti"}>Aarti</option>
                    <option value="coupon" selected={currentDetails?.data === "coupon"}>Coupon</option>
                    <option value="murti" selected={currentDetails?.data === "murti"}>Mataji ni Murti</option>
                    <option value="jyot" selected={currentDetails?.data === "jyot"}>Garba ni Jyot</option>
                    <option value="fulmala" selected={currentDetails?.data === "fulmala"}>Fulmala</option>
                  </select>
                </div>
              </div>
              {
                currentDetails?.data === "aarti" ?
                (
                <span>
                  <div className="mb-3 row">
                      <label htmlFor="aartiDate" className="col-sm-4 col-form-label">Aarti Date</label>
                      <div className="col-sm-8">
                      <select class="form-select" id="aartiDate" aria-label="Default select example" value={currentDetails?.aartiDate} onChange={e=>setCurrentDetails({...currentDetails, aartiDate: e.target.value})}>
                          <option></option>
                          {elements.map(element => element)}
                        </select>
                      </div>
                  </div>
                  <div className="mb-3 row">
                      <label htmlFor="aartiName" className="col-sm-4 col-form-label">Aarti</label>
                      <div className="col-sm-8">
                      <select class="form-select" id="aartiName" aria-label="Default select example" onChange={e=>setCurrentDetails({...currentDetails, aartiName: e.target.value})}>
                          <option ></option>
                          <option value="pratham" selected={currentDetails?.aartiName === "pratham"}>Pratham (1st)</option>
                          <option value="dritya" selected={currentDetails?.aartiName === "dritya"}>Biji (2nd)</option>
                        </select>
                      </div>
                  </div>
                </span>
                ) :  null
              }
              <div className="mb-3 row">
                <label htmlFor="current" className="col-sm-2 col-form-label">Amount</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="current" value={currentDetails?.amount} onChange={e=>setCurrentDetails({...currentDetails, amount: Number(e.target.value)})} required/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerName" className="col-sm-2 col-form-label">Haste (Payer)</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerName" value={currentDetails?.payer} onChange={e=>setCurrentDetails({...currentDetails, payer: e.target.value})} required/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="payerNumber" className="col-sm-2 col-form-label">Mobile Number</label>
                <div className="col-sm-10">
                  <input type="text" placeholder="-" className="form-control" id="payerNumber" value={currentDetails?.mobile} onChange={e=>setCurrentDetails({...currentDetails, mobile:  e.target.value})} required/>
                </div>
              </div>
              <div className="mb-3 row">
                <label htmlFor="receiver" className="col-sm-2 col-form-label">Haste (Receiver)</label>
                <div className="col-sm-10">
                    <select class="form-select" id="receiver" aria-label="Haste (Reciever)" onChange={e=>setNewDetails({...newDetails, reciever: e.target.value})}>
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
              <button type="submit" className="btn btn-primary" onClick={()=>saveUpdatedFirm(currentDetails)}>Save changes</button>
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
                <label htmlFor="name" className="col-sm-2 col-form-label">Firm Name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="name" placeholder="Firm Name"  value={newDetails?.name} onChange={e=>setNewDetails({...newDetails, name: e.target.value})}/>
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
                <label htmlFor="data" className="col-sm-2 col-form-label">Datar Type</label>
                <div className="col-sm-10">
                  <select className="form-select" aria-label="Default select example" onChange={e=>setNewDetails({...newDetails, data: e.target.value})}>
                    <option selected></option>
                    <option value="prasadi">Prasadi</option>
                    <option value="aarti">Aarti</option>
                    <option value="coupon">Coupon</option>
                    <option value="murti">Mataji ni Murti</option>
                    <option value="jyot">Garba ni Jyot</option>
                    <option value="fulmala">Fulmala</option>
                  </select>
                </div>
              </div>
              {
                newDetails.data === "aarti" ?
                (
                  <span>
                  <div className="mb-3 row">
                      <label htmlFor="aartiDate" className="col-sm-4 col-form-label">Aarti Date</label>
                      <div className="col-sm-8">
                      <select class="form-select" id="aartiDate" aria-label="Default select example" value={newDetails?.aartiDate} onChange={e=>setNewDetails({...newDetails, aartiDate: e.target.value})}>
                          <option></option>
                          {elements.map(element => element)}
                        </select>
                      </div>
                  </div>
                  <div className="mb-3 row">
                      <label htmlFor="aartiName" className="col-sm-4 col-form-label">Aarti</label>
                      <div className="col-sm-8">
                      <select class="form-select" id="aartiName" aria-label="Default select example" onChange={e=>setNewDetails({...newDetails, aartiName: e.target.value})}>
                          <option ></option>
                          <option value="pratham" selected={newDetails?.aartiName === "pratham"}>Pratham (1st)</option>
                          <option value="dritya" selected={newDetails?.aartiName === "dritya"}>Biji (2nd)</option>
                        </select>
                      </div>
                  </div>
                </span>
                ) : 
                (
                  newDetails.data !== "prasadi" && newDetails.data !== "coupon" ? 
                  (
                    <div className="mb-3 row">
                      <label htmlFor="data" className="col-sm-2 col-form-label">Datar Name</label>
                      <div className="col-sm-10">
                        <input type="text" placeholder="-" className="form-control" id="data" onChange={e=>setNewDetails({...newDetails, data: e.target.value})}/>
                      </div>
                    </div>
                    )
                    : null
                )
              }
              <div className="mb-3 row">
                <label htmlFor="amount" className="col-sm-2 col-form-label">Amount</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="amount" onChange={e=>setNewDetails({...newDetails, amount: Number(e.target.value)})}/>
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
                  <input type="text" placeholder="-" className="form-control" id="payerNumber" value={newDetails?.payerMobile} onChange={e=>setNewDetails({...newDetails, mobile:  e.target.value})}/>
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
                  <th className="col-1 text-center border-3">Date</th>
                  <th className="col-5 border-3">Firm Name</th>
                  <th className="col-1 text-center border-3">Place</th>
                  <th className="text-center border-3">Data</th>
                  <th className="text-center border-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((firm) => {
                  return (
                    <tr key={firm.id}>
                      <td className="text-center border-3">{firm.date}</td>
                      <td className="fw-bold border-3">{firm.name}</td>
                      <td className="text-center border-3">{firm.place}</td>
                      <td className="border-3 text-center">{firm.data}</td>
                      <td className="text-center border-3">{firm.amount >0 ? firm.amount : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
              <tr>
                    <td className="text-center border-3"></td>
                    <td className="border-3"></td>
                    <td className="text-center border-3"></td>
                    <td className="fw-bold border-3 text-center">Total</td>
                    <td className="text-center border-3">{currentItems.reduce((acc,curr)=>acc+curr.amount,0)}</td>
                  </tr>
              </tfoot>
      </table>
    </div>
  );
}

export default Datar;
