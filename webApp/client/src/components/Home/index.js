import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import { StyleSheet, TextInput } from 'react-native';
import Button from 'react-bootstrap/Button';

const HomePage = () => {
	const [userLists, setUserLists] = useState([]);
	const dummyData = [{_id: "1", name: "List 1", description: "List 1 Desc", price:"1000"}, 
					   {_id: "2", name: "List 2", description: "List 2 Desc", price:"2000"}, 
					   {_id: "3", name: "List 3", description: "List 3 Desc", price:"3000"}, 
					   {_id: "4", name: "List 4", description: "List 4 Desc", price:"4000"},
					   {_id: "5", name: "List 5", description: "List 5 Desc", price:"5000"}]

	// using the style sheet wasn't working for me with the text input
	const textInputStyles = StyleSheet.create({
		input: {
			borderColor: "black",
			width: "100%",
			borderWidth: 1,
			borderRadius: 10,
			padding: 10,
		  },
	});

    useEffect(() => {
        getLists();
    }, []);

	const [showListModal, setShowListModal] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [newListDescription, setNewListDescription] = useState('');

    const getLists = async () => {
        const url = "api/lists";
        let response;
        try {
            response = await axios.get(url);
			console.log(response.data);
			console.log("Hi");
			setUserLists(response.data);
        } catch {
            console.error("Error fetching lists");
        }
    }

	const createList = async () => {
		const url = "api/newlist";
		const data = {
			name: newListName,
			description: newListDescription
		};
	
		try {
			const response = await axios.post(url, data);
			console.log(response.data);
			getLists();
		} catch (error) {
			console.error("Error posting list", error);
		}
	}

	const handleModalClose = () => {
        setShowListModal(false);
    }

	const handleListCreation = () => {
		console.log(newListName);
		console.log(newListDescription);
		setShowListModal(false);
		createList();
	}

	async function getLoggedIn() {
		const response = await axios.get('/api/user');
		return !!response.data.username;
	}

	const handleNewListClick = async () => {
		const loggedIn = await getLoggedIn();
		if (!loggedIn) {
			window.location.href = 'http://localhost:3001/auth/github';
		}
		else {
			setShowListModal(true);
		}
    }

	return (
		<div className="HomeContainer">
			<div className="ListsContainer">
				<Grid container spacing={2}>
					<Grid item key={0} xs={6} sm={4} md={4} lg={3}>
						<div className="card-c">
							<Modal show={showListModal} onHide={handleModalClose}>
								<Modal.Header closeButton>
									<Modal.Title>Create New List</Modal.Title>
								</Modal.Header>
								<Modal.Body>
									<div>
										<div>Name</div>
										<TextInput style={textInputStyles.input} enteredValue={newListName} setEnteredValue={setNewListName}/>
									</div>
									<div>
										<div>Description</div>
										<TextInput style={textInputStyles.input} enteredValue={newListDescription} setEnteredValue={setNewListDescription}/>
									</div>
								</Modal.Body>
								<Modal.Footer>
									<Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
									<Button variant="primary" onClick={handleListCreation}>Make List</Button>
								</Modal.Footer>
							</Modal>
							<button className='card-button' onClick={handleNewListClick}>
								<p className="card-text card-new text-center">+</p>
							</button>
						</div>
					</Grid>
					<Grid item xs={6} sm={4} md={4} lg={3}>
						{ userLists.map((partlist) => (
							<div key={partlist._id} className="card-c grid-item">
								<button className='card-button'>
									<p className="card-text text-center card-tit">{partlist.name}</p>
									<hr className='hr-line' />
									<p className="card-text text-center card-desc">{partlist.description}</p>
									<hr className='hr-line' />
									<p className="card-text text-center card-price">${partlist.price}</p>
								</button>
						</div>))}
					</Grid>
					
				</Grid>
			</div>
		</div>
	)
}

export default HomePage;