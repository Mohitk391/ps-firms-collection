import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import UmiyaMataji from "../../../assets/umiya-mataji.png";
import { useYajman } from "../../../contexts/YajmanContext";

const Yajman = () => {
    let today = new Date().toLocaleDateString("en-GB");
    const { yajmanState : {yajman}} = useYajman();
    let fafadih = yajman.filter(firm =>firm.place === "Fafadih");
    let bhanpuri = yajman.filter(firm =>firm.place === "Bhanpuri");
    let elements = [];

    const daysIndex = {
        1: "03/10/2024",
        2: "04/10/2024" ,
        3: "05/10/2024",
        4: "06/10/2024",
        5: "07/10/2024",
        6: "08/10/2024",
        7: "09/10/2024",
        8: "10/10/2024",
        9: "11/10/2024"
    }

      for(let i=1; i<=9; i++) {
        elements.push(
            <span>
                <div className="date">
                    <span className="h3">{daysIndex[i]} - Day {i}</span>
                </div>
                <div className="fafadih border border-2 rounded shadow-sm">
                    <h2 className="text-center">Fafadih</h2>
                    <div className="table-body d-flex justify-content-around">
                        <div className="pratham border d-flex flex-column align-items-center flex-fill w-50">
                            <h4 className="text-center border-bottom w-100">Pratham</h4>
                            <div className="result-body">
                                {
                                    fafadih.filter(firm =>firm.aartiName === "pratham" && firm.aartiDate === daysIndex[i]).map(firm => {
                                        return (<p>{firm.name}</p>)
                                    })
                                }
                            </div>
                        </div>
                        <div className="biji border d-flex flex-column align-items-center flex-fill w-50">
                            <h4 className="text-center border-bottom w-100">Biji</h4>
                            <div className="result-body">
                                {
                                    fafadih.filter(firm =>firm.aartiName === "dritya"&& firm.aartiDate === daysIndex[i]).map(firm => {
                                        return (<p>{firm.name}</p>)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bhanpuri border border-2 rounded shadow-sm">
                    <h2 className="text-center">Bhanpuri</h2>
                    <div className="table-body d-flex justify-content-around">
                        <div className="pratham border flex-fill w-50 d-flex flex-column align-items-center">
                            <h4 className="text-center border-bottom w-100">Pratham</h4>
                            <div className="result-body">
                                {
                                    bhanpuri.filter(firm =>firm.aartiName === "pratham"&& firm.aartiDate === daysIndex[i]).map(firm => {
                                        return (<p>{firm.name}</p>)
                                    })
                                }
                            </div>
                        </div>
                        <div className="biji border flex-fill w-50 d-flex flex-column align-items-center">
                            <h4 className="text-center border-bottom w-100">Biji</h4>
                            <div className="result-body">
                                {
                                    bhanpuri.filter(firm =>firm.aartiName === "dritya" && firm.aartiDate === daysIndex[i]).map(firm => {
                                        return (<p>{firm.name}</p>)
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </span>
        );
    }

    return (
        <div className="App d-flex flex-column min-vh-100">
        <Navbar />
         <main className="container mt-3 flex-fill">
             <div className="d-flex justify-content-between mb-2">
               <div className="header">
                 <span className="h2">Yajman</span>
               </div>
               <div className="date">
                <span className="h3">Today - {today}</span>
               </div>
             </div>
             <div className="main-body container d-flex flex-column gap-3">
                {elements.map(el => el)}
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
    )
}

export default Yajman;