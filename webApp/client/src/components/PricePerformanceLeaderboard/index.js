import React, { Component, useState, useEffect } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const PricePerformanceLeaderboard = () => {
  const [part, setPart] = useState('GPU');
  const [benchType, setBenchType] = useState(0);
  const [benchName, setBenchName] = useState('G3Dmark');
  const [partsList, setPartsList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  useEffect(() => {
    onSubmit();
  }, []);

  useEffect(() => {
    onSubmit();
  }, [part, benchType]);



  const onChangePartType = (partType) => {
    setPart(partType);
    if (partType === 'GPU') {
      setBenchType(0);
      setBenchName('G3Dmark');
    } else {
      setBenchType(7);
      setBenchName('CPUMark');
    }
  }

  const onChangeBenchType = (benchType, benchName) => {
    setBenchType(benchType);
    setBenchName(benchName);
  }

  const onSubmit = async () => {
    setListLoading(true);
    const url = "api/benchmarks";
    const data = { partType: part, benchType: benchType, pageNumber: 0, limitNumber: 100 };
    let response;
    try {
      response = await axios.post(url, data);
      console.log(response?.data);
      setPartsList(response?.data);
      setListLoading(false);
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="">
      <h1>
        Price/Performance Leaderboard
      </h1>
      <div>
        <div className="horizontal-group selection-list">
          <div className="vertical-group">
            <p>
              Computer part:
            </p>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {part}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => onChangePartType('GPU')}>GPU</Dropdown.Item>
                <Dropdown.Item onClick={() => onChangePartType('CPU')}>CPU</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <div className="vertical-group">
            <p>
              Computer part:
            </p>
            <Dropdown>
              <Dropdown.Toggle variant="success" id="dropdown-basic">
                {benchName}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {part === 'GPU' ? 
                  <>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(0, e.target.innerHTML)}>G3Dmark</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(1, e.target.innerHTML)}>G2Dmark</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(2, e.target.innerHTML)}>CUDA</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(3, e.target.innerHTML)}>Metal</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(4, e.target.innerHTML)}>OpenCL</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(5, e.target.innerHTML)}>Vulkan</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(6, e.target.innerHTML)}>PassMark</Dropdown.Item>
                  </>
                :
                  <>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(7, e.target.innerHTML)}>CPUMark</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(8, e.target.innerHTML)}>ThreadMark</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(9, e.target.innerHTML)}>Cinebench R23 Single Score</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(10, e.target.innerHTML)}>Cinebench R23 Multi Score</Dropdown.Item>
                    <Dropdown.Item onClick={(e) => onChangeBenchType(11, e.target.innerHTML)}>PassMark</Dropdown.Item>
                  </>
                }
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Manufacturer</th>
              <th>Model</th>
              <th>Name</th>
              <th>Score</th>
              <th>Price</th>
              <th>Price/Performance Ratio</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? 
              <tr>
                <td>
                  Loading...
                </td>
              </tr>
            :
              <>
                {partsList.map(part =>( 
                  <tr key={part.partid}>
                    <td>{part.manufacturer}</td>
                    <td>{part.model}</td>
                    <td>{part.name}</td>
                    <td>{part.score}</td>
                    <td>{part.price}</td>
                    <td>{part.priceperformance}</td>
                  </tr>
                ))}
              </>
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PricePerformanceLeaderboard;