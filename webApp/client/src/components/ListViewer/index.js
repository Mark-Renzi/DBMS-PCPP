import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import PageTitleContext from '../../context/pageTitleContext';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Details from '../Details';

const ListViewer = () => {
    const componentNames = ["CPU", "CPU Cooler", "Motherboard", "Memory", "Graphics Card", "Storage", "Case", "Power Supply"];
    const [parts, setParts] = useState(
      componentNames.map(name => ({
          name,
          model: null,
          manufacturer: null,
          price: null,
      }))
  );
    const [listInfo, setListInfo] = useState({});
    const [listTDP, setListTDP] = useState({});
    const [configuratorLoading, setcConfiguratorLoading] = useState(false);
    const [listInfoLoading, setListInfoLoading] = useState(false);
    const [listTDPLoading, setListTDPLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
	const [detailPart, setDetailPart] = useState(null);

    const { listid } = useParams();

    const { updatePageTitle } = useContext(PageTitleContext);

    useEffect(() => {
        getPartsList();
        getListInfo();
        getListTDP();
        updatePageTitle("Part List");
    }, []);

    const getPartsList = async () => {
        setcConfiguratorLoading(true);
        try {
            let response = await axios.get(`/api/configurator/${listid}`);
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
            setcConfiguratorLoading(false);
        } catch (e) {
            console.log("Error fetching parts list:", e);
        }
    };

    const getListInfo = async () => {
        setListInfoLoading(true);
        try {
            let response = await axios.get(`/api/listinfo/${listid}`);
            setListInfo(response.data);
            updatePageTitle("List: " + response?.data.name);
            setListInfoLoading(false);
        } catch (e) {
            console.log("Error fetching list info:", e);
        }
    };

    const getListTDP = () => {
        setListTDPLoading(true);
        axios.get(`/api/listtdp/${listid}`)
            .then(response => {
                setListTDP(response.data);
                setListTDPLoading(false);
            })
            .catch(error => {
                console.error('Error fetching list TDP!', error);
            });
    };

    const handleShowDetailModal = async (e, partl) => {
		e.preventDefault();
		setDetailPart(partl);
		setShowDetailModal(true);
	}
	const handleCloseDetailModal = () => {
		setDetailPart(null);
		setShowDetailModal(false);
	}
    
    return (
        <>
            <Modal show={showDetailModal} onHide={handleCloseDetailModal} className="wide-modal">
                <Modal.Header closeButton>
                <Modal.Title>{detailPart?.manufacturer} {detailPart?.model} Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
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
            <div className='Page-Content-Container'>
                { configuratorLoading ? 
                    (
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    ) : (
                        <table className='Table-Base'>
                            <thead>
                                <tr>
                                    <th>Component</th>
                                    <th>Name</th>
                                    <th>Brand</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parts.map((part, index) => (
                                    <tr key={index} className='Table-Base-TR'>
                                        <td><strong>{part.name}</strong></td>
                                        <td><Link className="btn text-primary" onClick={(e) => handleShowDetailModal(e, part)}>{part.model}</Link></td>
                                        <td>{part.manufacturer}</td>
                                        <td>{part.quantity}</td>
                                        <td>${(part.price * part.quantity).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                }
                
            </div>
            <div className='Page-Content-Container Spacer'>
                 <div className='Bottom-Info-Container'>
                    { listInfoLoading || listTDPLoading ?
                        (
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        ) : (
                            <>
                                <div className='Bottom-Info'>
                                    <span>Price: ${listInfo.totalprice}</span>
                                    <span>TDP: {listTDP.sum_tdp} W</span>
                                </div>
                                {listInfo.description !== '' ? (
                                        <span className='Info-Desc'>{listInfo?.description}</span>
                                    ) : (
                                        null
                                )}
                            </>
                        )
                    }
                </div>
            </div>
        </>
    )
};
export default ListViewer;