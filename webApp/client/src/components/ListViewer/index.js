import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

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
    const { listid } = useParams();

    useEffect(() => {
      getPartsList();
      getListInfo();
      getListTDP();
  }, []);

  const getPartsList = () => {
    axios.get(`/api/publicbuild/${listid}`)
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
        })
        .catch(error => {
            console.error('Error fetching parts list!', error);
        });
      };

      const getListInfo = () => {
        axios.get(`/api/listinfo/${listid}`)
            .then(response => {
                setListInfo(response.data);
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
    };
    
    return (
        <>
            {/* <h1>{listInfo.name}</h1> */}
            <div className='Page-Content-Container'>
                <table className='Table-Base'>
                    <thead>
                        <tr>
                            <th>Component</th>
                            <th>Name</th>
                            <th>Manufacturer</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parts.map((part, index) => (
                            <tr key={index} className='Table-Base-TR'>
                                <td id='TD-Start'><strong>{part.name}</strong></td>
                                <td>{part.model}</td>
                                <td>{part.manufacturer}</td>
                                <td id='TD-End'>{part.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='Page-Content-Container Spacer'>
                 <div className='Bottom-Info-Container'>
                    <div className='Bottom-Info'>
                        <span>Price: ${listInfo.totalprice}</span>
                        <span>TDP: {listTDP.sum_tdp} W</span>
                    </div>
                    {listInfo.description !== '' ? (
                            <span className='Info-Desc'>{listInfo.description}</span>
                        ) : (
                            null
                    )}
                </div>
            </div>
        </>
    )
};
export default ListViewer;