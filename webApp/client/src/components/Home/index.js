import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './style.css';
import { Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faXmark, faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import PageTitleContext from '../../context/pageTitleContext';

const HomePage = () =>{
	const [userLists, setUserLists] = useState([]);
	const [showListModal, setShowListModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [editListName, setEditListName] = useState('');
	const [newListDescription, setNewListDescription] = useState('');
	const [editListDescription, setEditListDescription] = useState('');
	const [editListID, setEditListID] = useState('');
	const [listsLoading, setListsLoading] = useState(false);

	const { updatePageTitle } = useContext(PageTitleContext);

    useEffect(() => {
		updatePageTitle('Home');
        getLists();
    }, []);

    const getLists = async () => {
		setListsLoading(true);
        const url = "/api/lists";
        let response;
		console.log("Getting lists")
        try {
            response = await axios.get(url);
			if (response.status !== 200) {
				console.log("2")
				setListsLoading(false);
				return;
			}
			setUserLists(response.data);
			setListsLoading(false);
        } catch {
			console.log("1")
			setListsLoading(false);
            console.error("Error fetching lists");
        }
    }

	const createList = async () => {
		// if (newListDescription == ''){
		// 	setNewListDescription('_');
		// }

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
		setShowEditModal(false);
    }

	const handleListCreation = async () => {
		if (newListName !== '') {
			setShowListModal(false);
			const newlistid = await createList();
			window.location.href = `http://localhost:3000/build/${newlistid}`;
		}
	}

	const handleEditList = async () => {
		// if (editListDescription == ''){
		// 	setEditListDescription('_');
		// }

		if (editListName !== '') {
			let url = "/api/editList/";
			url += editListID;
			const data = {
				name: editListName,
				description: editListDescription
			};
		
			try {
				const response = await axios.post(url, data);
				console.log(response.data);
				return response.data.listid;
			} catch (error) {
				console.error("Error editing list", error);
			} finally {
				setShowEditModal(false);
				getLists();
			}
		}
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

	const editList = (id, name, description) => {
		setEditListID(id);
		setEditListName(name);
		setEditListDescription(description);
        setShowEditModal(true);
    }

	const deleteList = async (id) => {
		let url = '/api/deletelist/';
		url += id;
	
		try {
			const response = await axios.delete(url);
			return response.data.listid;
		} catch (error) {
			console.error("Error deleting list", error);
		} finally {
			getLists();
		}
    }

	return (
		<div className="HomeContainer">
			<Modal show={showListModal} onHide={handleModalClose}>
				<Modal.Header closeButton>
					<Modal.Title>Create Part List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						<input
							id='name'
							type='text'
							onChange={(e) => setNewListName(e.target.value)}
							value={newListName}
							className="description-box"
							placeholder='Name'
						/>
					</div>
					<div>
						<input
							id='description'
							type='text'
							onChange={(e) => setNewListDescription(e.target.value)}
							value={newListDescription}
							className="description-box"
							placeholder='Description'
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
					<Button variant="primary" onClick={handleListCreation}>Make List</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={showEditModal} onHide={handleModalClose}>
				<Modal.Header closeButton>
					<Modal.Title>Edit Part List</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
						<input
							id='name'
							type='text'
							onChange={(e) => setEditListName(e.target.value)}
							value={editListName}
							className="description-box"
							placeholder='Name'
						/>
					</div>
					<div>
						<input
							id='description'
							type='text'
							onChange={(e) => setEditListDescription(e.target.value)}
							value={editListDescription}
							className="description-box"
							placeholder='Description'
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
					<Button variant="primary" onClick={handleEditList}>Edit List</Button>
				</Modal.Footer>
			</Modal>

			<div className="ListsContainer">
				{localStorage.getItem('username') ? (
					<button className='card-button card-new-center' onClick={handleNewListClick} title='Create a new list'>
						<FontAwesomeIcon className="card-new" icon={faPlus} />
					</button>
				) : (
					<button className='card-button logged-out-card card-text card-new-center' onClick={handleNewListClick} title='Create a new list'>
						<span>Login To Create Part Lists</span>
					</button>
				)}
				{ listsLoading ?
					<button className='card-button spinner-container'>
						<Spinner animation="grow" role="status">
							<span className="visually-hidden">Loading...</span>
						</Spinner>
					</button>
					:
					<>
						{ userLists.map((partlist) => (
							<Link className='card-link card-button' title={`Edit Part List: ${partlist.name}`} to={`/build/${partlist.listid}`} key={partlist.listid}>
								<div className='card-buttons'>
									<button className='list-button btn-info' id='edit-button' onClick={(e) => { e.preventDefault(); e.stopPropagation(); editList(partlist.listid, partlist.name, partlist.description); }}>
										<FontAwesomeIcon icon={faPenToSquare} />
									</button>
									<button className='list-button btn-danger' id='delete-button' onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteList(partlist.listid); }}>
										<FontAwesomeIcon icon={faXmark} />
									</button>
								</div>
								<p className="card-text text-center card-tit">{partlist.name}</p>
								<hr className='hr-line divider' />
								<p className="card-text text-center card-desc">{partlist.description}</p>
								{partlist.description !== '' ? (
									<hr className='hr-line divider' />
									) : (
									null
								)}
								<p className="card-text text-center card-price">${partlist.totalprice}</p>
							</Link>
						))}
					</>
				}
			</div>
		</div>
	)
}

export default HomePage;