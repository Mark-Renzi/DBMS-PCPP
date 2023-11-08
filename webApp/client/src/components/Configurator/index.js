import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useParams } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Configurator = () => {
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
    const { listid } = useParams();

    useEffect(() => {
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
                setListLoading(false);
            });
    };

    const getListInfo = () => {
        setListInfoLoading(true);
        axios.get(`/api/listinfo/${listid}`)
            .then(response => {
                setListInfo(response.data);
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
    
    const changeQuantity = (index, newQuantity) => {
        const updatedParts = [...parts];
        const partToUpdate = updatedParts[index];
    
        partToUpdate.quantity = newQuantity;
        setParts(updatedParts);
    
        axios.put(`/api/updatequantity/${listid}`, {
            partid: partToUpdate.partid,
            quantity: newQuantity
        })
        .then(response => {
            // console.log(response);
        })
        .catch(error => {
            console.error('Error updating quantity!', error);
            // reset the quantity to its original value in case of error?
        });
    };
    

    const deletePart = (partid) => {
        axios.delete(`/api/deletepart/${listid}`, { data: { partid } })
            .then(() => {
                const updatedParts = parts.map(part => {
                    if (part.partid === partid) {
                        return { ...part, model: null, manufacturer: null, price: null, quantity: 1 }; // Reset part details
                    }
                    return part;
                });
                setParts(updatedParts);
            })
            .catch(error => {
                console.error('Error deleting part!', error);
            });
    };
    
    const renderRow = (part, index) => {
        if (listLoading) {
            return (
                <tr key={index} className='config-row'>
                    <td>{componentNames[index]}</td>
                    <td colSpan="5" className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </td>
                </tr>
            );
        }
    
        const quantityOptions = Array.from({ length: 9 }, (_, i) => i + 1).map(num => (
            <option key={num} value={num}>{num}</option>
        ));

        return (
            <tr key={index} className='config-row'>
                <td>{part.name}</td>
                <td>{part.model || <button onClick={() => addComponent(index)}> + Choose {part.name}</button>}</td>
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
                <td>{part.price ? `$${part.price * part.quantity}` : ''}</td>
                {part.model ?
                    (
                        <td className="text-center">
                            <FontAwesomeIcon icon={faTrash} className="text-danger trash-icon" onClick={() => deletePart(part.partid)} title='Remove this part from the list'/>
                        </td>
                    )
                :
                    <td></td>
                }
            </tr>
        );
    };
    

    return (
        <>            
            { listInfo.name ? 
                <h2>{listInfo.name}</h2>
            :
                <h2>Configurator</h2>
            }
            <table id="part-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Name</th>
                        <th>Manufacturer</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map(renderRow)}
                </tbody>
            </table>
            <div>
                {listInfoLoading ?
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                :
                    <div>
                        <div><p><strong>PSU Wattage: </strong>{listTDP.wattage} W</p></div>
                        <div><p><strong>CPU + GPU TDP: </strong>{listTDP.sum_tdp} W</p></div>
                        <p><strong>Total Price:</strong> ${listInfo.totalprice}</p>
                        <p>{listInfo.description}</p>
                    </div>
                }
            </div>

        </>
    )
};

export default Configurator;
