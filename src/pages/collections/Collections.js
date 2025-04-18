import UmiyaMataji from "../../assets/umiya-mataji.png";
import {data} from "../../data/data";
import { useState } from "react";
import debounce from "lodash.debounce";
import Pagination from "../../utilities/Pagination/Pagination";
import { useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Link, useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const Collections = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDetails, setCurrentDetails] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem('data');
    if (storedData) {
      setResults(JSON.parse(storedData));
    }
  }, []);
  
  
  const handleModalClose = () => {
    setCurrentDetails({});  
    setSearchTerm('');
  };

  const saveNewFirm = (firmDetails) => {
    const newData = [...results, firmDetails];
    setResults(newData);
    localStorage.setItem('data', JSON.stringify(newData));
    document.getElementById('newFirmClose').click();
  }

  const saveUpdatedFirm = (firmDetails) => {
    const newData = results.map(firm => firm.id === firmDetails.id ? firmDetails : firm);
    setResults(newData);
    localStorage.setItem('data', JSON.stringify(newData));
    document.getElementById('newFirmClose').click();
  }

  const deleteFirm = (firmDetails) => {
    const newData = results.filter(firm=> firm.id !== firmDetails.id);
    setResults(newData);
    localStorage.setItem('data', JSON.stringify(newData));
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
  }, [results]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
    debouncedSearch(event.target.value);
  };

  const debouncedSearch = debounce((searchTerm) => {
    const filteredResults = data.filter((item) =>
      item.firmName.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
    setResults(filteredResults);
  }, 500);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = results.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const downloadTable = () => {
    const doc = new jsPDF();
    doc.text("Collections 2024", 15, 12);
    autoTable(doc, { html: '#fullDataTable' });
    doc.save('collections.pdf')
}

  return (
    <div className="App d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark">
        <div className="container-fluid">
            <Link className="navbar-brand d-flex" to="/collections">
              <img src={UmiyaMataji} className="mx-1" alt="logo" width="30"/>
              Patidar Yuva Mandal
            </Link>
            <form className="d-flex">
                <input className="form-control me-2" type="text" placeholder="Search" value={searchTerm} onChange={handleChange}/>
            </form>
            <button className="btn btn-outline-danger" onClick={()=>{navigate("/")}}>Logout</button>
        </div>
      </nav>
      <main className="container mt-3 flex-fill">
          <div className="d-flex justify-content-between mb-1">
            <h2>Collections</h2>
            <button onClick={downloadTable} className="btn btn-outline-dark" title="Download Records PDF"><i class="bi bi-file-earmark-arrow-down-fill"></i></button>
          </div>
          {results.length > 0 ? (
            <table className="table table-bordered table-hover" id="collectionTable">
              <thead>
                <tr>
                  <th className="col-6 border-3">Firm Name</th>
                  <th className="text-center border-3">Prev (2023)</th>
                  <th className="text-center border-3">Curr (2024)</th>
                  <th className="text-center border-3">Siksha Nidhi</th>
                  <th className="text-center border-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((firm) => {
                  return (
                    <tr role="button" key={firm.id}>
                      <td className="border-3">{firm.firmName}</td>
                      <td className="border-3 text-center border-3">
                        {firm.previousYearAmount >0 ? firm.previousYearAmount : "-"}
                      </td>
                      <td className="text-center border-3">{firm.currentYearAmount >0 ? firm.currentYearAmount : "-"}</td>
                      <td className="text-center border-3">{firm.sikshaNidhiAmount >0 ? firm.sikshaNidhiAmount : "-"}</td>
                      <td className="text-center border-3 d-flex gap-3 justify-content-center">
                      <i class="bi bi-building-fill-gear" data-bs-toggle="modal" data-bs-target="#updateDetails" onClick={()=> setCurrentDetails(firm)} title="Update Firm Details"></i>
                      <i class="bi bi-trash3-fill" title="Delete Firm" onClick={()=>deleteFirm(firm)}></i>
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
                data-bs-toggle="modal"
                data-bs-target="#addNew"
                onClick={()=>setCurrentDetails({...currentDetails, firmName: searchTerm})}
              >
                Add New Firm
              </button>
            </div>
          )}

          {results.length > ITEMS_PER_PAGE && (
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
            <Link href="/collections" className="d-flex align-items-center p-0 text-dark gap-0">
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
      <div className="modal fade" id="updateDetails" tabindex="-1" aria-labelledby="updateDetailsLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="updateDetailsLabel">Firm Details</h5>
              <button type="button" className="btn-close" id="newFirmClose"  data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 row">
                <label for="firmName" className="col-sm-2 col-form-label">Firm Name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="firmName" value={currentDetails?.firmName} onChange={e=>setCurrentDetails({...currentDetails, firmName: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="previousYearAmount" className="col-sm-2 col-form-label">Previous (2023)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="previousYearAmount" value={currentDetails?.previousYearAmount} onChange={e=>setCurrentDetails({...currentDetails, previousYearAmount: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="currentYearAmount" className="col-sm-2 col-form-label">Current (2024)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="currentYearAmount" value={currentDetails?.currentYearAmount} onChange={e=>setCurrentDetails({...currentDetails, currentYearAmount: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="sikshaNidhiAmount" className="col-sm-2 col-form-label">Siksha Nidhi</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="sikshaNidhiAmount" value={currentDetails?.sikshaNidhiAmount} onChange={e=>setCurrentDetails({...currentDetails, sikshaNidhiAmount: Number(e.target.value)})}/>
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
      <div className="modal fade" id="addNew" tabindex="-1" aria-labelledby="addNewLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addNewLabel">Firm Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" id="newFirmClose" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3 row">
                <label for="firmName" className="col-sm-2 col-form-label">Firm Name</label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" id="firmName" placeholder="Firm Name"  value={currentDetails?.firmName} onChange={e=>setCurrentDetails({...currentDetails, firmName: e.target.value})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="inputPassword" className="col-sm-2 col-form-label">Previous (2023)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="inputPassword" onChange={e=>setCurrentDetails({...currentDetails, previousYearAmount: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="inputPassword" className="col-sm-2 col-form-label">Current (2024)</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="inputPassword" onChange={e=>setCurrentDetails({...currentDetails, currentYearAmount: Number(e.target.value)})}/>
                </div>
              </div>
              <div className="mb-3 row">
                <label for="inputPassword" className="col-sm-2 col-form-label">Siksha Nidhi</label>
                <div className="col-sm-10">
                  <input type="number" min="0" placeholder="-" className="form-control" id="inputPassword" onChange={e=>setCurrentDetails({...currentDetails, sikshaNidhiAmount: Number(e.target.value)})}/>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" onClick={()=>saveNewFirm(currentDetails)}>Add Firm</button>
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
            <th className="text-center border-3">Siksha Nidhi</th>
            <th className="text-center border-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((firm) => {
            return (
              <tr role="button" key={firm.id}>
                <td className="border-3">{firm.firmName}</td>
                <td className="border-3 text-center border-3">
                  {firm.previousYearAmount >0 ? firm.previousYearAmount : "-"}
                </td>
                <td className="text-center border-3">{firm.currentYearAmount >0 ? firm.currentYearAmount : "-"}</td>
                <td className="text-center border-3">{firm.sikshaNidhiAmount >0 ? firm.sikshaNidhiAmount : "-"}</td>
                <td className="text-center border-3 d-flex gap-3 justify-content-center">
                <i class="bi bi-building-fill-gear"></i>
                <i class="bi bi-trash3-fill"></i>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Collections;
