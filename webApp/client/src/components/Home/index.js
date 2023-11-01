import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const HomePage = () => {
	const [userLists, setUserLists] = useState([]);
	const [showListModal, setShowListModal] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [newListDescription, setNewListDescription] = useState('');

    useEffect(() => {
        getLists();
    }, []);

    const getLists = async () => {
        const url = "/api/lists";
        let response;
        try {
            response = await axios.get(url);
			setUserLists(response.data);
        } catch {
            console.error("Error fetching lists");
        }
    }

	const createList = async () => {
		const url = "/api/newlist";
		const data = {
			name: newListName,
			description: newListDescription
		};
	
		try {
			const response = await axios.post(url, data);
			console.log(response.data);
			return response.data.listid;
		} catch (error) {
			console.error("Error posting list", error);
		}
	}

	const handleModalClose = () => {
        setShowListModal(false);
    }

	const handleListCreation = async () => {
		console.log(newListName);
		console.log(newListDescription);
		setShowListModal(false);
		const newlistid = await createList();
		window.location.href = `http://localhost:3000/build/${newlistid}`;
	}

	const handleNewListClick = async () => {
		const loggedIn = localStorage.getItem('username');
		if (!loggedIn) {
			window.location.href = 'http://localhost:3001/auth/github';
		}
		else {
			setShowListModal(true);
		}
    }

	return (
		<div className="HomeContainer">

			<Modal show={showListModal} onHide={handleModalClose}>
				<Modal.Header closeButton>
					<Modal.Title>Create New List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						<label>Name</label>
						<input
							id='name'
							type='text'
							onChange={(e) => setNewListName(e.target.value)}
							value={newListName}
							className="description-box"
						/>
					</div>
					<div>
						<label>Description</label>
						<input
							id='description'
							type='text'
							onChange={(e) => setNewListDescription(e.target.value)}
							value={newListDescription}
							className="description-box"
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
					<Button variant="primary" onClick={handleListCreation}>Make List</Button>
				</Modal.Footer>
			</Modal>

			<div className="ListsContainer">
				<button className='card-button' onClick={handleNewListClick} title='Create a new list'>
					<p className="card-text card-new text-center">+</p>
				</button>
				{ userLists.map((partlist) => (
					<Link className='card-link' to={`/build/${partlist.listid}`} key={partlist.listid}>
						<button className='card-button'>
							<p className="card-text text-center card-tit">{partlist.name}</p>
							<hr className='hr-line' />
							<p className="card-text text-center card-desc">{partlist.description}</p>
							<hr className='hr-line' />
							<p className="card-text text-center card-price">${partlist.totalprice}</p>
						</button>
					</Link>
				))}
			</div>
		</div>
	)
}

export default HomePage;