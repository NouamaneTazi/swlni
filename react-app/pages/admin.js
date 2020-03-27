import Head from "next/head"
import { useState, useEffect } from "react"
import Layout from '../components/Layout'
import { useFetchUser } from '../lib/user'

const Admin = () => {
    const getUserData = async (user) => {
        let res = await fetch('/api/mongodb?auth0id=' + user.sub)
        let json = await res.json()
        Object.assign(user, json)
        res = await fetch('/api/mongodb?getAllSeances=true')
        const value = await res.json()
        setTutors(value)
    }

    const getNumberSeances = tutors => {
        let seances = tutors.map(tutor => tutor.seances).filter(seance => seance !== undefined && seance.length > 0)
        // console.log("seances",seances)
        return seances.reduce((acc, seance) => acc + seance.length, 0)
    }

    const handleModClick = async (tutor, seance_id) => {
        if (tutor.seances[seance_id].mod) {
            delete tutor.seances[seance_id].mod
        } else {
            tutor.seances[seance_id].mod = { "id": user.sub, "name": user.name }
        }

        const res = await fetch('/api/mongodb', {
            method: 'post',
            body: JSON.stringify({ _id: tutor._id, data: { seances: tutor.seances } })
        })
        setRefresh(!refresh)
    }

    let { user, loading } = useFetchUser()
    const [tutors, setTutors] = useState([])
    const [refresh, setRefresh] = useState(true)

    useEffect(() => {
        // {console.log("useEffect", user, loading)}
        if (user && !loading) {
            getUserData(user)
        }
    }, [user, loading])

    return (
        <>
            {console.log(user)}
            {!loading && <Layout user={user} loading={loading}>
                <Head>
                    <title>Admin Page</title>
                    <meta name="description" content="Admin Page" />
                </Head>
                <section id="one">
                    <div className="inner">
                        <header className="major">
                            <h1>Tuteurs</h1>
                        </header>
                        {tutors.length > 0 ?
                            <div className="12u 12u(medium)">
                                <h3>Compteur de séances données :</h3>
                                <div className="box" style={{ textAlign: "center" }}>
                                    <h1>{getNumberSeances(tutors)}</h1>
                                </div>

                            </div> : null
                        }

                        <div className="12u 12u(medium)">
                            {tutors.map(tutor => (
                                <div key={tutor._id} className="table-wrapper">
                                    <h4>{tutor.firstname} {tutor.lastname} <i>({tutor.last_updated})</i></h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Durée</th>
                                                <th>Chapitres traités</th>
                                                <th>Elèves absents</th>
                                                <th>Remarques</th>
                                                <th>Traité</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tutor.seances ? tutor.seances.map((seance, index) => (
                                                <tr key={`${tutor._id}~${index}`}>
                                                    <td>{seance.date}</td>
                                                    <td>{seance.duree}</td>
                                                    <td>{seance.chapitres}</td>
                                                    <td>{Object.values(seance.absents).join(', ')}</td>
                                                    <td>{seance.remarques}</td>
                                                    <td>
                                                        {!seance.mod || seance.mod.id == user.sub ?
                                                            <>
                                                                <input type="checkbox" id={`${tutor._id}~${index}`} name="demo-human" onClick={() => handleModClick(tutor, index)} />
                                                                <label htmlFor={`${tutor._id}~${index}`}>{seance.mod ? seance.mod.name : ""}</label>
                                                            </>
                                                            : <>
                                                                <input type="checkbox" id={`${tutor._id}~${index}`} name="demo-human" checked />
                                                                <label htmlFor={`${tutor._id}~${index}`}>{seance.mod.name}</label>
                                                            </>
                                                        }
                                                    </td>
                                                </tr>
                                            )) : null}
                                        </tbody>
                                    </table>
                                </div>

                            ))}
                        </div>

                    </div>
                </section>
            </Layout>
            }
        </>
    )
}

export default Admin