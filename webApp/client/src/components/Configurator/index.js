import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { useParams } from 'react-router-dom';

const Configurator = () => {
  const componentNames = ["CPU", "CPU Cooler", "Motherboard", "Memory", "Graphics Card", "Storage", "Case", "Power Supply"];
  const [parts, setParts] = useState([]);
  const { listid } = useParams();

  useEffect(() => {
    getPartsList();
  }, []);

  const addComponent = (index) => {
    window.location.href = `http://localhost:3000/browse/${index}`;
  };

  const getPartsList = () => {
    axios.get(`/api/configurator/${listid}`)
      .then(response => {
        const partsList = componentNames.map((componentName, index) => {
          if (Object.keys(response.data[index]).length !== 0) {
            const part = response.data[index];
            return (
              <tr key={index}>
                <td>{componentName}</td>
                <td>{part.model}</td>
                <td>{part.manufacturer}</td>
                <td>${part.price}</td>
              </tr>
            );
          } 
          else {
            return (
              <tr key={index}>
                <td>{componentName}</td>
                <td>
                  <button onClick={() => addComponent(index)}> + Choose {componentName}</button>
                </td>
                <td></td>
                <td></td>
              </tr>
            );
          }
        });
        setParts(partsList);
      })
      .catch(error => {
        console.error('Error fetching user list!', error);
      });
  }

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
          {parts}
        </tbody>
      </table>
    </>
  )
};

export default Configurator;
