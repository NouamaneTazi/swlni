import Head from "next/head"
import { useState, useEffect } from "react"
import Layout from '../components/Layout'
import { useFetchUser } from '../lib/user'

const Profile = () => {

    const getUserData = async (user) => {
        let res = await fetch('/api/mongodb?auth0id=' + user.sub)
        let json = await res.json()
        // console.log("json", json)
        if (json.err) {
            setError(true)
        }
        else if (json.notYetSetUp) {
            let res = await fetch('/api/mongodb?role=tutor') // find all tutors
            const json = await res.json()
            console.log("tutors", json)
            user.needsSetup = true
            setTutors(json)
        }
        else if (json.role=="tutor") {
            res = await fetch('/api/mongodb?groupId=' + json.groupId)
            json.students = await res.json()
            json.students = json.students.filter(student => student.role=="student")
            console.log("json", json)
            Object.assign(user, json); 
            user.isSetup = true
            setUserData(user)
        }
    }

    const associateTutor = async (mongodbId) => {
        const res = await fetch('/api/mongodb', {
            method: 'post',
            body: JSON.stringify({ _id: mongodbId, auth0id: user.sub })
        })
        window.location.reload(false);
    }

    let { user, loading } = useFetchUser()
    const [userData, setUserData] = useState()
    const [tutors, setTutors] = useState()
    const [error, setError] = useState()

    useEffect(() => {
        // {console.log("useEffect", user, loading)}
        if (user && !loading) {
            getUserData(user)
        }
    }, [user, loading])

    let mongodbId = ""

    return (
        <>
            {!loading && <Layout user={user} loading={loading}>
                {console.log("user", user)}
                <Head>
                    <title>Profile Page</title>
                    <meta name="description" content="Profile Page" />
                </Head>

                {user && user.isSetup ? <div id="main" className="alt">
                    <section id="one">
                        <div className="inner">
                            <header className="major">
                                <h1>Profile</h1>
                            </header>

                            <div className="row 200%">
                                <div className="6u 12u(medium)">
                                    <h2 id="content">Nouamane Tazi</h2>
                                    <ul className="alt">
                                        <li><strong>Email :</strong> {userData.email}</li>
                                        <li><strong>Phone :</strong> {userData.phone}</li>
                                    </ul>

                                </div>
                            </div>

                            <div className="12u 12u(medium)">
                                <h4>Liste des élèves</h4>
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Nom</th>
                                                <th>Demandes</th>
                                                <th>Filière</th>
                                                <th>Téléphone</th>
                                                <th>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {userData.students.map(student => (<tr key={student._id}>
                                                <td>{student.name}</td>
                                                <td>{student.wishes}</td>
                                                <td>{student.filiere}</td>
                                                <td>{student.phone}</td>
                                                <td>{student.email}</td>
                                            </tr>))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>
                    // user not associated
                    : user && user.needsSetup ? <div id="main" className="alt">
                        <section id="one">
                            <div className="inner">
                                <header className="major">
                                    <h1>Profile</h1>
                                </header>

                                <div className="row 200%">
                                    <div className="6u 12u(medium)">
                                        <h2 id="content">Mettez à jour votre profil</h2>
                                        <h4>Selectionnez votre nom :</h4>
                                        <ul className="actions">
                                            {tutors.map(tutor => (
                                                <div className="4u 12u(small)" key={tutor._id}>
                                                    <input type="radio" id={`${tutor.firstname}-${tutor.lastname}`} name="demo-priority" onChange={() => { mongodbId = tutor._id }} />
                                                    <label htmlFor={`${tutor.firstname}-${tutor.lastname}`}>{tutor.firstname} {tutor.lastname}</label>
                                                </div>
                                            ))}
                                        </ul>
                                        <div className="12u">
                                            <ul className="actions">
                                                <div className="button special" onClick={() => mongodbId ? associateTutor(mongodbId) : null}>Submit</div>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </section>
                    </div>
                        // Not yet connected
                        : <div id="main" className="alt">
                            <section id="one">
                                <div className="inner">
                                    <header className="major">
                                        <h1>Profile</h1>
                                    </header>
                                    <h2 id="content">Vous n'êtes pas encore connectés</h2>
                                    <a href="/api/login" className="button special">Connectez-vous !</a>
                                </div>
                            </section>
                        </div>
                }


            </Layout>}
        </>
    )
}

export default Profile