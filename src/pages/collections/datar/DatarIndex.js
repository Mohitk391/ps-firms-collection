import { Link } from "react-router-dom"
import Navbar from "../../../components/Navbar/Navbar";
import UmiyaMataji from "../../../assets/umiya-mataji.png";
import { useDatar } from "../../../contexts/DatarContext";
import { useEffect, useState } from "react";

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


const DatarIndex = () => {
    const {datarState: {datar}} = useDatar();
    const [day, setDay] = useState(0);
    let elements = [];

    console.log(datar);

    useEffect(()=>{
        setDay(datar.reduce((acc,curr)=>daysIndex[curr.date]>acc?daysIndex[curr.date] : acc,0))
    },[datar]);

    for(let i=1; i<=day; i++) {
        let total = (datar.filter(firm=>firm.date === days[`day-${i}`])).reduce((acc,curr)=>acc+curr.amount,0);
        elements.push(
            <div className="day-one d-grid mb-2 mx-5" key={i}>
                <Link to={`/datar/day-${i}`} className="btn btn-outline-dark d-flex">
                    <span className="me-auto">Day {i}</span> 
                    <span className="me-3">Total - {total}</span>
                </Link>
            </div>
        );
    }

    return (
    <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container mt-3 flex-fill">
            <div className="d-flex justify-content-between mb-1">
                <h2>Datar</h2>
            </div>
            <div className="day-index">
                <div className="all d-grid my-2 mx-5">
                    <Link to="/datar/all" className="btn btn-outline-dark d-flex"><span className="me-auto">All</span> <span className="me-3">Total - {datar.reduce((acc,curr)=>acc+curr.amount,0)}</span></Link>
                </div>
                {
                    elements.map(element => element)
                }
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

export default DatarIndex