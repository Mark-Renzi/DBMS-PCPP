import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Details from '../Details';
import PageTitleContext from '../../context/pageTitleContext';
import './style.css';

const Configurator = () =>{
    const componentNames = ["CPU", "CPU Cooler", "Motherboard", "Memory", "Graphics Card", "Storage", "Case", "Power Supply"];
    const [listLoading, setListLoading] = useState(false);
    const [listInfo, setListInfo] = useState({});
    const [listInfoLoading, setListInfoLoading] = useState(false);
    const [listTDP, setListTDP] = useState({});
    const [parts, setParts] = useState(
        componentNames.map(name => ({
            name,
            model: null,
            manufacturer: null,
            price: null,
        }))
    );
    const [showDetailModal, setShowDetailModal] = useState(false);
	const [detailPart, setDetailPart] = useState(null);

    const { listid } = useParams();
    const { updatePageTitle } = useContext(PageTitleContext);

    useEffect(() => {
        updatePageTitle("Configurator");
        getPartsList();
        getListInfo();
        getListTDP();
    }, []);

    useEffect(() => {
        const totalPrice = parts.reduce((total, part) => {
            if (part.price) {
                return total + (part.price * part.quantity);
            }
            return total;
        }, 0);
        setListInfo({ ...listInfo, totalprice: totalPrice.toFixed(2) });
    }, [parts]);

    const addComponent = (index) => {
        window.location.href = `http://localhost:3000/browse/${index}?listid=${listid}`;
    };

    const getPartsList = () => {
        setListLoading(true);
        axios.get(`/api/configurator/${listid}`)
            .then(response => {
                const newParts = componentNames.map(() => ({
                    name: '',
                    model: null,
                    manufacturer: null,
                    price: null,
                    type: null,
                }));
    
                response.data.forEach(part => {
                    if (part.name) {
                        newParts[part.type] = { ...part };
                    } else if (part.parttype !== undefined) {
                        newParts[part.parttype] = { ...part, name: componentNames[part.parttype] };
                    }
                });
    
                newParts.forEach((part, index) => {
                    if (!part.model) {
                        newParts[index] = {
                            ...part,
                            name: componentNames[index],
                        };
                    }
                });
    
                setParts(newParts);
                setListLoading(false);
            })
            .catch(error => {
                console.error('Error fetching parts list!', error);
            });
    };

    const getListInfo = () => {
        setListInfoLoading(true);
        axios.get(`/api/listinfo/${listid}`)
            .then(response => {
                setListInfo({ ...listInfo, ...response.data });
                updatePageTitle(response?.data.name || "Configurator");
                setListInfoLoading(false);
            })
            .catch(error => {
                console.error('Error fetching list info!', error);
            });
    };

    const getListTDP = () => {
        axios.get(`/api/listtdp/${listid}`)
            .then(response => {
                setListTDP(response.data);
            })
            .catch(error => {
                console.error('Error fetching list TDP!', error);
            });
    }
    
    const changeQuantity = async (index, newQuantity) => {
        const updatedParts = [...parts];
        const partToUpdate = updatedParts[index];
    
        partToUpdate.quantity = newQuantity;
        setParts(updatedParts);
    
        await axios.put(`/api/updatequantity/${listid}`, {
            partid: partToUpdate.partid,
            quantity: newQuantity
        })
        .then(response => {
            getListTDP();
        })
        .catch(error => {
            console.error('Error updating quantity!', error);
            // reset the quantity to its original value in case of error?
        });
    };
    

    const deletePart = async (partid) => {
        await axios.delete(`/api/deletepart/${listid}`, { data: { partid } })
            .then(() => {
                const updatedParts = parts.map(part => {
                    if (part.partid === partid) {
                        return { ...part, model: null, manufacturer: null, price: null, quantity: 1 }; // Reset part details
                    }
                    return part;
                });
                setParts(updatedParts);
                getListTDP();
            })
            .catch(error => {
                console.error('Error deleting part!', error);
            });
    };

    const handleShowDetailModal = async (partl) => {
		setDetailPart(partl);
		setShowDetailModal(true);
	}
	const handleCloseDetailModal = () => {
		setDetailPart(null);
		setShowDetailModal(false);
	}
    
    const renderRow = (part, index) => {
        if (listLoading) {
            return (
                <tr key={index} className='Table-Base-TR'>
                    <td>{componentNames[index]}</td>
                    <td colSpan="5" className="text-center">
                        <div className='table-spinner'>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    </td>
                </tr>
            );
        }
    
        const quantityOptions = Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
        ));

        return (
            <tr key={index} className='Table-Base-TR'>
                <td>{part.name}</td>
                {/* + Choose {part.name}</button>} */}
                <td>{part.model ? 
                    <Link className='btn text-primary' onClick={() => handleShowDetailModal(part)}>{part.chipset} {part.model}</Link> 
                    : 
                    <button className='btn btn-primary' onClick={() => addComponent(index)}>Add Part</button>}
                </td>
                <td>{part.manufacturer || ''}</td>
                <td>
                    {part.model && (
                        <select
                            value={part.quantity || 1}
                            onChange={(e) => changeQuantity(index, e.target.value)}
                        >
                            {quantityOptions}
                        </select>
                    )}
                </td>
                <td>{part.price ? `$${(part.price * part.quantity).toFixed(2)}` : ''}</td>

                <td>{part.model ? 
                    <button className='list-button btn btn-danger' onClick={() => deletePart(part.partid)} title='Remove this part from the list'>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                    : 
                    null}
                </td>
            </tr>
        );
    };
    

    return (
        <>

            <Modal show={showDetailModal} onHide={handleCloseDetailModal} className="wide-modal">
                <Modal.Header closeButton>
                <Modal.Title>{detailPart?.manufacturer} {detailPart?.model} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body className='body-details'>
					{detailPart ? (
						<Details
							{...detailPart}
						/>
					) : (
						<Spinner animation="border" role="status">
							<span className="visually-hidden">Loading...</span>
						</Spinner>
					)}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDetailModal}>Close</Button>
                    {/* <Button variant="primary" href={`/part/${detailPart?.partid}`}>Go to part</Button> */}
                </Modal.Footer>
            </Modal>

            {/* { listInfo.name ? 
                <h2>{listInfo.name}</h2>
            :
                <h2>Configurator</h2>
            } */}
            <div className='Page-Content-Container'>
                {/* <table id="part-table"> */}
                <table className='Table-Base'>
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.map(renderRow)}
                    </tbody>
                </table>
            </div>
            <div className='Page-Content-Container Spacer'>
                <div>
                    {listInfoLoading ?
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    :
                        <div className='Bottom-Info-Container'>
                            <div className='Bottom-Info'>
                                <span><strong>PSU Wattage: </strong>{listTDP.wattage || 0} W</span>
                                <span><strong>CPU + GPU TDP: </strong>{listTDP.sum_tdp || 0} W</span>
                                <span><strong>Total Price:</strong> ${listInfo.totalprice}</span>
                            </div>
                            {listInfo?.description && listInfo.description !== '' ? (
									<span className='Info-Desc'>{listInfo.description}</span>
                                ) : (
									null
                            )}
                        </div>
                    }
                </div>
            </div>
            

        </>
    )
};

export default Configurator;
