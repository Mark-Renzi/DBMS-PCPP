import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import './styles.css';

const Details = ({ partid }) => {
    const [specs, setSpecs] = useState({});
    const [benchmarks, setBenchmarks] = useState({});
    const [partLists, setPartLists] = useState({});
    const [specsLoading, setSpecsLoading] = useState(false);
    const [benchmarksLoading, setBenchmarksLoading] = useState(false);
    const [partListsLoading, setPartListsLoading] = useState(false);

    if (!partid) {
        partid = useParams().partid;
        if (!partid) {
            return (
                <div>
                    <h1>Invalid Part ID</h1>
                </div>
            );
        }
    }

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
        setSpecsLoading(true);
        axios.get(`/api/details/${partid}`)
        .then((response) => {
            setSpecs(response.data);
            setSpecsLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching part details:', error);
        });
    }, []);

    useEffect(() => {
        if (specs.parttype === 0 || specs.parttype === 4) {
            setBenchmarksLoading(true);
            axios.get(`/api/benchmarks/${parseInt(specs.chipsetid)}`)
            .then((response) => {
                setBenchmarks(response.data);
                setBenchmarksLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching benchmarks:', error);
            });
        }
    }, [specs, partid]);

    useEffect(() => {
        setPartListsLoading(true);
        axios.get(`/api/listswithpart/${partid}`)
        .then((response) => {
            setPartLists(response.data);
            setPartListsLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching part details:', error);
        });
    }, []);

    const formatSpecs = (specs) => {
        if (specsLoading) {
            return (<Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>);
        }
        
        switch(specs.parttype) {
            case 0:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Cores:</dt><dd>{specs.cores}</dd></div>
                        <div className='next-to'><dt>Core Clock:</dt><dd>{specs.coreclock} MHz</dd></div>
                        <div className='next-to'>{specs.boostclock && <><dt>Boost Clock:</dt><dd>{specs.boostclock} MHz</dd></>}</div>
                        <div className='next-to'>{specs.graphics && <><dt>Graphics:</dt><dd>{specs.graphics}</dd></>}</div>
                        <div className='next-to'>{specs.socket && <><dt>Socket:</dt><dd>{specs.socket}</dd></>}</div>
                        <div className='next-to'><dt>TDP:</dt><dd>{specs?.tdp || "Unknown"} W</dd></div>
                        {specs.smt !== null && specs.smt !== "" && (
                            <div className='next-to'>
                                {specs.smt && (
                                <>
                                    <dt>SMT:</dt>
                                    <dd>{specs.smt ? 'True' : 'False'}</dd>
                                </>
                                )}
                            </div>
                        )}
                    </div>
                );
            case 1:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>RPM:</dt><dd>{specs.rpm_min} - {specs.rpm_max} RPM</dd></div>
                        <div className='next-to'><dt>Noise Level:</dt><dd>{specs.noiselevel_min === specs.noiselevel_max ? `${specs.noiselevel_min} dB` : `${specs.noiselevel_min} - ${specs.noiselevel_max} dB`}</dd></div>
                        <div className='next-to'><dt>Color:</dt><dd>{specs.color}</dd></div>
                        <div className='next-to'>{specs.size && <><dt>Size:</dt><dd>{specs.size}</dd></>}</div>
                    </div>
                );
            case 2:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Socket:</dt><dd>{specs.socket}</dd></div>
                        <div className='next-to'><dt>Memory Slots:</dt><dd>{specs.memoryslots}</dd></div>
                        <div className='next-to'><dt>Max Memory:</dt><dd>{specs.maxmemory}</dd></div>
                        <div className='next-to'><dt>Form Factor:</dt><dd>{formFactors[specs.formfactor]}</dd></div>
                        <div className='next-to'><dt>Color:</dt><dd>{specs.color}</dd></div>
                    </div>
                );
            case 3:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Configuration:</dt><dd>{specs.count} x {specs.capacity} GB</dd></div>
                        <div className='next-to'><dt>Total Capacity:</dt><dd>{specs.totalcapacity} GB</dd></div>
                        <div className='next-to'><dt>Generation:</dt><dd>DDR{specs.ddr}</dd></div>
                        <div className='next-to'><dt>Clock Speed:</dt><dd>{specs.mhz} MHz</dd></div>
                        <div className='next-to'><dt>CAS Latency:</dt><dd>{specs.cas}</dd></div>
                        <div className='next-to'><dt>First Word Latency:</dt><dd>{specs.firstword}</dd></div>
                        <div className='next-to'><dt>Color:</dt><dd>{specs.color}</dd></div>
                        <div className='next-to'><dt>Price Per GB:</dt><dd>${specs.pricepergb}</dd></div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Memory:</dt><dd>{specs.memory} GB</dd></div>
                        <div className='next-to'><dt>Core Clock:</dt><dd>{specs.coreclock} MHz</dd></div>
                        <div className='next-to'><dt>Boost Clock:</dt><dd>{specs.boostclock} MHz</dd></div>
                        <div className='next-to'><dt>Length:</dt><dd>{specs.length} mm</dd></div>
                        <div className='next-to'><dt>Color:</dt><dd>{specs.color}</dd></div>
                        <div className='next-to'><dt>TDP:</dt><dd>{specs?.tdp || "Unknown"} W</dd></div>
                    </div>
                );
            case 5:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Capacity:</dt><dd>{specs.capacity} GB</dd></div>
                        <div className='next-to'><dt>Type:</dt><dd>{Number(specs.type) === 0 ? 'Solid-State Drive' : 'Hard Drive'}</dd></div>
                        <div className='next-to'><dt>Form Factor:</dt><dd>{specs.formfactor}</dd></div>
                        <div className='next-to'><dt>Interface:</dt><dd>{specs.interface}</dd></div>
                        <div className='next-to'><dt>Cache:</dt><dd>{specs.cache}</dd></div>
                        <div className='next-to'><dt>Price Per GB:</dt><dd>{specs.pricepergb}</dd></div>
                    </div>
                );
            case 6:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Form Factor:</dt><dd>{formFactors[specs.formfactor]}</dd></div>
                        <div className='next-to'><dt>Color:</dt><dd>{specs.color}</dd></div>
                        <div className='next-to'><dt>Storage Bays:</dt><dd>{specs.storagebays}</dd></div>
                        <div className='next-to'>{specs.sidepanel && <><dt>Side Panel:</dt><dd>{specs.sidepanel}</dd></>}</div>
                        <div className='next-to'>{specs.psu && <><dt>PSU:</dt><dd>{specs.psu}</dd></>}</div>
                        <div className='next-to'><dt>Volume:</dt><dd>{specs.size} L</dd></div>
                    </div>
                );
            case 7:
                return (
                    <div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Price:</dt><dd>${specs.price}</dd></div>
                        <div className='next-to'><dt>Manufacturer:</dt><dd>{specs.manufacturer}</dd></div>
                        <div className='next-to'><dt>Model:</dt><dd>{specs.model}</dd></div>
                        <div className='next-to'><dt>Form Factor:</dt><dd>{formFactors[specs.formfactor]}</dd></div>
                        <div className='next-to'><dt>Wattage:</dt><dd>{specs.wattage} W</dd></div>
                        <div className='next-to'><dt>Efficiency:</dt><dd>{psuEfficiency[specs.efficiency]}</dd></div>
                        <div className='next-to'><dt>Modular:</dt><dd>{modular[specs.modular]}</dd></div>
                        <div className='next-to'>{specs.color && <><dt>Color:</dt><dd>{specs.color}</dd></>}</div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    return (
        <div className='details-body-container'>
            {/* <h1>{specs.manufacturer} {specs.model}</h1> */}
            <dl className='Specs-Bench'>
                <div className="details-cell details">
                    <h2 className='text-center'>Specifications</h2>
                    <hr className='hr-line divider' />
                    {formatSpecs(specs)}
                </div>
                {(() => {
                    if (benchmarks.length > 0) {
                        return <div className='details-cell details'>
                                    {(() => {
                                        if (specs.parttype === 0 || specs.parttype === 4) {
                                            if (benchmarks.length > 0) {
                                                return <h2 className='text-center'>Benchmarks</h2>
                                            }
                                        }
                                        return null;
                                    })()}
                                    <div>
                                        <hr className='hr-line divider'/>
                                        { benchmarksLoading ? 
                                            <Spinner animation="border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                            :
                                            <>
                                                { benchmarks.length > 0 && benchmarks.map((benchmark, index) => (
                                                    <div key={index} className="spec next-to">
                                                        <dt>{benchmarkTypes[benchmark.type] + ":"}</dt>
                                                        <dd>{benchmark.score}</dd>
                                                    </div>
                                                ))}
                                            </>
                                        }
                                    </div>
                                </div>
                    }
                    return null;
                })()}
            </dl>
            {partListsLoading ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                :
                <>
                    {partLists.length > 0 && (
                        <div className='details-cell'>
                            <h2 className='text-center'>Lists Using Part</h2>
                            <hr className='hr-line divider'/>
                            <table className='Table-Base'>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Total Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {partLists.map((list, index) => (
                                        <tr key={index} className='Table-Base-TR'>
                                            <td><Link className='btn text-primary'
                                            onClick={(e) => {window.location.href = `/lists/${list.listid}`}}
                                            >{list.name}</Link></td>
                                            <td>{list.description}</td>
                                            <td>${list.totalprice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            }
        </div>
    );
};

export default Details;