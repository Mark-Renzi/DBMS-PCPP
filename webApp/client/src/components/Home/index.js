import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { Grid } from '@mui/material';
import { Link, NavLink } from 'react-router-dom';

const HomePage = () => {
	const [userLists, setUserLists] = useState([]);
	const dummyData = [{_id: "1", name: "List 1", description: "List 1 Desc", price:"1000$"}, 
					   {_id: "2", name: "List 2", description: "List 2 Desc", price:"2000$"}, 
					   {_id: "3", name: "List 3", description: "List 3 Desc", price:"3000$"}, 
					   {_id: "4", name: "List 4", description: "List 4 Desc", price:"4000$"},
					   {_id: "5", name: "List 5", description: "List 5 Desc", price:"5000$"}]

    useEffect(() => {
        getLists();
    }, []);

    const getLists = async () => {
        const url = "api/lists";
        let response;
        try {
            response = await axios.get(url);
			console.log(response.data);
			setUserLists(dummyData);
        } catch {
            console.error("Error fetching lists");
        }
    }

	return (
		<div className="HomeContainer">
			<div className="ListsContainer">
				<Grid container spacing={2}>
					<Grid item key={0} xs={6} sm={4} md={4} lg={3}>
						<div className="card-c">
							<p className="card-text card-new text-center">+</p>
						</div>
					</Grid>
					{ userLists.map((partlist, index) => (
						<Grid item key={partlist._id} xs={6} sm={4} md={4} lg={3} className="grid-item">
							{/* <div className="card-c">
								<div className="card-header">{partlist.name}</div>
								<div className="card-body">
									<p className="card-text">{partlist.description}</p>
								</div>
								<div className="card-footer text-muted">
									<p className="card-text">{partlist.price}</p>
								</div>
							</div> */}
							<div className="card-c">
								<p className="card-text card-title text-center">{partlist.name}</p>
							</div>
					  	</Grid>
					))}
				</Grid>
			</div>
			<div>
				<Link to="/build">
					<button className="create-button">Create New List</button>
				</Link>
			</div>
		</div>
	)
}

export default HomePage;