import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';

const Configurator = () => {
  const componentNames = ["CPU", "CPU Cooler", "Motherboard", "Memory", "Graphics Card", "Storage", "Case"];
  const [parts, setParts] = useState([]);

  useEffect(() => {
    getPartsList();
  }, []);

  const addComponent = (componentName) => {
    alert(`${componentName}`);
  };

  const getPartsList = () => {
    axios.get('/api/configurator')
      .then(response => {
        const partsList = componentNames.map((componentName, index) => {
          if (Object.keys(response.data[index]).length !== 0) {
            const part = response.data[index];
            return (
              <tr key={index}>
                <td>{componentName}</td>
                <td>{part.model}</td>
                <td>{part.manufacturer}</td>
                <td>{part.price}</td>
              </tr>
            );
          } 
          else {
            return (
              <tr key={index}>
                <td>{componentName}</td>
                <td>
                  <button onClick={() => addComponent(componentName)}> + Choose {componentName}</button>
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
      <table>
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
