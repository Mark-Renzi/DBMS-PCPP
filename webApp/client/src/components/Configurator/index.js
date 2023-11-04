import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useParams } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';

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
        window.location.href = `http://localhost:3000/browse/${index}`;
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
    

    const renderRow = (part, index) => {
        if (listLoading) {
            return (
                <tr key={index} className='config-row'>
                    <td>{componentNames[index]}</td>
                    <td colSpan="3" className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </td>
                </tr>
            );
        }
    
        return (
            <tr key={index} className='config-row'>
                <td>{part.name}</td>
                <td>{part.model || <button onClick={() => addComponent(index)}> + Choose {part.name}</button>}</td>
                <td>{part.manufacturer || ''}</td>
                <td>{part.price ? `$${part.price}` : ''}</td>
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
                        <th>Price</th>
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
