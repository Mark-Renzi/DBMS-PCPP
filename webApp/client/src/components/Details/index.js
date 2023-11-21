import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles.css';
import { Link } from 'react-router-dom';

const Details = ({ partid }) => {
    const [specs, setSpecs] = useState({});
    const [benchmarks, setBenchmarks] = useState({});
    const [partLists, setPartLists] = useState({});

    console.log(partid)

    const benchmarkTypes = {
        0: 'G3Dmark',
        1: 'G2Dmark',
        2: 'CUDA',
        3: 'Metal',
        4: 'OpenCL',
        5: 'Vulkan',
        6: 'PassMarkGPU',
        7: 'CPUMark',
        8: 'ThreadMark',
        9: 'R23SingleScore',
        10: 'R23MultiScore',
        11: 'PassMarkCPU'
    };

    const formFactors = {
        0: 'ATX',
        1: 'Micro ATX',
        2: 'Mini ITX',
        3: 'EATX',
        4: 'ATX Mid Tower',
        5: 'MicroATX Mini Tower',
        6: 'ATX Full Tower',
        7: 'MicroATX Mid Tower',
        8: 'Mini ITX Desktop',
        9: 'Mini ITX Tower',
        10: 'HTPC',
        11: 'ATX Mini Tower',
        12: 'ATX Desktop',
        13: 'MicroATX Slim',
        14: 'MicroATX Desktop',
        15: 'ATX Test Bench',
        16: 'SFX',
        17: 'TFX',
        18: 'Flex ATX'
    };

    const psuEfficiency = {
        0: 'Gold',
        1: 'Bronze',
        2: 'Platinum',
        3: 'Plus',
        4: 'Not Rated',
        5: 'Titanium',
        6: 'Silver'
    };

    const modular = {
        0: 'Full',
        1: 'Not Modular',
        2: 'Semi'
    };

    useEffect(() => {
        axios.get(`/api/details/${partid}`)
        .then((response) => {
            setSpecs(response.data);
        })
        .catch((error) => {
            console.error('Error fetching part details:', error);
        });
    }, []);

    useEffect(() => {
        if (specs.parttype === 0 || specs.parttype === 4) {
            axios.get(`/api/benchmarks/${parseInt(specs.chipsetid)}`)
            .then((response) => {
                setBenchmarks(response.data);
            })
            .catch((error) => {
                console.error('Error fetching benchmarks:', error);
            });
        }
    }, [specs, partid]);

    useEffect(() => {
        axios.get(`/api/listswithpart/${partid}`)
        .then((response) => {
            setPartLists(response.data);
            console.log(response.data);
        })
        .catch((error) => {
            console.error('Error fetching part details:', error);
        });
    }, []);

    const formatSpecs = (specs) => {
        switch(specs.parttype) {
            case 0:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Cores</dt><dd>{specs.cores}</dd>
                        <dt>Core Clock</dt><dd>{specs.coreclock} MHz</dd>
                        {specs.boostclock && <><dt>Boost Clock</dt><dd>{specs.boostclock} MHz</dd></>}
                        {specs.graphics && <><dt>Graphics</dt><dd>{specs.graphics}</dd></>}
                        {specs.socket && <><dt>Socket</dt><dd>{specs.socket}</dd></>}
                        <dt>TDP</dt><dd>{specs.tdp} W</dd>
                        {specs.smt && <><dt>SMT</dt><dd>{specs.smt}</dd></>}
                    </div>
                );
            case 1:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>RPM</dt><dd>{specs.rpm_min} - {specs.rpm_max} RPM</dd>
                        <dt>Noise Level</dt><dd>{specs.noiselevel_min === specs.noiselevel_max ? `${specs.noiselevel_min} dB` : `${specs.noiselevel_min} - ${specs.noiselevel_max} dB`}</dd>
                        <dt>Color</dt><dd>{specs.color}</dd>
                        {specs.size && <><dt>Size</dt><dd>{specs.size}</dd></>}
                    </div>
                );
            case 2:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Socket</dt><dd>{specs.socket}</dd>
                        <dt>Memory Slots</dt><dd>{specs.memoryslots}</dd>
                        <dt>Max Memory</dt><dd>{specs.maxmemory}</dd>
                        <dt>Form Factor</dt><dd>{formFactors[specs.formfactor]}</dd>
                        <dt>Color</dt><dd>{specs.color}</dd>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Configuration</dt><dd>{specs.count} x {specs.capacity} GB</dd>
                        <dt>Total Capacity</dt><dd>{specs.totalcapacity} GB</dd>
                        <dt>Generation</dt><dd>DDR{specs.ddr}</dd>
                        <dt>Clock Speed</dt><dd>{specs.mhz} MHz</dd>
                        <dt>CAS Latency</dt><dd>{specs.cas}</dd>
                        <dt>First Word Latency</dt><dd>{specs.firstword}</dd>
                        <dt>Color</dt><dd>{specs.color}</dd>
                        <dt>Price Per GB</dt><dd>${specs.pricepergb}</dd>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Memory</dt><dd>{specs.memory}</dd>
                        <dt>Core Clock</dt><dd>{specs.coreclock} MHz</dd>
                        <dt>Boost Clock</dt><dd>{specs.boostclock} MHz</dd>
                        <dt>Length</dt><dd>{specs.length} mm</dd>
                        <dt>Color</dt><dd>{specs.color}</dd>
                        <dt>TDP</dt><dd>{specs.tdp} W</dd>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Capacity</dt><dd>{specs.capacity}</dd>
                        <dt>Type</dt><dd>{Number(specs.type) === 0 ? 'Solid-State Drive' : 'Hard Drive'}</dd>
                        <dt>Form Factor</dt><dd>{specs.formfactor}</dd>
                        <dt>Interface</dt><dd>{specs.interface}</dd>
                        <dt>Cache</dt><dd>{specs.cache}</dd>
                        <dt>Price Per GB</dt><dd>{specs.pricepergb}</dd>
                    </div>
                );
            case 6:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Form Factor</dt><dd>{formFactors[specs.formfactor]}</dd>
                        <dt>Color</dt><dd>{specs.color}</dd>
                        <dt>Storage Bays</dt><dd>{specs.storagebays}</dd>
                        {specs.sidepanel && <><dt>Side Panel</dt><dd>{specs.sidepanel}</dd></>}
                        {specs.psu && <><dt>PSU</dt><dd>{specs.psu}</dd></>}
                        <dt>Volume</dt><dd>{specs.size} L</dd>
                    </div>
                );
            case 7:
                return (
                    <div>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Price</dt><dd>${specs.price}</dd>
                        <dt>Manufacturer</dt><dd>{specs.manufacturer}</dd>
                        <dt>Model</dt><dd>{specs.model}</dd>
                        <dt>Form Factor</dt><dd>{formFactors[specs.formfactor]}</dd>
                        <dt>Wattage</dt><dd>{specs.wattage} W</dd>
                        <dt>Efficiency</dt><dd>{psuEfficiency[specs.efficiency]}</dd>
                        <dt>Modular</dt><dd>{modular[specs.modular]}</dd>
                        {specs.color && <><dt>Color</dt><dd>{specs.color}</dd></>}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <h1>{specs.manufacturer} {specs.model}</h1>

            <dl>
            <div className="details-container">
                <div className="details">
                    <h2>Specifications</h2>
                    {formatSpecs(specs)}
                </div>
                <div>
                    {(() => {
                        if (specs.parttype === 0 || specs.parttype === 4) {
                            if (benchmarks.length > 0) {
                                return <h2>Benchmarks</h2>;
                            }
                        }
                        return null;
                    })()}
                    {(specs.parttype === 0 || specs.parttype === 4) && benchmarks.length > 0 && benchmarks.map((benchmark, index) => (
                        <div key={index} className="spec">
                            <dt>{benchmarkTypes[benchmark.type]}</dt>
                            <dd>{benchmark.score}</dd>
                        </div>
                    ))}
                </div>
            </div>
            </dl>
            {partLists.length > 0 && (
            <div>
                <h2>Lists Using Part</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {partLists.map((list, index) => (
                            <tr key={index}>
                                <td><Link to={`/lists/${list.listid}`}>{list.name}</Link></td>
                                <td>{list.description}</td>
                                <td>{list.totalprice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
        </div>
    );
};

export default Details;