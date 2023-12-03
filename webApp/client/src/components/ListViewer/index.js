import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import PageTitleContext from '../../context/pageTitleContext';

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
    
    return (
        <>
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