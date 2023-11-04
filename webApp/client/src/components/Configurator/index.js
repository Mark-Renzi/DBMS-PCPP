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
    }, []);

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
    
                console.log(newParts);
                setParts(newParts);
                setListLoading(false);
            })
            .catch(error => {
                console.error('Error fetching parts list!', error);
                setListLoading(false);
            });
    };
    
    const changeQuantity = (index, newQuantity) => {
        // This function should update the quantity of the part
        // in the parts state and then make an API call to update
        // the quantity in the database if needed
        // For now, it just updates the local state
        const updatedParts = [...parts];
        updatedParts[index] = { ...updatedParts[index], quantity: newQuantity };
        setParts(updatedParts);
    };

    const deletePart = (partid) => {
        axios.delete(`/api/deletepart/${listid}`, { data: { partid } })
            .then(() => {
                // Remove the part from the UI after successful deletion
                const updatedParts = parts.filter(part => part.partid !== partid);
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
                <td>{part.price ? `$${part.price}` : ''}</td>
                {part.model && (
                    <td className="text-center">
                        <FontAwesomeIcon icon={faTrash} className="text-danger trash-icon" onClick={() => deletePart(part.partid)} title='Remove this part from the list'/>
                    </td>
                )}
            </tr>
        );
    };
    

    return (
        <>
            <h1>Configurator</h1>
            <table id="part-table">
                <thead>
                    <tr>
                        <th>Component</th>
                        <th>Name</th>
                        <th>Manufacturer</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {parts.map(renderRow)}
                </tbody>
            </table>
        </>
    )
};

export default Configurator;
