import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './styles.css';

const Details = () => {
    const { partid } = useParams();
    const [specs, setSpecs] = useState({});
    const [benchmarks, setBenchmarks] = useState({});

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

    return (
        <div>
            <h1>{specs.manufacturer} {specs.model}</h1>

            <dl>
            <div className="details-container">
                <div className="details">
                    <h2>Specifications</h2>
                    {Object.entries(specs).map(([key, value], index) => (
                        key !== 'manufacturer' && key !== 'model' && key !== 'partid' && key !== 'parttype' && key !== 'chipsetid' && value && 
                        (
                            <div key={index} className="spec">
                                <dt>{key}</dt>
                                <dd>{key === 'price' ? `$${value}` : value}</dd>
                            </div>
                        )
                    ))}
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
        </div>
    );
};

export default Details;