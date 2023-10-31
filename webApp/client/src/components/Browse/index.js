import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import Pagination from 'react-bootstrap/Pagination';
import Modal from 'react-bootstrap/Modal';
import NumberInput from '../NumberInput/NumberInput';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const Browse = () => {
	const [part, setPart] = useState('GPU');
	const [benchType, setBenchType] = useState(0);
	const [benchName, setBenchName] = useState('G3Dmark');
	const [partsList, setPartsList] = useState([]);
	const [listLoading, setListLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [showEllipseModal, setShowEllipseModal] = useState(false);
	const [enteredPage, setEnteredPage] = useState(1);
	const [totalResultNum, setTotalResultNum] = useState(0);
	
	const pageSize = 20;
	const { id } = useParams();

	useEffect(() => {
		onSubmit();
	}, []);

	useEffect(() => {
		onSubmit();
	}, [part, benchType, currentPage]);



	const onChangePartType = (partType) => {
		setPart(partType);
		if (partType === 'GPU') {
			setBenchType(0);
			setBenchName('G3Dmark');
		} else {
			setBenchType(7);
			setBenchName('CPUMark');
		}
		setCurrentPage(1);
	}

	const onChangeBenchType = (benchType, benchName) => {
		setBenchType(benchType);
		setBenchName(benchName);
		setCurrentPage(1);
	}

	const onSubmit = async () => {
		setListLoading(true);
		const url = "/api/benchmarks";
		const data = { partType: part, benchType: benchType, pageNumber: currentPage, limitNumber: pageSize };
		let response;
		try {
			response = await axios.post(url, data);
			setPartsList(response?.data?.benchmarks);
			setTotalResultNum(response?.data?.totalResultNum);
			setListLoading(false);
		} catch (e) {
			console.log(e)
		}
	}

	const onhandleNext = () => {
        let nextPageNumber = Math.min(currentPage + 1, Math.ceil(totalResultNum / pageSize));
        setCurrentPage(nextPageNumber);
    }
    const onhandlePrev = () => {
        let prevPageNumber = Math.max(currentPage - 1, 1);
        setCurrentPage(prevPageNumber);
    }
	const calcPagesToShow = () => {
        let start = Math.max(currentPage - 2, 1);
        let end = Math.min(start + 4, Math.ceil(totalResultNum / pageSize));
        start = Math.max(end - 4, 1);
        let pageList = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        if (currentPage > 3 && Math.ceil(totalResultNum / pageSize) > 5) {
            pageList.unshift(1);
        }
        return pageList;
    }
	const handleModalClose = () => {
        setShowEllipseModal(false);
    }
    const handlePageSubmit = () => {
        let newPage = Math.max(1, Math.min(parseInt(enteredPage), Math.ceil(totalResultNum / pageSize)));
        setCurrentPage(newPage);
        setShowEllipseModal(false);
    }
	const handleEllipseClick = () => {
        setShowEllipseModal(true);
    }

	return (
		<>
			<Modal show={showEllipseModal} onHide={handleModalClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Enter Page Number</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <NumberInput enteredValue={enteredPage} setEnteredValue={setEnteredPage} onHandleSubmit={handlePageSubmit}/>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                    <Button variant="primary" onClick={handlePageSubmit}>Go to page</Button>
                </Modal.Footer>
            </Modal>

			<div className="p-1">
				<h1>
					Price-Performance Leaderboard
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
									<Dropdown.Item onClick={() => onChangePartType('CPU')}>CPU</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('CPUCooler')}>CPUCooler</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('Motherboard')}>Motherboard</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('RAM')}>RAM</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('GPU')}>GPU</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('Storage')}>Storage</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('Tower')}>Tower</Dropdown.Item>
									<Dropdown.Item onClick={() => onChangePartType('PSU')}>PSU</Dropdown.Item>
								</Dropdown.Menu>
							</Dropdown>
						</div>
						<div className="vertical-group">
							<p>
								Benchmark Type:
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

					<div className='table-scroll'>
						<table className="priceperformance-table">
							<thead>
								<tr>
									<th>Rank</th>
									<th>Manufacturer</th>
									<th>Model</th>
									{ part !== "CPU" ? <th>Chipset</th> : <th></th> }
									<th>Score</th>
									<th>Price</th>
									<th>Perf/Price Ratio</th>
								</tr>
							</thead>
							<tbody>
								{listLoading ?
									<tr className='row-hover'>
										<td className='table-spinner-container' colSpan='7'>
											<div className='table-spinner'>
												<Spinner animation="border" role="status">
													<span className="visually-hidden">Loading...</span>
												</Spinner>
											</div>
										</td>
									</tr>
									:
									<>
										{partsList.map((partl, index) => (
											<tr className='row-hover' key={partl.partid}>
    											<td>{(currentPage - 1) * pageSize + index + 1}</td>
												<td>{partl.manufacturer}</td>
												<td>{partl.model}</td>
												{ part !== "CPU" ? <td>{partl.chipset}</td> : <td></td> }
												<td>{partl.score}</td>
												<td>{partl.price}</td>
												<td>{parseFloat(partl.priceperformance).toFixed(4)}</td>
											</tr>
										))}
									</>
								}
							</tbody>
						</table>
						<Pagination>
							<div className="pagination-organize">
								<Pagination.Prev onClick={onhandlePrev} disabled={currentPage === 1} />
								{
									calcPagesToShow().map(page =>
										<Pagination.Item key={page} active={page === currentPage} onClick={() => setCurrentPage(page)}>{page}</Pagination.Item>
									)
								}
								{Math.ceil(totalResultNum / pageSize) > 5 && <Pagination.Ellipsis onClick={handleEllipseClick} />}
								{Math.ceil(totalResultNum / pageSize) > 5 && currentPage < Math.ceil(totalResultNum / pageSize) - 2 && <Pagination.Item onClick={() => setCurrentPage(Math.ceil(totalResultNum / pageSize))}>{Math.ceil(totalResultNum / pageSize)}</Pagination.Item>}
								<Pagination.Next onClick={onhandleNext} disabled={currentPage === Math.ceil(totalResultNum / pageSize)} />
							</div>
						</Pagination>
					</div>
				</div>
			</div>
		</>
	)
}

export default Browse;